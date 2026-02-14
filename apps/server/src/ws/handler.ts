import { Server as HttpServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { triggerService } from "../services/trigger.js";
import { supabase } from "../lib/supabase.js";
import type { MeetingState, WSClientEvent, WSServerEvent } from "@admeet/shared";

const COOLDOWN_MS = 30_000; // 30초 쿨다운
const SUMMARY_INTERVAL_MS = 45_000; // 45초마다 요약

interface MeetingSession {
  meetingId: string;
  projectId: string;
  contextCard: Record<string, unknown>;
  state: MeetingState;
  recentTranscript: string[];
  lastInterventionAt: number;
  interventionCount: number;
  summaryTimer: ReturnType<typeof setInterval> | null;
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

      // 회의 + 프로젝트 정보 로드
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
        lastInterventionAt: 0,
        interventionCount: 0,
        summaryTimer: null,
      };

      // 주기적 요약 타이머
      session.summaryTimer = setInterval(
        () => processSummary(ws, session),
        SUMMARY_INTERVAL_MS
      );

      sessions.set(ws, session);

      // 회의 상태 활성화
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

        // 최근 2분치만 유지 (대략 10~15 문장)
        if (session.recentTranscript.length > 15) {
          session.recentTranscript.shift();
        }

        // 이벤트 로그 저장
        await supabase.from("meeting_events").insert({
          meeting_id: session.meetingId,
          type: "transcript",
          payload: { text },
        });

        // 트리거 체크
        await checkTrigger(ws, session);
      }
      break;
    }

    case "meeting:end": {
      const session = sessions.get(ws);
      if (!session) return;

      if (session.summaryTimer) clearInterval(session.summaryTimer);

      // 최종 상태 스냅샷 저장
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

async function checkTrigger(ws: WebSocket, session: MeetingSession) {
  const now = Date.now();

  // 쿨다운 체크
  if (now - session.lastInterventionAt < COOLDOWN_MS) return;

  const recentText = session.recentTranscript.slice(-5).join("\n");
  if (!recentText.trim()) return;

  const result = await triggerService.detectTrigger(
    recentText,
    session.state,
    session.contextCard
  );

  // 요약 업데이트
  if (result.summary) {
    session.state.summary.push(result.summary);
    send(ws, { type: "summary", data: { text: result.summary } });
  }

  // State 업데이트
  if (result.stateUpdate) {
    Object.assign(session.state, result.stateUpdate);
    send(ws, { type: "state:update", data: result.stateUpdate });
  }

  // 트리거 발동 → 개입
  if (result.hasTrigger && result.triggerType) {
    const intervention = await triggerService.generateIntervention(
      result.triggerType,
      recentText,
      session.state,
      session.contextCard
    );

    session.lastInterventionAt = now;
    session.interventionCount++;

    send(ws, {
      type: "ai:intervention",
      data: { trigger: intervention.trigger, message: intervention.message },
    });

    // 이벤트 로그
    await supabase.from("meeting_events").insert({
      meeting_id: session.meetingId,
      type: "ai_intervention",
      payload: intervention,
    });
  }
}

async function processSummary(ws: WebSocket, session: MeetingSession) {
  const recentText = session.recentTranscript.slice(-5).join("\n");
  if (!recentText.trim()) return;

  const result = await triggerService.detectTrigger(
    recentText,
    session.state,
    session.contextCard
  );

  if (result.summary) {
    session.state.summary.push(result.summary);
    send(ws, { type: "summary", data: { text: result.summary } });

    await supabase.from("meeting_events").insert({
      meeting_id: session.meetingId,
      type: "ai_summary",
      payload: { text: result.summary },
    });
  }
}
