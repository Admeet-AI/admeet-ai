import { Server as HttpServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { randomUUID } from "crypto";
import { marketerService } from "../services/marketer.js";
import { supabase } from "../lib/supabase.js";
import { meetingLogger } from "../lib/logger.js";
import type { MeetingState, WSClientEvent, WSServerEvent, MarketerThought, MarketerSolution } from "@admeet/shared";

const DEFAULT_INTERVAL_MS = 30_000; // 30초 기본값

interface MeetingSession {
  meetingId: string;
  projectId: string;
  contextCard: Record<string, unknown>;
  state: MeetingState;
  recentTranscript: string[];
  thoughts: MarketerThought[];
  solutions: MarketerSolution[];
  summaryTimer: ReturnType<typeof setInterval> | null;
  analysisIntervalMs: number;
}

const sessions = new Map<WebSocket, MeetingSession>();

function send(ws: WebSocket, event: WSServerEvent) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(event));
  }
}

function createInitialState(title: string, type: string): MeetingState {
  return {
    meetingTitle: title,
    meetingType: type as MeetingState["meetingType"],
    summary: [],
    targetSegment: [],
    problemStatement: "",
    valueProposition: "",
    keyMessages: [],
    differentiators: [],
    channels: [],
    kpi: {},
    hypotheses: [],
    experiments: [],
    decisions: [],
    actions: [],
    openQuestions: [],
  };
}

export function setupWebSocket(server: HttpServer) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws) => {
    console.log("[WS] Client connected");

    ws.on("message", async (raw) => {
      try {
        const event: WSClientEvent = JSON.parse(raw.toString());
        await handleEvent(ws, event);
      } catch (error) {
        console.error("[WS] Message error:", error);
        send(ws, { type: "error", data: { message: "이벤트 처리 실패" } });
      }
    });

    ws.on("close", () => {
      const session = sessions.get(ws);
      if (session?.summaryTimer) clearInterval(session.summaryTimer);
      sessions.delete(ws);
      console.log("[WS] Client disconnected");
    });
  });

  console.log("[WS] WebSocket server ready on /ws");
}

async function handleEvent(ws: WebSocket, event: WSClientEvent) {
  switch (event.type) {
    case "meeting:start": {
      const { meetingId } = event.data;

      const { data: meeting } = await supabase
        .from("meetings")
        .select("*, projects(id, context_card)")
        .eq("id", meetingId)
        .single();

      if (!meeting) {
        send(ws, { type: "error", data: { message: "회의를 찾을 수 없음" } });
        return;
      }

      const session: MeetingSession = {
        meetingId,
        projectId: meeting.projects?.id,
        contextCard: meeting.projects?.context_card || {},
        state: createInitialState(meeting.title, meeting.type),
        recentTranscript: [],
        thoughts: [],
        solutions: [],
        summaryTimer: null,
        analysisIntervalMs: DEFAULT_INTERVAL_MS,
      };

      session.summaryTimer = setInterval(
        () => processSummaryAndThought(ws, session),
        session.analysisIntervalMs
      );

      sessions.set(ws, session);
      meetingLogger.start(meetingId, meeting.title);

      await supabase
        .from("meetings")
        .update({ status: "active" })
        .eq("id", meetingId);

      break;
    }

    case "transcript": {
      const session = sessions.get(ws);
      if (!session) return;

      const { text, isFinal } = event.data;

      if (isFinal && text.trim()) {
        session.recentTranscript.push(text);
        meetingLogger.transcript(session.meetingId, text);

        if (session.recentTranscript.length > 15) {
          session.recentTranscript.shift();
        }

        await supabase.from("meeting_events").insert({
          meeting_id: session.meetingId,
          type: "transcript",
          payload: { text },
        });

        await checkSignal(ws, session, text);
      }
      break;
    }

    case "meeting:config": {
      const session = sessions.get(ws);
      if (!session) return;

      const { analysisInterval } = event.data;
      const intervalMs = Math.max(10_000, Math.min(120_000, analysisInterval * 1000));
      session.analysisIntervalMs = intervalMs;

      // 타이머 재시작
      if (session.summaryTimer) clearInterval(session.summaryTimer);
      session.summaryTimer = setInterval(
        () => processSummaryAndThought(ws, session),
        intervalMs
      );
      break;
    }

    case "meeting:end": {
      const session = sessions.get(ws);
      if (!session) return;

      if (session.summaryTimer) clearInterval(session.summaryTimer);
      meetingLogger.end(session.meetingId);

      await supabase.from("meeting_states").insert({
        meeting_id: session.meetingId,
        state: session.state,
      });

      await supabase
        .from("meetings")
        .update({ status: "ended" })
        .eq("id", session.meetingId);

      sessions.delete(ws);
      break;
    }
  }
}

