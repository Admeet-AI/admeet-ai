"use client";

import { useEffect, useRef } from "react";
import { useMeetingStore } from "@/stores/meeting";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

export function SharedTranscript() {
  const allTranscripts = useMeetingStore((s) => s.transcripts);
  const interimTranscript = useMeetingStore((s) => s.interimTranscript);
  const currentUserName = useMeetingStore((s) => s.currentUserName);

  // AI 발언 제외 — 인간 참여자만 표시
  const transcripts = allTranscripts.filter(
    (t) => !t.isAI && !t.speakerId.startsWith("ai-")
  );
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts.length]);

  return (
    <div className="flex flex-col h-full">
      <h3 className="font-semibold text-sm mb-2 px-1 flex items-center gap-2">
        공유 트랜스크립트
        <span className="text-xs text-muted-foreground font-normal">
          ({transcripts.length})
        </span>
      </h3>
      <ScrollArea className="flex-1 overflow-hidden border border-border rounded-lg bg-card">
        <div className="p-3 space-y-2">
          {transcripts.map((t, i) => {
            const isAI = t.isAI || t.speakerId.startsWith("ai-");
            const isMe = t.speakerName === currentUserName;

            return (
              <div
                key={`${t.timestamp}-${i}`}
                className={cn(
                  "flex gap-2 text-sm",
                  isAI && "bg-blue-50/50 dark:bg-blue-950/20 rounded-lg p-2 -mx-1"
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold mt-0.5",
                    isAI
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                      : isMe
                        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  )}
                >
                  {isAI ? (
                    <BrainCircuit className="h-3 w-3" />
                  ) : (
                    t.speakerName[0]?.toUpperCase()
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        isAI ? "text-blue-600 dark:text-blue-400" : "text-foreground"
                      )}
                    >
                      {t.speakerName}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(t.timestamp).toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="leading-relaxed text-foreground/80">{t.text}</p>
                </div>
              </div>
            );
          })}

          {interimTranscript && (
            <div className="flex gap-2 text-sm">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 text-[10px] font-bold mt-0.5">
                {currentUserName[0]?.toUpperCase() || "나"}
              </div>
              <div className="flex-1">
                <span className="text-xs font-semibold">{currentUserName || "나"}</span>
                <p className="text-muted-foreground italic">{interimTranscript}</p>
              </div>
            </div>
          )}

          {transcripts.length === 0 && !interimTranscript && (
            <p className="text-sm text-muted-foreground text-center py-8">
              회의가 시작되면 참여자들의 발언이 여기에 표시됩니다
            </p>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  );
}
