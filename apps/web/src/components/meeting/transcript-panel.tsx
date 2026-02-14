"use client";

import { useMeetingStore } from "@/stores/meeting";
import { ScrollArea } from "@/components/ui/scroll-area";

export function TranscriptPanel() {
  const transcripts = useMeetingStore((s) => s.transcripts);
  const interimTranscript = useMeetingStore((s) => s.interimTranscript);

  return (
    <div className="flex flex-col h-full">
      <h3 className="font-semibold text-sm mb-2 px-1">실시간 전사</h3>
      <ScrollArea className="flex-1 border rounded-lg p-3 bg-white">
        <div className="space-y-2">
          {transcripts.map((t, i) => (
            <p key={i} className="text-sm leading-relaxed">{t.text}</p>
          ))}
          {interimTranscript && (
            <p className="text-sm text-muted-foreground italic">{interimTranscript}</p>
          )}
          {transcripts.length === 0 && !interimTranscript && (
            <p className="text-sm text-muted-foreground">음성 인식을 시작하면 여기에 표시됩니다...</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
