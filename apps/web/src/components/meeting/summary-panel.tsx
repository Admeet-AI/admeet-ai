"use client";

import { useMeetingStore } from "@/stores/meeting";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

export function SummaryPanel() {
  const summaries = useMeetingStore((s) => s.summaries);

  return (
    <div className="flex flex-col h-full">
      <h3 className="font-semibold text-sm mb-2 px-1">실시간 요약</h3>
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="space-y-2">
          {summaries.map((s, i) => (
            <Card key={i}>
              <CardContent className="p-3">
                <p className="text-sm">{s}</p>
              </CardContent>
            </Card>
          ))}
          {summaries.length === 0 && (
            <p className="text-sm text-muted-foreground px-1">회의가 진행되면 요약이 표시됩니다...</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
