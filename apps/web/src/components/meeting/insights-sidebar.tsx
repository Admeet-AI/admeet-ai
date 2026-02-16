"use client";

import { useState } from "react";
import { useMeetingStore } from "@/stores/meeting";
import { PersonaPanel } from "./persona-panel";
import { getAIStyle } from "./shared-transcript";
import { BrainCircuit } from "lucide-react";

export function InsightsSidebar() {
  const activePersonas = useMeetingStore((s) => s.activePersonas);
  const isAnalyzing = useMeetingStore((s) => s.isAnalyzing);
  const analyzingPersonaId = useMeetingStore((s) => s.analyzingPersonaId);
  const [activePersonaTab, setActivePersonaTab] = useState<string | null>(null);

  const currentPersona =
    activePersonas.find((p) => p.id === activePersonaTab) || activePersonas[0] || null;

  if (activePersonas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
        <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center mb-3">
          <BrainCircuit className="h-5 w-5 text-muted-foreground/50" />
        </div>
        <p className="text-xs text-center">AI 페르소나가<br />입장하면 표시됩니다</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 페르소나 탭 */}
      {activePersonas.length > 1 ? (
        <div className="flex gap-1 px-3 pt-3 pb-1 overflow-x-auto">
          {activePersonas.map((p) => {
            const { color, icon: Icon } = getAIStyle(p.name);
            const isActive = activePersonaTab === p.id || (!activePersonaTab && p === activePersonas[0]);
            const analyzing =
              isAnalyzing && (!analyzingPersonaId || p.id === analyzingPersonaId);

            return (
              <button
                key={p.id}
                onClick={() => setActivePersonaTab(p.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] rounded-lg whitespace-nowrap transition-all ${
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
                <Icon className="h-3 w-3" style={{ color: isActive ? color : undefined }} />
                {p.name}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 pt-3 pb-1">
          {(() => {
            const { color, icon: Icon } = getAIStyle(activePersonas[0].name);
            return (
              <>
                <div
                  className="flex h-5 w-5 items-center justify-center rounded-md"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <Icon className="h-3 w-3" style={{ color }} />
                </div>
                <span className="text-xs font-semibold" style={{ color }}>
                  {activePersonas[0].name}
                </span>
              </>
            );
          })()}
        </div>
      )}

      {/* 페르소나 패널 */}
      <div className="flex-1 overflow-hidden px-1">
        <PersonaPanel persona={currentPersona} />
      </div>
    </div>
  );
}
