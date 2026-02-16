"use client";

import { useEffect, useState } from "react";
import { useMeetingStore } from "@/stores/meeting";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  const isAnalyzing = useMeetingStore((s) => s.isAnalyzing);
  const lastRefreshAt = useMeetingStore((s) => s.lastRefreshAt);
  const analysisInterval = useMeetingStore((s) => s.analysisInterval);
  const [countdown, setCountdown] = useState(analysisInterval);

  // 페르소나별 카테고리 설정 빌드
  const categoryConfig: Record<string, { label: string; color: string; icon: string }> =
    persona
      ? Object.fromEntries(
          persona.thoughtCategories.map((cat, i) => [
            cat.key,
            {
              label: cat.label,
              color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
              icon: cat.icon,
            },
          ])
        )
      : {
          observation: { label: "관찰", color: CATEGORY_COLORS[0], icon: "👀" },
          concern: { label: "우려", color: CATEGORY_COLORS[1], icon: "⚠️" },
          opportunity: { label: "기회", color: CATEGORY_COLORS[2], icon: "✨" },
          insight: { label: "인사이트", color: CATEGORY_COLORS[3], icon: "💡" },
        };

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

  const progress = ((analysisInterval - countdown) / analysisInterval) * 100;
  const displayName = persona?.name || "AI 페르소나";
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

      <ScrollArea className="flex-1 overflow-hidden">
        <div className="space-y-3">
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
        </div>
      </ScrollArea>
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

  return (
    <Card className="border-border bg-muted/50">
      <CardContent className="p-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-sm">{config.icon}</span>
          <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${config.color}`}>
            {config.label}
          </Badge>
        </div>
        <p className="text-sm leading-relaxed">{thought.content}</p>
      </CardContent>
    </Card>
  );
}

function SolutionCard({ solution }: { solution: PersonaSolution }) {
  return (
    <Card className="border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/30">
      <CardContent className="p-3">
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 text-[10px] px-1.5 py-0 mb-1.5">
          솔루션
        </Badge>
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
