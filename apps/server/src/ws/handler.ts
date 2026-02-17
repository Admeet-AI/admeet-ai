import { Server as HttpServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { randomUUID } from "crypto";
import { personaAiService } from "../services/persona-ai.js";
import { correctTranscript } from "../services/transcript-corrector.js";
import { supabase } from "../lib/supabase.js";
import { meetingLogger } from "../lib/logger.js";
import type {
  MeetingState,
  WSClientEvent,
  WSServerEvent,
  PersonaThought,
  PersonaSolution,
  Persona,
  ParticipantInfo,
  SharedTranscript,
} from "@admeet/shared";

const DEFAULT_INTERVAL_MS = 30_000;

interface Participant {
  ws: WebSocket;
  id: string;
  displayName: string;
  isAI: boolean;
  avatarUrl?: string;
  joinedAt: number;
}

interface Room {
  meetingId: string;
  projectId: string;
  contextCard: Record<string, unknown>;
  state: MeetingState;
  personas: Persona[];
  participants: Map<string, Participant>;
  recentTranscript: { speakerId: string; speakerName: string; text: string }[];
  thoughts: PersonaThought[];
  solutions: PersonaSolution[];
  summaryTimer: ReturnType<typeof setInterval> | null;
  analysisIntervalMs: number;
  hostId: string | null;
}

const rooms = new Map<string, Room>();
const wsToRoom = new Map<WebSocket, { roomId: string; participantId: string }>();
const wsQueues = new Map<WebSocket, Promise<void>>();

function send(ws: WebSocket, event: WSServerEvent) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(event));
  }
}

function broadcastToRoom(room: Room, event: WSServerEvent, excludeWs?: WebSocket) {
  for (const participant of room.participants.values()) {
    if (!participant.isAI && participant.ws !== excludeWs) {
      send(participant.ws, event);
    }
  }
}

function getParticipantList(room: Room): ParticipantInfo[] {
  return Array.from(room.participants.values()).map((p) => ({
    id: p.id,
    displayName: p.displayName,
    isAI: p.isAI,
    avatarUrl: p.avatarUrl,
    isSpeaking: false,
  }));
}

function createInitialState(title: string, type: string): MeetingState {
  return {
    meetingTitle: title,
    meetingType: type as MeetingState["meetingType"],
    summary: [],
    dynamicFields: {},
    decisions: [],
    actions: [],
    openQuestions: [],
  };
}

function toPersona(row: Record<string, unknown>): Persona {
  return {
    id: row.id as string,
    name: row.name as string,
    role: row.role as string,
    expertise: row.expertise as string[],
    systemPrompt: row.system_prompt as string,
    thoughtCategories: row.thought_categories as Persona["thoughtCategories"],
    signalKeywords: row.signal_keywords as string[],
    stateFields: row.state_fields as Persona["stateFields"],
    isPreset: row.is_preset as boolean,
    createdBy: row.created_by as string | undefined,
    createdAt: row.created_at as string | undefined,
  };
}

export function setupWebSocket(server: HttpServer) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws) => {
    console.log("[WS] Client connected");

    // 메시지 처리를 커넥션별로 직렬화 (race condition 방지)
    ws.on("message", (raw) => {
      const prev = wsQueues.get(ws) || Promise.resolve();
      const next = prev.then(async () => {
        try {
          const event: WSClientEvent = JSON.parse(raw.toString());
          await handleEvent(ws, event);
        } catch (error) {
          console.error("[WS] Message error:", error);
          send(ws, { type: "error", data: { message: "이벤트 처리 실패" } });
        }
      });
      wsQueues.set(ws, next);
    });

    ws.on("close", () => {
      wsQueues.delete(ws);
      handleDisconnect(ws);
      console.log("[WS] Client disconnected");
    });
  });

  console.log("[WS] WebSocket server ready on /ws");
}

function handleDisconnect(ws: WebSocket) {
  const mapping = wsToRoom.get(ws);
  if (!mapping) return;

  const { roomId, participantId } = mapping;
  const room = rooms.get(roomId);
  if (!room) return;

  const participant = room.participants.get(participantId);
  const displayName = participant?.displayName || "Unknown";

  room.participants.delete(participantId);
  wsToRoom.delete(ws);

  broadcastToRoom(room, {
    type: "room:left",
    data: { participantId, displayName },
  });
  broadcastToRoom(room, {
    type: "room:participants",
    data: { participants: getParticipantList(room) },
  });

  // 방에 사람이 없으면 정리
  const humanCount = Array.from(room.participants.values()).filter((p) => !p.isAI).length;
  if (humanCount === 0) {
    if (room.summaryTimer) clearInterval(room.summaryTimer);
    rooms.delete(roomId);
    console.log(`[WS] Room ${roomId} closed (no humans left)`);
  }
}