async function checkSignal(ws: WebSocket, session: MeetingSession, latestText: string) {
  // 정규식 pre-filter: 키워드가 없으면 AI 호출하지 않음
  if (!marketerService.hasSignalKeyword(latestText)) return;

  const recentText = session.recentTranscript.slice(-5).join("\n");

  const { result, meta } = await marketerService.detectSignal(recentText);
  meetingLogger.aiCall(session.meetingId, meta);

  if (!result.hasSignal || !result.question) return;

  // 시그널 감지됨 → 솔루션 생성
  send(ws, { type: "marketer:analyzing", data: {} });

  const { result: solutionResult, meta: solutionMeta } = await marketerService.generateSolution(
    result.question,
    recentText,
    session.state,
    session.contextCard
  );
  meetingLogger.aiCall(session.meetingId, solutionMeta);

  const solution: MarketerSolution = {
    id: randomUUID(),
    question: solutionResult.question,
    solution: solutionResult.solution,
    context: solutionResult.context,
    timestamp: Date.now(),
  };

  session.solutions.push(solution);
  send(ws, { type: "marketer:solution", data: solution });
  meetingLogger.intervention(session.meetingId, "solution", solution.solution);

  await supabase.from("meeting_events").insert({
    meeting_id: session.meetingId,
    type: "ai_solution",
    payload: solution,
  });
}

// summary 중복 방지: 간단한 유사도 체크
function stringSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const setA = new Set(a.split(""));
  const setB = new Set(b.split(""));
  const intersection = [...setA].filter(c => setB.has(c)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

function addSummaryIfNew(session: MeetingSession, summary: string): boolean {
  if (!summary) return false;
  if (session.state.summary.includes(summary)) return false;
  const lastSummary = session.state.summary[session.state.summary.length - 1];
  if (lastSummary && stringSimilarity(lastSummary, summary) > 0.8) return false;
  session.state.summary.push(summary);
  return true;
}

async function processSummaryAndThought(ws: WebSocket, session: MeetingSession) {
  const recentText = session.recentTranscript.slice(-5).join("\n");
  if (!recentText.trim()) return;

  // 분석 중 알림
  send(ws, { type: "marketer:analyzing", data: {} });

  // 1) 전사 기반 요약 생성
  const { result: summaryResult, meta: summaryMeta } = await marketerService.generateSummary(
    recentText,
    session.state.summary,
    session.state
  );
  meetingLogger.aiCall(session.meetingId, summaryMeta);

  if (summaryResult.summary && addSummaryIfNew(session, summaryResult.summary)) {
    send(ws, { type: "summary", data: { text: summaryResult.summary } });
    meetingLogger.summary(session.meetingId, summaryResult.summary);

    await supabase.from("meeting_events").insert({
      meeting_id: session.meetingId,
      type: "ai_summary",
      payload: { text: summaryResult.summary },
    });
  }

  if (summaryResult.stateUpdate) {
    Object.assign(session.state, summaryResult.stateUpdate);
    send(ws, { type: "state:update", data: summaryResult.stateUpdate });
  }

  // 2) 마케터 생각 생성 (요약과 별개)
  const summaryText = session.state.summary.slice(-2).join(" ");
  const thoughtResult = await marketerService.generateThought(
    summaryText,
    recentText,
    session.state,
    session.contextCard
  );

  if (thoughtResult) {
    meetingLogger.aiCall(session.meetingId, thoughtResult.meta);

    const thought: MarketerThought = {
      id: randomUUID(),
      content: thoughtResult.result.content,
      category: thoughtResult.result.category,
      timestamp: Date.now(),
    };

    session.thoughts.push(thought);
    send(ws, { type: "marketer:thought", data: thought });

    await supabase.from("meeting_events").insert({
      meeting_id: session.meetingId,
      type: "ai_thought",
      payload: thought,
    });
  }
}
