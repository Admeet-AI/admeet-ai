"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useMeetingStore } from "@/stores/meeting";
import { useWebSocket } from "@/hooks/use-websocket";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useTTS } from "@/hooks/use-tts";
import { TranscriptPanel } from "@/components/meeting/transcript-panel";
import { SummaryPanel } from "@/components/meeting/summary-panel";
import { MarketerPanel } from "@/components/meeting/marketer-panel";
import { SettingsModal } from "@/components/meeting/settings-modal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function MeetingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = params.id as string;

  const store = useMeetingStore();
  const { connect, disconnect, send } = useWebSocket();
  const [meetingTitle, setMeetingTitle] = useState(searchParams.get("title") || "");
  const [meetingStarted, setMeetingStarted] = useState(false);
  const [textInput, setTextInput] = useState("");

  const { speak, stop: stopTTS } = useTTS({
    onStart: () => store.setAISpeaking(true),
    onEnd: () => store.setAISpeaking(false),
  });

  const { isListening, start: startSTT, stop: stopSTT } = useSpeechRecognition({
    onResult: (text, isFinal) => {
      // TTS 발화 중이면 마이크 입력 무시 (에코 방지)
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

  // 새 solution 도착 시 TTS (생각은 읽지 않음 — 솔루션만)
  useEffect(() => {
    if (!store.ttsEnabled || store.solutions.length === 0) return;
    const last = store.solutions[store.solutions.length - 1];
    speak(last.solution);
  }, [store.solutions.length]);

  const handleStartMeeting = async () => {
    if (!meetingTitle.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, title: meetingTitle, type: "other" }),
      });
      const meeting = await res.json();
      store.setMeetingId(meeting.id);
      connect();
      setTimeout(() => {
        send({ type: "meeting:start", data: { meetingId: meeting.id } });
      }, 500);
      setMeetingStarted(true);
    } catch (error) {
      console.error("Failed to start meeting:", error);
    }
  };

  const handleTextSubmit = () => {
    if (!textInput.trim()) return;
    store.addTranscript(textInput);
    send({ type: "transcript", data: { text: textInput, isFinal: true } });
    setTextInput("");
  };

  const handleEndMeeting = async () => {
    stopSTT();
    stopTTS();
    send({ type: "meeting:end", data: { meetingId: store.meetingId } });
    disconnect();
    if (store.meetingId) {
      await fetch(`${API_URL}/api/reports/${store.meetingId}`, { method: "POST" });
      router.push(`/report/${store.meetingId}`);
    }
  };

  useEffect(() => {
    return () => {
      store.reset();
      disconnect();
    };
  }, []);

  if (!meetingStarted) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-full max-w-md px-6 space-y-4">
          <h1 className="text-2xl font-bold text-center">회의 시작</h1>
          <p className="text-sm text-muted-foreground text-center">
            회의 제목을 입력하고 시작하세요. AI 마케터가 배석합니다.
          </p>
          <Input
            placeholder="회의 제목 (예: 신규 기능 기획 회의)"
            value={meetingTitle}
            onChange={(e) => setMeetingTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleStartMeeting()}
          />
          <Button onClick={handleStartMeeting} disabled={!meetingTitle.trim()} className="w-full">
            회의 시작
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen flex flex-col bg-slate-50">
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b">
        <div className="flex items-center gap-3">
          <h1 className="font-bold text-lg">AdMeet AI</h1>
          <span className="text-muted-foreground">|</span>
          <span className="text-sm">{meetingTitle}</span>
          <Badge variant={store.isConnected ? "default" : "destructive"}>
            {store.isConnected ? "연결됨" : "연결 끊김"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <SettingsModal
            onIntervalChange={(seconds) => {
              send({ type: "meeting:config", data: { analysisInterval: seconds } });
              store.resetTimer();
            }}
          />
          <Button
            variant={isListening ? "destructive" : "default"}
            size="sm"
            onClick={isListening ? stopSTT : startSTT}
          >
            {isListening ? "음성 중지" : "음성 시작"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleEndMeeting}>
            회의 종료
          </Button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-3 gap-4 p-4 overflow-hidden">
        <div className="col-span-1 flex flex-col">
          <TranscriptPanel />
          <div className="mt-2 flex gap-2">
            <Input
              placeholder="텍스트로 입력..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
              className="text-sm"
            />
            <Button size="sm" onClick={handleTextSubmit}>전송</Button>
          </div>
        </div>
        <div className="col-span-1 h-full overflow-hidden"><SummaryPanel /></div>
        <div className="col-span-1 h-full overflow-hidden"><MarketerPanel /></div>
      </div>
    </main>
  );
}
