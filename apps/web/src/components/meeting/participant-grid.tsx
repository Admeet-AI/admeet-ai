"use client";

import { useMeetingStore } from "@/stores/meeting";
import { ParticipantTile } from "./participant-tile";

export function ParticipantGrid() {
  const participants = useMeetingStore((s) => s.participants);
  const isAnalyzing = useMeetingStore((s) => s.isAnalyzing);
  const analyzingPersonaId = useMeetingStore((s) => s.analyzingPersonaId);

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 p-4">
      {participants.map((p) => (
        <ParticipantTile
          key={p.id}
          participant={p}
          isAnalyzing={
            isAnalyzing &&
            p.isAI &&
            (!analyzingPersonaId || p.id === `ai-${analyzingPersonaId}`)
          }
        />
      ))}
    </div>
  );
}
