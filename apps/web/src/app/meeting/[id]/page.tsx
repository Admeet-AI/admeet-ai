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
import type { Persona } from "../../../../../../packages/shared/types";
import { BarChart3, PhoneOff } from "lucide-react";

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

  const handleEndMeeting = useCallback(async () => {
    stopSTT();
    stopTTS();
    send({ type: "meeting:end", data: { meetingId: store.meetingId } });
    disconnect();
    if (store.meetingId) {
      await fetch(`${API_URL}/api/reports/${store.meetingId}`, { method: "POST" });
      router.push(`/report/${store.meetingId}`);
    }
  }, [send, disconnect, store.meetingId, router, stopSTT, stopTTS]);

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
      <header className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <h1 className="font-bold text-lg">AdMeet</h1>
          <span className="text-muted-foreground hidden sm:inline">|</span>
          <span className="text-sm font-medium hidden sm:inline">{meetingTitle}</span>
          <Badge variant={store.isConnected ? "default" : "destructive"} className="text-xs">
            {store.isConnected ? "연결됨" : "연결 끊김"}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* 참여자 아바타 */}
          <ParticipantGrid />

          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {humanCount}명{aiCount > 0 && ` + AI ${aiCount}`}
          </span>

          {/* 요약 Drawer 버튼 */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDrawerOpen(true)}
            className="gap-1.5"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">요약</span>
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
            className="gap-1.5"
          >
            <PhoneOff className="h-4 w-4" />
            <span className="hidden sm:inline">종료</span>
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
          <div className="flex-1 overflow-hidden bg-background">
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
    </main>
  );
}
