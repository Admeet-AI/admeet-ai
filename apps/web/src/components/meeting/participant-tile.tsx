"use client";

import { BrainCircuit } from "lucide-react";
import type { ParticipantInfo } from "../../../../../packages/shared/types";
import { cn } from "@/lib/utils";

interface ParticipantTileProps {
  participant: ParticipantInfo;
  isAnalyzing?: boolean;
  latestThought?: string;
}

const AI_COLORS: Record<string, string> = {
  "시니어 마케터": "#00d4ff",
  PM: "#7c3aed",
  "UX 디자이너": "#f59e0b",
  CTO: "#10b981",
  "법무 자문": "#ef4444",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ParticipantTile({
  participant,
  isAnalyzing,
  latestThought,
}: ParticipantTileProps) {
  const color = participant.isAI
    ? AI_COLORS[participant.displayName] || "#6b7280"
    : "#3b82f6";

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center rounded-xl border bg-card p-3 transition-all",
        participant.isSpeaking && "ring-2 ring-green-400 ring-offset-1",
        isAnalyzing && participant.isAI && "ring-2 ring-blue-400 ring-offset-1 animate-pulse"
      )}
      style={{
        borderColor: participant.isAI ? `${color}30` : undefined,
      }}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full text-white font-bold text-lg",
          participant.isSpeaking && "ring-2 ring-green-400"
        )}
        style={{ backgroundColor: `${color}20`, color }}
      >
        {participant.isAI ? (
          <BrainCircuit className="h-7 w-7" />
        ) : participant.avatarUrl ? (
          <img
            src={participant.avatarUrl}
            alt={participant.displayName}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          getInitials(participant.displayName)
        )}
      </div>

      {/* Name */}
      <span className="mt-2 text-xs font-medium text-foreground truncate max-w-full">
        {participant.displayName}
      </span>

      {/* Role / Status */}
      {participant.isAI && (
        <span
          className="mt-0.5 text-[10px] font-medium"
          style={{ color }}
        >
          {isAnalyzing ? "분석 중..." : "AI"}
        </span>
      )}

      {/* AI 생각 말풍선 */}
      {participant.isAI && latestThought && (
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full z-10 w-48 rounded-lg border p-2 text-[10px] leading-relaxed shadow-lg bg-card"
          style={{ borderColor: `${color}30` }}
        >
          <p className="line-clamp-2 text-muted-foreground">{latestThought}</p>
        </div>
      )}
    </div>
  );
}