async function handleEvent(ws: WebSocket, event: WSClientEvent) {
  switch (event.type) {
    case "room:join": {
      const { meetingId, displayName, avatarUrl } = event.data;
      const participantId = randomUUID();

      let room = rooms.get(meetingId);
      if (!room) {
        // 첫 참여자 → 룸 생성
        const { data: meeting } = await supabase
          .from("meetings")
          .select("*, projects(id, context_card)")
          .eq("id", meetingId)
          .single();

        if (!meeting) {
          send(ws, { type: "error", data: { message: "회의를 찾을 수 없음" } });
          return;
        }

        room = {
          meetingId,
          projectId: meeting.projects?.id,
          contextCard: meeting.projects?.context_card || {},
          state: createInitialState(meeting.title, meeting.type),
          personas: [],
          participants: new Map(),
          recentTranscript: [],
          thoughts: [],
          solutions: [],
          summaryTimer: null,
          analysisIntervalMs: DEFAULT_INTERVAL_MS,
          hostId: participantId,
        };
        rooms.set(meetingId, room);
      }

      const participant: Participant = {
        ws,
        id: participantId,
        displayName,
        isAI: false,
        avatarUrl,
        joinedAt: Date.now(),
      };

      room.participants.set(participantId, participant);
      wsToRoom.set(ws, { roomId: meetingId, participantId });

      // DB에 참여자 기록
      await supabase.from("meeting_participants").insert({
        meeting_id: meetingId,
        display_name: displayName,
        is_ai: false,
      });

      // 이 참여자에게 현재 참여자 목록 전송
      send(ws, {
        type: "room:participants",
        data: { participants: getParticipantList(room) },
      });

      // 다른 참여자에게 새 참여자 알림
      broadcastToRoom(
        room,
        {
          type: "room:joined",
          data: {
            participant: {
              id: participantId,
              displayName,
              isAI: false,
              avatarUrl,
              isSpeaking: false,
            },
          },
        },
        ws
      );

      // 기존 state가 있으면 전송
      if (room.state.summary.length > 0) {
        send(ws, { type: "state:update", data: room.state });
      }

      console.log(`[WS] ${displayName} joined room ${meetingId}`);
      break;
    }

    case "room:leave": {
      handleDisconnect(ws);
      break;
    }

    case "meeting:start": {
      const mapping = wsToRoom.get(ws);
      if (!mapping) {
        send(ws, { type: "error", data: { message: "먼저 room:join을 보내세요" } });
        return;
      }

      const room = rooms.get(mapping.roomId);
      if (!room) return;

      // 방장만 시작 가능
      if (room.hostId !== mapping.participantId) {
        send(ws, { type: "error", data: { message: "방장만 회의를 시작할 수 있습니다" } });
        return;
      }

      const { meetingId, personaIds } = event.data;

      // 페르소나 가져오기
      if (personaIds && personaIds.length > 0) {
        const { data: personaRows } = await supabase
          .from("personas")
          .select("*")
          .in("id", personaIds);

        if (personaRows) {
          room.personas = personaRows.map(toPersona);
        }
      }

      // AI 페르소나를 참여자로 추가
      for (const persona of room.personas) {
        const aiParticipant: Participant = {
          ws: null as unknown as WebSocket, // AI는 실제 WS 없음
          id: `ai-${persona.id}`,
          displayName: persona.name,
          isAI: true,
          joinedAt: Date.now(),
        };
        room.participants.set(aiParticipant.id, aiParticipant);

        await supabase.from("meeting_participants").insert({
          meeting_id: meetingId,
          display_name: persona.name,
          is_ai: true,
          persona_id: persona.id,
        });
      }

      // 타이머 시작
      room.summaryTimer = setInterval(
        () => processSummaryAndThought(room),
        room.analysisIntervalMs
      );

      meetingLogger.start(meetingId, room.state.meetingTitle);

      await supabase
        .from("meetings")
        .update({ status: "active" })
        .eq("id", meetingId);

      if (room.personas.length > 0) {
        const meetingPersonas = room.personas.map((p) => ({
          meeting_id: meetingId,
          persona_id: p.id,
        }));
        await supabase.from("meeting_personas").insert(meetingPersonas);
      }

      // 참여자 목록 업데이트 (AI 포함)
      broadcastToRoom(room, {
        type: "room:participants",
        data: { participants: getParticipantList(room) },
      });

      break;
    }

    case "transcript": {
      const mapping = wsToRoom.get(ws);
      if (!mapping) return;

      const room = rooms.get(mapping.roomId);
      if (!room) return;

      const participant = room.participants.get(mapping.participantId);
      if (!participant) return;

      const { text, isFinal } = event.data;

      // 모든 참여자에게 공유 트랜스크립트 브로드캐스트
      const sharedTranscript: SharedTranscript = {
        speakerId: participant.id,
        speakerName: participant.displayName,
        text,
        isFinal,
        timestamp: Date.now(),
      };

      broadcastToRoom(room, {
        type: "transcript:shared",
        data: sharedTranscript,
      });

      if (isFinal && text.trim()) {
        // 1차: 원본 텍스트로 recentTranscript 즉시 저장 (실시간성 유지)
        room.recentTranscript.push({
          speakerId: participant.id,
          speakerName: participant.displayName,
          text,
        });
        meetingLogger.transcript(room.meetingId, `[${participant.displayName}] ${text}`);

        if (room.recentTranscript.length > 15) {
          room.recentTranscript.shift();
        }

        // 2차: AI 보정 (비동기, 원본 브로드캐스트 이후)
        const timestamp = sharedTranscript.timestamp;
        correctTranscript(text)
          .then(({ corrected, meta }) => {
            meetingLogger.aiCall(room.meetingId, meta);

            const finalText = corrected || text;

            // 보정된 텍스트가 원본과 다르면 corrected 이벤트 브로드캐스트
            if (finalText !== text) {
              broadcastToRoom(room, {
                type: "transcript:corrected",
                data: {
                  speakerId: participant.id,
                  timestamp,
                  originalText: text,
                  correctedText: finalText,
                },
              });
            }

            // recentTranscript에 보정된 텍스트 반영 (AI 분석 품질 향상)
            const entry = room.recentTranscript.find(
              (t) => t.speakerId === participant.id && t.text === text
            );
            if (entry) {
              entry.text = finalText;
            }

            // DB에는 보정된 텍스트 저장
            return supabase.from("meeting_events").insert({
              meeting_id: room.meetingId,
              type: "transcript",
              payload: {
                text: finalText,
                originalText: finalText !== text ? text : undefined,
                speakerId: participant.id,
                speakerName: participant.displayName,
              },
            });
          })
          .catch((err) => {
            console.error("[WS] Transcript correction failed:", err);
            // 보정 실패 시 원본으로 DB 저장
            supabase.from("meeting_events").insert({
              meeting_id: room.meetingId,
              type: "transcript",
              payload: { text, speakerId: participant.id, speakerName: participant.displayName },
            });
          });

        await checkSignal(room, text);
      }
      break;
    }

    case "chat:message": {
      const mapping = wsToRoom.get(ws);
      if (!mapping) return;

      const room = rooms.get(mapping.roomId);
      if (!room) return;

      const participant = room.participants.get(mapping.participantId);
      if (!participant) return;

      broadcastToRoom(room, {
        type: "chat:received",
        data: {
          senderId: participant.id,
          senderName: participant.displayName,
          text: event.data.text,
          timestamp: Date.now(),
        },
      });
      break;
    }

    case "meeting:config": {
      const mapping = wsToRoom.get(ws);
      if (!mapping) return;

      const room = rooms.get(mapping.roomId);
      if (!room) return;

      const { analysisInterval } = event.data;
      const intervalMs = Math.max(10_000, Math.min(120_000, analysisInterval * 1000));
      room.analysisIntervalMs = intervalMs;

      if (room.summaryTimer) clearInterval(room.summaryTimer);
      room.summaryTimer = setInterval(
        () => processSummaryAndThought(room),
        intervalMs
      );
      break;
    }

    case "meeting:end": {
      const mapping = wsToRoom.get(ws);
      if (!mapping) return;

      const room = rooms.get(mapping.roomId);
      if (!room) return;

      if (room.summaryTimer) clearInterval(room.summaryTimer);
      meetingLogger.end(room.meetingId);

      await supabase.from("meeting_states").insert({
        meeting_id: room.meetingId,
        state: room.state,
      });

      await supabase
        .from("meetings")
        .update({ status: "ended" })
        .eq("id", room.meetingId);

      // 모든 참여자의 left_at 업데이트
      await supabase
        .from("meeting_participants")
        .update({ left_at: new Date().toISOString() })
        .eq("meeting_id", room.meetingId)
        .is("left_at", null);

      // 모든 참여자의 WS 매핑 정리
      for (const p of room.participants.values()) {
        if (!p.isAI) {
          wsToRoom.delete(p.ws);
        }
      }

      rooms.delete(mapping.roomId);
      break;
    }
  }
}

