"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMeetingStore } from "@/stores/meeting";
import { BarChart3, X } from "lucide-react";

interface SummaryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SummaryDrawer({ open, onOpenChange }: SummaryDrawerProps) {
  const summaries = useMeetingStore((s) => s.summaries);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* 슬라이드 패널 */}
      <aside className="absolute inset-y-0 right-0 w-[85%] max-w-[400px] bg-card border-l border-border flex flex-col animate-[slideInRight_0.25s_ease-out_both]">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[#7c3aed]" />
            <span className="text-sm font-semibold">실시간 요약</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* 요약 내용 */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {summaries.map((s, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-slate-50 dark:bg-slate-900/50 p-3.5 animate-[bubbleIn_0.4s_ease-out_both]"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-xs font-bold text-[#7c3aed]">
                    요약 #{i + 1}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {s}
                </p>
              </div>
            ))}
            {summaries.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <BarChart3 className="h-8 w-8 mb-3 opacity-30" />
                <p className="text-sm font-medium mb-1">아직 요약이 없습니다</p>
                <p className="text-xs text-muted-foreground/60">
                  회의가 진행되면 요약이 표시됩니다
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>
    </div>
  );
}
