"use client";

import { useEffect, useState } from "react";
import { useMeetingStore } from "@/stores/meeting";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useSmartScroll } from "@/hooks/use-smart-scroll";
import { ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getAIStyle } from "./shared-transcript";
import type { Persona, PersonaThought, PersonaSolution } from "../../../../../packages/shared/types";

const CATEGORY_COLORS = [
  "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
];

type TimelineItem =
  | { type: "thought"; data: PersonaThought }
  | { type: "solution"; data: PersonaSolution };

interface PersonaPanelProps {
  persona: Persona | null;
}

export function PersonaPanel({ persona }: PersonaPanelProps) {
  const thoughts = useMeetingStore((s) => s.thoughts);
  const solutions = useMeetingStore((s) => s.solutions);
  const activePersonas = useMeetingStore((s) => s.activePersonas);
  const isAnalyzing = useMeetingStore((s) => s.isAnalyzing);
  const lastRefreshAt = useMeetingStore((s) => s.lastRefreshAt);
  const analysisInterval = useMeetingStore((s) => s.analysisInterval);
  const [countdown, setCountdown] = useState(analysisInterval);

  // 페르소나별 카테고리 설정 빌드
  // 전체 모드(persona === null)일 때 모든 페르소나의 카테고리를 합침
  const categoryConfig: Record<string, { label: string; color: string; icon: string }> = (() => {
    if (persona) {
      return Object.fromEntries(
        persona.thoughtCategories.map((cat, i) => [
          cat.key,
          {
            label: cat.label,
            color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
            icon: cat.icon,
          },
        ])
      );
    }
    const merged: Record<string, { label: string; color: string; icon: string }> = {};
    let colorIdx = 0;
    for (const p of activePersonas) {
      for (const cat of p.thoughtCategories) {
        if (!merged[cat.key]) {
          merged[cat.key] = {
            label: cat.label,
            color: CATEGORY_COLORS[colorIdx % CATEGORY_COLORS.length],
            icon: cat.icon,
          };
          colorIdx++;
        }
      }
    }
    return merged;
  })();

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastRefreshAt) / 1000);
      const remaining = Math.max(0, analysisInterval - elapsed);
      setCountdown(remaining);
    }, 1000);
    return () => clearInterval(interval);
  }, [lastRefreshAt, analysisInterval]);

  // 페르소나별 필터링
  const filteredThoughts = persona
    ? thoughts.filter((t) => t.personaId === persona.id)
    : thoughts;
  const filteredSolutions = persona
    ? solutions.filter((s) => s.personaId === persona.id)
    : solutions;

  // 시간순 통합 타임라인
  const timeline: TimelineItem[] = [
    ...filteredThoughts.map((t) => ({ type: "thought" as const, data: t })),
    ...filteredSolutions.map((s) => ({ type: "solution" as const, data: s })),
  ].sort((a, b) => a.data.timestamp - b.data.timestamp);

  const { scrollRef, bottomRef, isAtBottom, handleScroll, scrollToBottom } =
    useSmartScroll({ deps: [timeline.length] });

  const progress = ((analysisInterval - countdown) / analysisInterval) * 100;
  const displayName = persona?.name || "전체";
  const signalHint = persona?.signalKeywords?.[0] || "호출";

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="font-semibold text-sm">{displayName}</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {isAnalyzing ? (
            <span className="flex items-center gap-1">
              <span className="animate-spin h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full" />
              분석 중...
            </span>
          ) : (
            <span>다음 분석까지 {countdown}초</span>
          )}
        </div>
      </div>

      {/* 프로그레스 바 */}
      <div className="h-1 bg-muted rounded-full mb-3 mx-1 overflow-hidden">
        <div
          className="h-full bg-blue-400 rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="relative flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="space-y-3 px-[0.5em] h-full overflow-y-auto"
          >
            {timeline.map((item) =>
              item.type === "thought" ? (
                <ThoughtCard
                  key={item.data.id}
                  thought={item.data}
                  categoryConfig={categoryConfig}
                />
              ) : (
                <SolutionCard key={item.data.id} solution={item.data} />
              )
            )}
            {timeline.length === 0 && (
              <p className="text-sm text-muted-foreground px-1">
                회의 내용을 관찰하며 {displayName}이(가) 인사이트를 제공합니다.
                <br />
                <span className="text-xs">
                  &quot;{signalHint}&quot;(으)로 호출하면 솔루션을 제안합니다.
                </span>
              </p>
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        {/* 새 인사이트 플로팅 버튼 */}
        {!isAtBottom && timeline.length > 0 && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 rounded-full bg-blue-500 px-3 py-1.5 text-xs font-medium text-white shadow-lg transition-all hover:bg-blue-600 animate-[fadeInUp_0.3s_ease-out_both]"
          >
            <ChevronDown className="h-3 w-3" />
            새 인사이트
          </button>
        )}
      </div>
    </div>
  );
}

function ThoughtCard({
  thought,
  categoryConfig,
}: {
  thought: PersonaThought;
  categoryConfig: Record<string, { label: string; color: string; icon: string }>;
}) {
  const config = categoryConfig[thought.category] || {
    label: thought.category,
    color: CATEGORY_COLORS[0],
    icon: "📌",
  };
  const personaColor = thought.personaName
    ? getAIStyle(thought.personaName).color
    : undefined;

  return (
    <Card className="border-border bg-muted/50 animate-[bubbleIn_0.4s_ease-out_both]">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-1.5">
          {thought.personaName && (
            <span
              className="text-xs font-bold"
              style={{ color: personaColor }}
            >
              {thought.personaName}
            </span>
          )}
          <Badge variant="secondary" className={`text-xs px-2 py-0.5 ${config.color}`}>
            {config.label}
          </Badge>
        </div>
        <p className="text-sm leading-relaxed">{thought.content}</p>
      </CardContent>
    </Card>
  );
}

function SolutionCard({ solution }: { solution: PersonaSolution }) {
  const personaColor = solution.personaName
    ? getAIStyle(solution.personaName).color
    : undefined;

  return (
    <Card className="border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/30 animate-[bubbleIn_0.4s_ease-out_both]">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-1.5">
          {solution.personaName && (
            <span
              className="text-xs font-bold"
              style={{ color: personaColor }}
            >
              {solution.personaName}
            </span>
          )}
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 text-xs px-2 py-0.5">
            솔루션
          </Badge>
        </div>
        <p className="text-xs text-blue-600 dark:text-blue-400 mb-1.5 font-medium">Q. {solution.question}</p>
        <p className="text-sm leading-relaxed">{solution.solution}</p>
        {solution.context && (
          <p className="text-xs text-muted-foreground mt-2 border-t pt-1.5">
            {solution.context}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
