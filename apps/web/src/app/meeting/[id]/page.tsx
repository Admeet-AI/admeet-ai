"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMeetingStore } from "@/stores/meeting";
import { useWebSocket } from "@/hooks/use-websocket";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useTTS } from "@/hooks/use-tts";
import { MeetingLobby } from "@/components/meeting/meeting-lobby";
import { ParticipantGrid } from "@/components/meeting/participant-grid";
import { SharedTranscript } from "@/components/meeting/shared-transcript";
import { MeetingControls } from "@/components/meeting/meeting-controls";
import { SettingsModal } from "@/components/meeting/settings-modal";
import { SummaryDrawer } from "@/components/meeting/summary-drawer";
import { InsightsSidebar } from "@/components/meeting/insights-sidebar";
import { EndMeetingOverlay } from "@/components/meeting/end-meeting-overlay";
import type { EndingPhase } from "@/components/meeting/end-meeting-overlay";
import type { Persona } from "../../../../../../packages/shared/types";
import { X } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function MeetingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = params.id as string;

  const store = useMeetingStore();
  const { connect, disconnect, send, sendAfterJoin } = useWebSocket();
  const meetingTitle = searchParams.get("title") || "새 회의";
  const [hasJoined, setHasJoined] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [endingPhase, setEndingPhase] = useState<EndingPhase | null>(null);

  const personaIdsParam = searchParams.get("personaIds");
  const personaIds = personaIdsParam ? personaIdsParam.split(",").filter(Boolean) : [];

  const { speak, stop: stopTTS } = useTTS({
    onStart: () => store.setAISpeaking(true),
    onEnd: () => store.setAISpeaking(false),
  });

  const { isListening, start: startSTT, stop: stopSTT } = useSpeechRecognition({
    onResult: (text, isFinal) => {
      if (useMeetingStore.getState().isAISpeaking) return;

      if (isFinal) {
        store.addTranscript(text);
        store.setInterimTranscript("");
        send({ type: "transcript", data: { text, isFinal: true } });
      } else {
        store.setInterimTranscript(text);
      }
    },
    onError: (err) => console.error("STT Error:", err),
  });

  // 새 solution 도착 시 TTS
  useEffect(() => {
    if (!store.ttsEnabled || store.solutions.length === 0) return;
    const last = store.solutions[store.solutions.length - 1];
    speak(last.solution);
  }, [store.solutions.length]);

  const handleJoin = useCallback(
    async (displayName: string) => {
      try {
        if (personaIds.length > 0) {
          const personaPromises = personaIds.map((id) =>
            fetch(`${API_URL}/api/personas/${id}`).then((r) => r.json())
          );
          const personas: Persona[] = await Promise.all(personaPromises);
          store.setActivePersonas(personas);
        }

        const res = await fetch(`${API_URL}/api/meetings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, title: meetingTitle, type: "other" }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `회의 생성 실패 (${res.status})`);
        }
        const meeting = await res.json();
        if (!meeting.id) {
          throw new Error("회의 생성 응답에 ID가 없습니다");
        }
        store.setMeetingId(meeting.id);
        store.setCurrentUser("pending", displayName);

        connect(meeting.id, displayName);

        sendAfterJoin({
          type: "meeting:start",
          data: { meetingId: meeting.id, personaIds },
        });

        store.setMeetingStarted(true);
        setHasJoined(true);
      } catch (error) {
        console.error("Failed to join meeting:", error);
      }
    },
    [personaIds, projectId, meetingTitle, connect, send, store]
  );

  const handleSendText = useCallback(
    (text: string) => {
      store.addTranscript(text);
      send({ type: "transcript", data: { text, isFinal: true } });
    },
    [send, store]
  );

  const executeEndMeeting = useCallback(async () => {
    try {
      setEndingPhase("ending");
      stopSTT();
      stopTTS();
      send({ type: "meeting:end", data: { meetingId: store.meetingId } });
      disconnect();

      if (store.meetingId) {
        setEndingPhase("generating");
        await fetch(`${API_URL}/api/reports/${store.meetingId}`, { method: "POST" });

        setEndingPhase("redirecting");
        router.push(`/report/${store.meetingId}`);
      }
    } catch {
      setEndingPhase("error");
    }
  }, [send, disconnect, store.meetingId, router, stopSTT, stopTTS]);

  const handleEndMeeting = useCallback(() => {
    executeEndMeeting();
  }, [executeEndMeeting]);

  useEffect(() => {
    return () => {
      store.reset();
      disconnect();
    };
  }, []);

  // 로비 (입장 전)
  if (!hasJoined) {
    return (
      <MeetingLobby
        meetingTitle={meetingTitle}
        onJoin={handleJoin}
      />
    );
  }

  const humanCount = store.participants.filter((p) => !p.isAI).length;
  const aiCount = store.participants.filter((p) => p.isAI).length;

  return (
    <main className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-3 sm:px-4 py-2 bg-card border-b border-border gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="font-bold text-base sm:text-lg shrink-0">AdMeet</h1>
          <span className="text-muted-foreground hidden sm:inline">|</span>
          <span className="text-sm font-medium hidden sm:inline truncate">{meetingTitle}</span>
          <Badge variant={store.isConnected ? "default" : "destructive"} className="text-[10px] sm:text-xs shrink-0">
            {store.isConnected ? "연결됨" : "끊김"}
          </Badge>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* 참여자 아바타 — 모바일 숨김 */}
          <div className="hidden sm:flex items-center gap-1.5">
            <ParticipantGrid />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {humanCount}명{aiCount > 0 && ` + AI ${aiCount}`}
            </span>
          </div>

          {/* 요약 */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDrawerOpen(true)}
          >
            요약
          </Button>

          {/* 설정 */}
          <SettingsModal
            onIntervalChange={(seconds) => {
              send({ type: "meeting:config", data: { analysisInterval: seconds } });
              store.resetTimer();
            }}
          />

          {/* 종료 */}
          <Button
            variant="destructive"
            size="sm"
            onClick={handleEndMeeting}
          >
            종료
          </Button>
        </div>
      </header>

      {/* 메인 영역: 왼쪽 AI 인사이트 고정 + 오른쪽 채팅 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 왼쪽: AI 인사이트 패널 (고정) */}
        <aside className="hidden sm:flex w-72 lg:w-80 border-r border-border bg-card flex-col shrink-0">
          <InsightsSidebar />
        </aside>

        {/* 오른쪽: 채팅 영역 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden bg-slate-50 dark:bg-slate-950">
            <SharedTranscript />
          </div>

          {/* 하단 메신저 입력바 */}
          <MeetingControls
            isListening={isListening}
            onToggleMic={isListening ? stopSTT : startSTT}
            onSendText={handleSendText}
          />
        </div>
      </div>

      {/* 오른쪽 Drawer: 실시간 요약만 */}
      <SummaryDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />

      {/* 모바일: AI 인사이트 슬라이드 패널 */}
      {insightsOpen && (
        <div className="fixed inset-0 z-40 sm:hidden">
          {/* 배경 오버레이 */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setInsightsOpen(false)}
          />
          {/* 슬라이드 패널 */}
          <aside className="absolute inset-y-0 left-0 w-[85%] max-w-80 bg-card border-r border-border flex flex-col animate-[slideInLeft_0.25s_ease-out_both]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#2563eb]">AI</span>
                <span className="text-sm font-semibold">인사이트</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setInsightsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <InsightsSidebar />
            </div>
          </aside>
        </div>
      )}

      {/* 종료 프로그레스 오버레이 */}
      {endingPhase && (
        <EndMeetingOverlay
          phase={endingPhase}
          onRetry={executeEndMeeting}
        />
      )}
    </main>
  );
}
