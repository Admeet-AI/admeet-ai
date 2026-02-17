"use client";

import { useState } from "react";
import { useMeetingStore } from "@/stores/meeting";
import { PersonaPanel } from "./persona-panel";
import { getAIStyle } from "./shared-transcript";
export function InsightsSidebar() {
  const activePersonas = useMeetingStore((s) => s.activePersonas);
  const isAnalyzing = useMeetingStore((s) => s.isAnalyzing);
  const analyzingPersonaId = useMeetingStore((s) => s.analyzingPersonaId);
  // null = "전체" 탭
  const [activePersonaTab, setActivePersonaTab] = useState<string | null>(null);

  const currentPersona =
    activePersonaTab === null
      ? null
      : activePersonas.find((p) => p.id === activePersonaTab) || null;

  if (activePersonas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
        <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center mb-3">
          <span className="text-sm font-bold text-muted-foreground/50">AI</span>
        </div>
        <p className="text-xs text-center">AI 페르소나가<br />입장하면 표시됩니다</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 탭: 전체 + 개별 페르소나 */}
      <div className="flex gap-1 px-3 pt-2 pb-1 overflow-x-auto">
        {/* 전체 탭 */}
        <button
          onClick={() => setActivePersonaTab(null)}
          className={`px-2.5 py-1.5 text-[11px] rounded-lg whitespace-nowrap transition-all ${
            activePersonaTab === null
              ? "font-semibold bg-foreground/10 text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          전체
        </button>

        {activePersonas.map((p) => {
          const { color } = getAIStyle(p.name);
          const isActive = activePersonaTab === p.id;
          const analyzing =
            isAnalyzing && (!analyzingPersonaId || p.id === analyzingPersonaId);

          return (
            <button
              key={p.id}
              onClick={() => setActivePersonaTab(p.id)}
              className={`px-2.5 py-1.5 text-[11px] rounded-lg whitespace-nowrap transition-all ${
                isActive
                  ? "font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              } ${analyzing ? "animate-pulse" : ""}`}
              style={
                isActive
                  ? { backgroundColor: `${color}12`, color }
                  : undefined
              }
            >
              {p.name}
            </button>
          );
        })}
      </div>

      {/* 페르소나 패널 */}
      <div className="flex-1 overflow-hidden px-1">
        <PersonaPanel persona={currentPersona} />
      </div>
    </div>
  );
}
