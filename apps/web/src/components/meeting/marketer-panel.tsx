"use client";

import { useEffect, useState } from "react";
import { useMeetingStore } from "@/stores/meeting";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { MarketerThought, MarketerSolution } from "../../../../../packages/shared/types";


const categoryConfig: Record<string, { label: string; color: string; icon: string }> = {
  observation: { label: "관찰", color: "bg-slate-100 text-slate-700", icon: "👀" },
  concern: { label: "우려", color: "bg-amber-100 text-amber-800", icon: "⚠️" },
  opportunity: { label: "기회", color: "bg-green-100 text-green-800", icon: "✨" },
  insight: { label: "인사이트", color: "bg-purple-100 text-purple-800", icon: "💡" },
};

type TimelineItem =
  | { type: "thought"; data: MarketerThought }
  | { type: "solution"; data: MarketerSolution };

export function MarketerPanel() {
  const thoughts = useMeetingStore((s) => s.thoughts);
  const solutions = useMeetingStore((s) => s.solutions);
  const isAnalyzing = useMeetingStore((s) => s.isAnalyzing);
  const lastRefreshAt = useMeetingStore((s) => s.lastRefreshAt);
  const analysisInterval = useMeetingStore((s) => s.analysisInterval);
  const [countdown, setCountdown] = useState(analysisInterval);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastRefreshAt) / 1000);
      const remaining = Math.max(0, analysisInterval - elapsed);
      setCountdown(remaining);
    }, 1000);
    return () => clearInterval(interval);
  }, [lastRefreshAt]);

  // 시간순 통합 타임라인
  const timeline: TimelineItem[] = [
    ...thoughts.map((t) => ({ type: "thought" as const, data: t })),
    ...solutions.map((s) => ({ type: "solution" as const, data: s })),
  ].sort((a, b) => a.data.timestamp - b.data.timestamp);

  const progress = ((analysisInterval - countdown) / analysisInterval) * 100;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="font-semibold text-sm">AI 마케터</h3>
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
      <div className="h-1 bg-slate-100 rounded-full mb-3 mx-1 overflow-hidden">
        <div
          className="h-full bg-blue-400 rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ScrollArea className="flex-1 overflow-hidden">
        <div className="space-y-3">
          {timeline.map((item) =>
            item.type === "thought" ? (
              <ThoughtCard key={item.data.id} thought={item.data} />
            ) : (
              <SolutionCard key={item.data.id} solution={item.data} />
            )
          )}
          {timeline.length === 0 && (
            <p className="text-sm text-muted-foreground px-1">
              회의 내용을 관찰하며 마케팅 인사이트를 제공합니다.
              <br />
              <span className="text-xs">&quot;애드밋아&quot;로 호출하면 솔루션을 제안합니다.</span>
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function ThoughtCard({ thought }: { thought: MarketerThought }) {
  const config = categoryConfig[thought.category] || categoryConfig.observation;

  return (
    <Card className="border-slate-200 bg-slate-50/50">
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

function SolutionCard({ solution }: { solution: MarketerSolution }) {
  return (
    <Card className="border-blue-300 bg-blue-50">
      <CardContent className="p-3">
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0 mb-1.5">
          솔루션
        </Badge>
        <p className="text-xs text-blue-600 mb-1.5 font-medium">Q. {solution.question}</p>
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
