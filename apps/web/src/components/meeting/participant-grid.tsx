"use client";

import { useMeetingStore } from "@/stores/meeting";
import { BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

const AI_COLORS: Record<string, string> = {
  "시니어 마케터": "#00d4ff",
  PM: "#7c3aed",
  "UX 디자이너": "#f59e0b",
  CTO: "#10b981",
  "법무 자문": "#ef4444",
};

export function ParticipantGrid() {
  const participants = useMeetingStore((s) => s.participants);
  const isAnalyzing = useMeetingStore((s) => s.isAnalyzing);
  const analyzingPersonaId = useMeetingStore((s) => s.analyzingPersonaId);

  const MAX_VISIBLE = 6;
  const visible = participants.slice(0, MAX_VISIBLE);
  const overflow = participants.length - MAX_VISIBLE;

  return (
    <div className="flex items-center gap-1">
      {visible.map((p) => {
        const color = p.isAI ? AI_COLORS[p.displayName] || "#6b7280" : "#3b82f6";
        const analyzing =
          isAnalyzing && p.isAI && (!analyzingPersonaId || p.id === `ai-${analyzingPersonaId}`);

        return (
          <div
            key={p.id}
            className="relative group"
            title={p.displayName}
          >
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold border-2 border-background transition-all",
                p.isSpeaking && "ring-2 ring-green-400 ring-offset-1",
                analyzing && "animate-pulse ring-2 ring-blue-400 ring-offset-1"
              )}
              style={{ backgroundColor: `${color}20`, color }}
            >
              {p.isAI ? (
                <BrainCircuit className="h-3.5 w-3.5" />
              ) : (
                p.displayName[0]?.toUpperCase()
              )}
            </div>
          </div>
        );
      })}

      {overflow > 0 && (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground border-2 border-background">
          +{overflow}
        </div>
      )}
    </div>
  );
}
