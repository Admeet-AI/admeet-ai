"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import { Users, Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface MeetingData {
  id: string;
  title: string;
  status: string;
  project_id: string;
}

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const store = useMeetingStore();
  const { connect, disconnect, send } = useWebSocket();
  const [meeting, setMeeting] = useState<MeetingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasJoined, setHasJoined] = useState(false);
  const [activeTab, setActiveTab] = useState<"transcript" | "insights">("transcript");

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

  useEffect(() => {
    if (!store.ttsEnabled || store.solutions.length === 0) return;
    const last = store.solutions[store.solutions.length - 1];
    speak(last.solution);
  }, [store.solutions.length]);

  // 초대 코드로 회의 정보 조회
  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const res = await fetch(`${API_URL}/api/meetings/invite/${code}`);
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "회의를 찾을 수 없습니다");
          return;
        }
        const data = await res.json();
        setMeeting(data);
      } catch {
        setError("서버에 연결할 수 없습니다");
      } finally {
        setLoading(false);
      }
    };
    fetchMeeting();
  }, [code]);

  const handleJoin = useCallback(
    (displayName: string) => {
      if (!meeting) return;

      store.setMeetingId(meeting.id);
      store.setCurrentUser("pending", displayName);
      connect(meeting.id, displayName);
      store.setMeetingStarted(true);
      setHasJoined(true);
    },
    [meeting, connect, store]
  );

  const handleLeave = useCallback(() => {
    stopSTT();
    stopTTS();
    send({ type: "room:leave", data: {} });
    disconnect();
    store.reset();
    router.push("/");
  }, [send, disconnect, store, router, stopSTT, stopTTS]);

  useEffect(() => {
    return () => {
      store.reset();
      disconnect();
    };
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (error || !meeting) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg font-medium text-foreground">{error || "회의를 찾을 수 없습니다"}</p>
          <button
            onClick={() => router.push("/")}
            className="text-sm text-blue-500 hover:underline"
          >
            홈으로 돌아가기
          </button>
        </div>
      </main>
    );
  }

  if (!hasJoined) {
    return (
      <MeetingLobby
        meetingTitle={meeting.title}
        onJoin={handleJoin}
      />
    );
  }

  const humanCount = store.participants.filter((p) => !p.isAI).length;
  const aiCount = store.participants.filter((p) => p.isAI).length;

  return (
    <main className="h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <h1 className="font-bold text-lg">AdMeet</h1>
          <span className="text-muted-foreground">|</span>
          <span className="text-sm font-medium">{meeting.title}</span>
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

      <div className="bg-muted/30 border-b border-border">
        <ParticipantGrid />
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex border-b border-border bg-card sm:hidden">
            <button
              onClick={() => setActiveTab("transcript")}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeTab === "transcript" ? "border-b-2 border-blue-500 text-blue-600" : "text-muted-foreground"
              }`}
            >
              트랜스크립트
            </button>
            <button
              onClick={() => setActiveTab("insights")}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeTab === "insights" ? "border-b-2 border-blue-500 text-blue-600" : "text-muted-foreground"
              }`}
            >
              인사이트
            </button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className={`flex-1 p-3 overflow-hidden ${activeTab !== "transcript" ? "hidden sm:flex sm:flex-col" : "flex flex-col"}`}>
              <SharedTranscript />
            </div>

            <div className={`w-full sm:w-80 lg:w-96 border-l border-border flex flex-col overflow-hidden ${activeTab !== "insights" ? "hidden sm:flex" : "flex"}`}>
              <div className="h-1/3 border-b border-border p-3 overflow-hidden">
                <SummaryPanel />
              </div>
              <div className="flex-1 p-3 overflow-hidden flex flex-col">
                <PersonaPanel persona={store.activePersonas[0] || null} />
              </div>
            </div>
          </div>
        </div>

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
                    {new Date(msg.timestamp).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
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
                    send({ type: "chat:message", data: { text: (e.target as HTMLInputElement).value } });
                    (e.target as HTMLInputElement).value = "";
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>

      <MeetingControls
        isListening={isListening}
        onToggleMic={isListening ? stopSTT : startSTT}
        onSendText={(text) => {
          store.addTranscript(text);
          send({ type: "transcript", data: { text, isFinal: true } });
        }}
      />
    </main>
  );
}
