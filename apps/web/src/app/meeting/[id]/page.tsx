"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useMeetingStore } from "@/stores/meeting";
import { useWebSocket } from "@/hooks/use-websocket";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useTTS } from "@/hooks/use-tts";
import { MeetingLobby } from "@/components/meeting/meeting-lobby";
import { ParticipantGrid } from "@/components/meeting/participant-grid";
import { SharedTranscript } from "@/components/meeting/shared-transcript";
import { PersonaPanel } from "@/components/meeting/persona-panel";
import { SummaryPanel } from "@/components/meeting/summary-panel";
import { MeetingControls } from "@/components/meeting/meeting-controls";
import { SettingsModal } from "@/components/meeting/settings-modal";
import type { Persona } from "../../../../../../packages/shared/types";
import { Users } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"transcript" | "insights">("transcript");
  const [activePersonaTab, setActivePersonaTab] = useState<string | null>(null);

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
        // 페르소나 정보 가져오기
        if (personaIds.length > 0) {
          const personaPromises = personaIds.map((id) =>
            fetch(`${API_URL}/api/personas/${id}`).then((r) => r.json())
          );
          const personas: Persona[] = await Promise.all(personaPromises);
          store.setActivePersonas(personas);
        }

        // 회의 생성
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

        // WebSocket 연결 (자동으로 room:join 전송)
        connect(meeting.id, displayName);

        // room:join 완료 후 meeting:start 전송
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
          <span className="text-muted-foreground">|</span>
          <span className="text-sm font-medium">{meetingTitle}</span>
          <Badge variant={store.isConnected ? "default" : "destructive"} className="text-xs">
            {store.isConnected ? "연결됨" : "연결 끊김"}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span>
            {humanCount}명{aiCount > 0 && ` + AI ${aiCount}`}
          </span>
        </div>
      </header>

      {/* 참여자 그리드 */}
      <div className="bg-muted/30 border-b border-border">
        <ParticipantGrid />
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 탭 전환 (모바일) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex border-b border-border bg-card sm:hidden">
            <button
              onClick={() => setActiveTab("transcript")}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "transcript"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-muted-foreground"
              }`}
            >
              트랜스크립트
            </button>
            <button
              onClick={() => setActiveTab("insights")}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "insights"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-muted-foreground"
              }`}
            >
              인사이트
            </button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* 공유 트랜스크립트 */}
            <div
              className={`flex-1 p-3 overflow-hidden ${
                activeTab !== "transcript" ? "hidden sm:flex sm:flex-col" : "flex flex-col"
              }`}
            >
              <SharedTranscript />
            </div>

            {/* 사이드 패널: 요약 + 페르소나 인사이트 */}
            <div
              className={`w-full sm:w-80 lg:w-96 border-l border-border flex flex-col overflow-hidden ${
                activeTab !== "insights" ? "hidden sm:flex" : "flex"
              }`}
            >
              {/* 요약 */}
              <div className="h-1/3 border-b border-border p-3 overflow-hidden">
                <SummaryPanel />
              </div>

              {/* 페르소나 인사이트 */}
              <div className="flex-1 p-3 overflow-hidden flex flex-col">
                {store.activePersonas.length > 1 && (
                  <div className="flex gap-1 mb-2 overflow-x-auto pb-1">
                    {store.activePersonas.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setActivePersonaTab(p.id)}
                        className={`px-2 py-1 text-xs rounded-md whitespace-nowrap transition-colors ${
                          activePersonaTab === p.id
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-medium"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                )}
                {store.activePersonas.length > 0 ? (
                  <PersonaPanel
                    persona={
                      store.activePersonas.find((p) => p.id === activePersonaTab) ||
                      store.activePersonas[0]
                    }
                  />
                ) : (
                  <PersonaPanel persona={null} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 채팅 사이드바 */}
        {store.isChatOpen && (
          <div className="w-72 border-l border-border flex flex-col bg-card">
            <div className="px-3 py-2 border-b border-border">
              <h3 className="text-sm font-semibold">채팅</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {store.chatMessages.map((msg, i) => (
                <div key={i} className="text-xs">
                  <span className="font-semibold">{msg.senderName}</span>
                  <span className="text-muted-foreground ml-1">
                    {new Date(msg.timestamp).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <p className="mt-0.5">{msg.text}</p>
                </div>
              ))}
            </div>
            <div className="p-2 border-t border-border">
              <input
                type="text"
                placeholder="메시지 입력..."
                className="w-full px-2 py-1.5 text-xs border border-border rounded-md bg-background"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) {
                    send({
                      type: "chat:message",
                      data: { text: (e.target as HTMLInputElement).value },
                    });
                    (e.target as HTMLInputElement).value = "";
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 하단 컨트롤 바 */}
      <MeetingControls
        isListening={isListening}
        onToggleMic={isListening ? stopSTT : startSTT}
        onSendText={handleSendText}
        onEndMeeting={handleEndMeeting}
        settingsSlot={
          <SettingsModal
            onIntervalChange={(seconds) => {
              send({ type: "meeting:config", data: { analysisInterval: seconds } });
              store.resetTimer();
            }}
          />
        }
      />
    </main>
  );
}
