"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Loader2, X } from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface MeetingData {
  id: string;
  title: string;
  status: string;
  project_id: string;
  invite_code?: string;
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [copyToast, setCopyToast] = useState<"idle" | "success" | "error">("idle");

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
  }, [store.solutions.length, store.ttsEnabled, speak, store.solutions]);

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const res = await fetch(`${API_URL}/api/meetings/invite/${code}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "유효하지 않은 초대 코드입니다.");
          return;
        }
        const data = await res.json();
        setMeeting(data);
      } catch {
        setError("서버에 연결할 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchMeeting();
  }, [code]);

  const handleJoin = useCallback(
    (displayName: string) => {
      if (!meeting) return;

      const normalizedDisplayName = displayName.trim().slice(0, 6);
      if (!normalizedDisplayName) return;

      store.setMeetingId(meeting.id);
      store.setCurrentUser("pending", normalizedDisplayName);
      connect(meeting.id, normalizedDisplayName);
      store.setMeetingStarted(true);
      setHasJoined(true);
    },
    [meeting, connect, store]
  );

  const handleCopyInviteLink = useCallback(async () => {
    if (typeof window === "undefined") return;

    const inviteCode = meeting?.invite_code || code;
    if (!inviteCode) return;

    const link = `${window.location.origin}/join/${inviteCode}`;

    try {
      await navigator.clipboard.writeText(link);
      setCopyToast("success");
    } catch (err) {
      console.error("Failed to copy invite link:", err);
      setCopyToast("error");
    }
  }, [meeting?.invite_code, code]);

  useEffect(() => {
    if (copyToast === "idle") return;
    const timer = window.setTimeout(() => setCopyToast("idle"), 1800);
    return () => window.clearTimeout(timer);
  }, [copyToast]);

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
      useMeetingStore.getState().reset();
      disconnect();
    };
  }, [disconnect]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (error || !meeting) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-lg font-medium text-foreground">
            {error || "회의를 찾을 수 없습니다."}
          </p>
          <Button variant="outline" size="sm" onClick={() => router.push("/init")}>
            {"새 회의 시작"}
          </Button>
        </div>
      </main>
    );
  }

  if (!hasJoined) {
    return <MeetingLobby meetingTitle={meeting.title} onJoin={handleJoin} />;
  }

  const humanCount = store.participants.filter((p) => !p.isAI).length;
  const aiCount = store.participants.filter((p) => p.isAI).length;

  return (
    <main className="h-[100dvh] overflow-hidden flex flex-col bg-background">
      <header className="flex items-center justify-between px-3 sm:px-4 py-2 bg-card border-b border-border gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Link href="/" className="flex items-center gap-1.5 shrink-0">
            <img src="/logo.png" alt="AdMeet AI" className="h-7 w-7" />
            <span className="font-bold text-base sm:text-lg">AdMeet</span>
          </Link>
          <span className="text-muted-foreground hidden sm:inline">|</span>
          <span className="text-sm font-medium hidden sm:inline truncate">{meeting.title}</span>
          <Badge variant={store.isConnected ? "default" : "destructive"} className="text-[10px] sm:text-xs shrink-0">
            {store.isConnected ? "연결됨" : "연결 끊김"}
          </Badge>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5">
            <ParticipantGrid />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {humanCount}명{aiCount > 0 && ` + AI ${aiCount}`}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyInviteLink}
            className="hidden sm:inline-flex"
          >
            {"링크초대"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setInsightsOpen(true)}
            className="sm:hidden"
          >
            {"인사이트"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setDrawerOpen(true)}
          >
            {"요약"}
          </Button>

          <SettingsModal
            onIntervalChange={(seconds) => {
              send({ type: "meeting:config", data: { analysisInterval: seconds } });
              store.resetTimer();
            }}
            onMobileInviteClick={handleCopyInviteLink}
          />

          <Button variant="destructive" size="sm" onClick={handleLeave}>
            {"종료"}
          </Button>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex overflow-hidden">
        <aside className="hidden sm:flex w-72 lg:w-80 border-r border-border bg-card flex-col shrink-0">
          <InsightsSidebar />
        </aside>

        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-hidden bg-slate-50 dark:bg-slate-950">
            <SharedTranscript />
          </div>

          <MeetingControls
            isListening={isListening}
            onToggleMic={isListening ? stopSTT : startSTT}
            onSendText={(text) => {
              store.addTranscript(text);
              send({ type: "transcript", data: { text, isFinal: true } });
            }}
          />
        </div>
      </div>

      <SummaryDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />

      {insightsOpen && (
        <div className="fixed inset-0 z-40 sm:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setInsightsOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-[85%] max-w-80 bg-card border-r border-border flex flex-col animate-[slideInLeft_0.25s_ease-out_both]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#2563eb]">AI</span>
                <span className="text-sm font-semibold">{"인사이트"}</span>
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

      {copyToast !== "idle" && (
        <div className="pointer-events-none fixed bottom-20 left-1/2 z-[80] -translate-x-1/2 rounded-full bg-slate-900/90 px-3 py-1.5 text-xs font-medium text-white shadow-lg">
          {copyToast === "success"
            ? "링크가 복사되었습니다."
            : "복사에 실패했습니다."}
        </div>
      )}
    </main>
  );
}