async function checkSignal(room: Room, latestText: string) {
  const matchedPersona = personaAiService.hasSignalKeyword(latestText, room.personas);
  if (!matchedPersona) return;

  const recentText = room.recentTranscript
    .slice(-5)
    .map((t) => `[${t.speakerName}]: ${t.text}`)
    .join("\n");

  const { result, meta } = await personaAiService.detectSignal(matchedPersona, recentText);
  meetingLogger.aiCall(room.meetingId, meta);

  if (!result.hasSignal || !result.question) return;

  broadcastToRoom(room, {
    type: "persona:analyzing",
    data: { personaId: matchedPersona.id },
  });

  const { result: solutionResult, meta: solutionMeta } =
    await personaAiService.generateSolution(
      matchedPersona,
      result.question,
      recentText,
      room.state,
      room.contextCard
    );
  meetingLogger.aiCall(room.meetingId, solutionMeta);

  const solution: PersonaSolution = {
    id: randomUUID(),
    personaId: matchedPersona.id,
    personaName: matchedPersona.name,
    question: solutionResult.question,
    solution: solutionResult.solution,
    context: solutionResult.context,
    timestamp: Date.now(),
  };

  room.solutions.push(solution);
  broadcastToRoom(room, { type: "persona:solution", data: solution });
  meetingLogger.intervention(room.meetingId, "solution", solution.solution);

  // AI 솔루션을 공유 트랜스크립트에도 추가
  broadcastToRoom(room, {
    type: "transcript:shared",
    data: {
      speakerId: `ai-${matchedPersona.id}`,
      speakerName: matchedPersona.name,
      text: `💡 ${solution.solution}`,
      isFinal: true,
      timestamp: Date.now(),
      isAI: true,
    },
  });

  await supabase.from("meeting_events").insert({
    meeting_id: room.meetingId,
    type: "ai_solution",
    payload: solution,
  });
}

function stringSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const setA = new Set(a.split(""));
  const setB = new Set(b.split(""));
  const intersection = [...setA].filter((c) => setB.has(c)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

function addSummaryIfNew(room: Room, summary: string): boolean {
  if (!summary) return false;
  if (room.state.summary.includes(summary)) return false;
  const lastSummary = room.state.summary[room.state.summary.length - 1];
  if (lastSummary && stringSimilarity(lastSummary, summary) > 0.8) return false;
  room.state.summary.push(summary);
  return true;
}

async function processSummaryAndThought(room: Room) {
  const recentText = room.recentTranscript
    .slice(-5)
    .map((t) => `[${t.speakerName}]: ${t.text}`)
    .join("\n");
  if (!recentText.trim()) return;

  broadcastToRoom(room, { type: "persona:analyzing", data: {} });

  const { result: summaryResult, meta: summaryMeta } =
    await personaAiService.generateSummary(
      room.personas,
      recentText,
      room.state.summary,
      room.state
    );
  meetingLogger.aiCall(room.meetingId, summaryMeta);

  if (summaryResult.summary && addSummaryIfNew(room, summaryResult.summary)) {
    broadcastToRoom(room, {
      type: "summary",
      data: { text: summaryResult.summary },
    });
    meetingLogger.summary(room.meetingId, summaryResult.summary);

    await supabase.from("meeting_events").insert({
      meeting_id: room.meetingId,
      type: "ai_summary",
      payload: { text: summaryResult.summary },
    });
  }

  if (summaryResult.stateUpdate) {
    Object.assign(room.state, summaryResult.stateUpdate);
    broadcastToRoom(room, {
      type: "state:update",
      data: summaryResult.stateUpdate,
    });
  }

  const summaryText = room.state.summary.slice(-2).join(" ");

  for (const persona of room.personas) {
    const thoughtResult = await personaAiService.generateThought(
      persona,
      summaryText,
      recentText,
      room.state,
      room.contextCard
    );

    if (thoughtResult) {
      meetingLogger.aiCall(room.meetingId, thoughtResult.meta);

      const thought: PersonaThought = {
        id: randomUUID(),
        personaId: persona.id,
        personaName: persona.name,
        content: thoughtResult.result.content,
        category: thoughtResult.result.category,
        timestamp: Date.now(),
      };

      room.thoughts.push(thought);
      broadcastToRoom(room, { type: "persona:thought", data: thought });

      // AI 생각도 공유 트랜스크립트에 추가
      broadcastToRoom(room, {
        type: "transcript:shared",
        data: {
          speakerId: `ai-${persona.id}`,
          speakerName: persona.name,
          text: `💭 ${thought.content}`,
          isFinal: true,
          timestamp: Date.now(),
          isAI: true,
        },
      });

      await supabase.from("meeting_events").insert({
        meeting_id: room.meetingId,
        type: "ai_thought",
        payload: thought,
      });
    }
  }
}
