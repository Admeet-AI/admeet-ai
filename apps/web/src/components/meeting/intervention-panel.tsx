"use client";

import { useMeetingStore } from "@/stores/meeting";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const triggerLabels: Record<string, string> = {
  target_vague: "타겟 모호",
  message_abstract: "메시지 추상",
  experiment_missing: "실험 부재",
};

const triggerColors: Record<string, string> = {
  target_vague: "bg-orange-100 text-orange-800",
  message_abstract: "bg-purple-100 text-purple-800",
  experiment_missing: "bg-blue-100 text-blue-800",
};

export function InterventionPanel() {
  const interventions = useMeetingStore((s) => s.interventions);

  return (
    <div className="flex flex-col h-full">
      <h3 className="font-semibold text-sm mb-2 px-1">AI 마케터 개입</h3>
      <ScrollArea className="flex-1">
        <div className="space-y-3">
          {interventions.map((item) => (
            <Card key={item.id} className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-3">
                <Badge variant="secondary" className={triggerColors[item.trigger] || ""}>
                  {triggerLabels[item.trigger] || item.trigger}
                </Badge>
                <p className="text-sm mt-2 leading-relaxed">{item.message}</p>
              </CardContent>
            </Card>
          ))}
          {interventions.length === 0 && (
            <p className="text-sm text-muted-foreground px-1">
              마케팅 관점에서 개입이 필요하면 AI가 질문합니다...
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
