"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PersonaCreator } from "./persona-creator";
import { Plus, Check } from "lucide-react";
import type { Persona } from "../../../../../packages/shared/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const PERSONA_COLORS = ["#00d4ff", "#7c3aed", "#f59e0b", "#10b981", "#ef4444", "#ec4899"];

interface PersonaSelectorProps {
  onSelect: (personaIds: string[]) => void;
  selectedIds: string[];
}

export function PersonaSelector({ onSelect, selectedIds }: PersonaSelectorProps) {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const res = await fetch(`${API_URL}/api/personas`);
        const data = await res.json();
        setPersonas(data);
      } catch (error) {
        console.error("Failed to fetch personas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPersonas();
  }, []);

  const togglePersona = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelect(selectedIds.filter((sid) => sid !== id));
    } else {
      onSelect([...selectedIds, id]);
    }
  };

  const handleCreated = (persona: Persona) => {
    setPersonas((prev) => [...prev, persona]);
    onSelect([...selectedIds, persona.id]);
    setShowCreator(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="animate-spin h-6 w-6 border-2 border-[#00d4ff] border-t-transparent rounded-full" />
        <span className="ml-3 text-sm text-muted-foreground">페르소나 로딩 중...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {personas.map((persona, index) => {
          const isSelected = selectedIds.includes(persona.id);
          const color = PERSONA_COLORS[index % PERSONA_COLORS.length];
          return (
            <div
              key={persona.id}
              className={`group relative cursor-pointer rounded-xl border p-4 transition-all duration-300 ${
                isSelected
                  ? "border-[#00d4ff]/30 bg-[#00d4ff]/5 shadow-[0_0_20px_rgba(0,212,255,0.1)]"
                  : "border-slate-200/60 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.02] hover:border-slate-300 dark:hover:border-white/[0.12] hover:bg-white/80 dark:hover:bg-white/[0.04]"
              }`}
              onClick={() => togglePersona(persona.id)}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#00d4ff]/20">
                  <Check className="h-3 w-3 text-[#00d4ff]" />
                </div>
              )}

              <div className="flex items-start gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${color}12` }}
                >
                  <span className="text-base font-bold" style={{ color }}>
                    {persona.name.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white/90">{persona.name}</h4>
                    {persona.isPreset && (
                      <span
                        className="rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                        style={{ backgroundColor: `${color}10`, color }}
                      >
                        Preset
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-white/40 mb-2 font-[family-name:var(--font-noto-kr)]">
                    {persona.role}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {persona.expertise.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:text-white/50"
                        style={{
                          backgroundColor: `${color}08`,
                          border: `1px solid ${color}15`,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hover glow line */}
              <div
                className="pointer-events-none absolute -bottom-px left-1/2 h-px w-0 -translate-x-1/2 transition-all duration-500 group-hover:w-3/4"
                style={{
                  background: `linear-gradient(90deg, transparent, ${color}40, transparent)`,
                }}
              />
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setShowCreator(true)}
        className="group flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200/60 dark:border-white/[0.08] bg-white/30 dark:bg-white/[0.01] py-4 text-sm text-slate-400 dark:text-white/40 transition-all duration-300 hover:border-[#00d4ff]/20 hover:bg-white/60 dark:hover:bg-white/[0.03] hover:text-slate-600 dark:hover:text-white/60 font-[family-name:var(--font-noto-kr)]"
      >
        <Plus className="h-4 w-4 transition-transform group-hover:scale-110 group-hover:text-[#00d4ff]" />
        커스텀 페르소나 생성
      </button>

      {showCreator && (
        <PersonaCreator
          onCreated={handleCreated}
          onClose={() => setShowCreator(false)}
        />
      )}
    </div>
  );
}
