"use client";

import { useEffect, useRef } from "react";
import { useMeetingStore } from "@/stores/meeting";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BrainCircuit, Target, BarChart3, Users, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/** 페르소나별 고유 컬러 (랜딩페이지와 동일) */
const AI_COLORS: Record<string, { color: string; icon: typeof BrainCircuit }> = {
  "시니어 마케터": { color: "#00d4ff", icon: Target },
  마케터: { color: "#00d4ff", icon: Target },
  "데이터 분석가": { color: "#7c3aed", icon: BarChart3 },
  PM: { color: "#7c3aed", icon: BarChart3 },
  "UX 디자이너": { color: "#f59e0b", icon: Users },
  "UX 리서처": { color: "#f59e0b", icon: Users },
  CTO: { color: "#10b981", icon: BrainCircuit },
  "법무 자문": { color: "#ef4444", icon: ShieldCheck },
};

function getAIStyle(name: string) {
  return AI_COLORS[name] || { color: "#00d4ff", icon: BrainCircuit };
}

export { getAIStyle, AI_COLORS };

export function SharedTranscript() {
  const allTranscripts = useMeetingStore((s) => s.transcripts);
  const interimTranscript = useMeetingStore((s) => s.interimTranscript);
  const currentUserName = useMeetingStore((s) => s.currentUserName);
  const solutions = useMeetingStore((s) => s.solutions);
  const participants = useMeetingStore((s) => s.participants);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allTranscripts.length, solutions.length]);

  // 인간 참여자 트랜스크립트만 (AI 발언 제외)
  const humanTranscripts = allTranscripts.filter(
    (t) => !t.isAI && !t.speakerId.startsWith("ai-")
  );

  // speakerId → participant displayName 매핑
  const getParticipantName = (speakerId: string) => {
    const p = participants.find((p) => p.id === speakerId);
    return p?.displayName || "";
  };

  // 인간 트랜스크립트 + AI 솔루션만 시간순으로 통합
  type TimelineItem =
    | { kind: "transcript"; data: (typeof humanTranscripts)[number] }
    | { kind: "solution"; data: (typeof solutions)[number] };

  const timeline: TimelineItem[] = [
    ...humanTranscripts.map((t) => ({ kind: "transcript" as const, data: t })),
    ...solutions.map((s) => ({ kind: "solution" as const, data: s })),
  ].sort((a, b) => {
    const tsA = "timestamp" in a.data ? a.data.timestamp : 0;
    const tsB = "timestamp" in b.data ? b.data.timestamp : 0;
    return tsA - tsB;
  });

  return (
    <ScrollArea className="flex-1 overflow-hidden">
      <div className="p-4 space-y-3">
        {timeline.map((item, i) => {
          if (item.kind === "solution") {
            return (
              <SolutionBubble
                key={`sol-${item.data.id}`}
                solution={item.data}
                personaName={getParticipantName(`ai-${item.data.personaId}`)}
              />
            );
          }

          const t = item.data;
          const isMe = t.speakerName === currentUserName;

          if (isMe) {
            return (
              <MyBubble
                key={`t-${t.timestamp}-${i}`}
                text={t.text}
                timestamp={t.timestamp}
              />
            );
          }

          return (
            <OtherBubble
              key={`t-${t.timestamp}-${i}`}
              name={t.speakerName}
              text={t.text}
              timestamp={t.timestamp}
            />
          );
        })}

        {/* 실시간 중간 입력 */}
        {interimTranscript && (
          <div className="flex justify-end">
            <div className="max-w-[75%]">
              <div className="px-4 py-2.5 rounded-2xl rounded-br-sm bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 text-sm italic">
                {interimTranscript}
                <span className="inline-flex ml-1.5 gap-0.5">
                  <span className="h-1 w-1 rounded-full bg-current opacity-60 animate-bounce" />
                  <span className="h-1 w-1 rounded-full bg-current opacity-60 animate-bounce [animation-delay:0.15s]" />
                  <span className="h-1 w-1 rounded-full bg-current opacity-60 animate-bounce [animation-delay:0.3s]" />
                </span>
              </div>
            </div>
          </div>
        )}

        {timeline.length === 0 && !interimTranscript && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#0066ff]/10 to-[#00d4ff]/10 flex items-center justify-center mb-4">
              <BrainCircuit className="h-7 w-7 text-[#00d4ff]/50" />
            </div>
            <p className="text-sm font-medium mb-1">회의가 시작되면</p>
            <p className="text-sm text-muted-foreground/60">
              참여자들의 발언이 여기에 표시됩니다
            </p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}

/** 내 메시지 - 오른쪽 정렬 */
function MyBubble({ text, timestamp }: { text: string; timestamp: number }) {
  return (
    <div className="flex justify-end gap-2">
      <div className="flex flex-col items-end max-w-[75%]">
        <div className="px-4 py-2.5 rounded-2xl rounded-br-sm bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm leading-relaxed">
          {text}
        </div>
        <TimeStamp timestamp={timestamp} className="mr-1" />
      </div>
    </div>
  );
}

/** 다른 참여자 메시지 - 왼쪽 정렬 */
function OtherBubble({
  name,
  text,
  timestamp,
}: {
  name: string;
  text: string;
  timestamp: number;
}) {
  return (
    <div className="flex gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-white/[0.06] text-xs font-bold text-slate-500 dark:text-white/40">
        {name[0]?.toUpperCase()}
      </div>
      <div className="flex flex-col max-w-[75%]">
        <span className="text-[11px] font-medium text-slate-500 dark:text-white/40 mb-1 ml-1">
          {name}
        </span>
        <div className="px-4 py-2.5 rounded-2xl rounded-tl-sm border border-slate-200/60 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.03] text-sm leading-relaxed">
          {text}
        </div>
        <TimeStamp timestamp={timestamp} className="ml-1" />
      </div>
    </div>
  );
}

/** AI 솔루션 카드 - 채팅 내 특별 카드 (랜딩페이지 Signal 스타일) */
function SolutionBubble({
  solution,
  personaName,
}: {
  solution: {
    id: string;
    question: string;
    solution: string;
    context?: string;
    personaId?: string;
    timestamp: number;
  };
  personaName: string;
}) {
  const displayName = personaName || "AI 전문가";
  const { color, icon: Icon } = getAIStyle(displayName);

  return (
    <div className="flex gap-2.5">
      {/* 페르소나 아이콘 */}
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="h-4 w-4" style={{ color }} />
      </div>

      <div className="flex-1 max-w-[85%]">
        {/* 이름 + 솔루션 뱃지 */}
        <div className="flex items-center gap-1.5 mb-1 ml-1">
          <span className="text-[11px] font-semibold" style={{ color }}>
            {displayName}
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[9px] font-medium"
            style={{ backgroundColor: `${color}10`, color }}
          >
            솔루션
          </span>
        </div>

        {/* 솔루션 카드 */}
        <div
          className="rounded-2xl rounded-tl-sm border overflow-hidden"
          style={{
            borderColor: `${color}20`,
            background: `linear-gradient(135deg, ${color}08, ${color}03)`,
          }}
        >
          {/* 질문 헤더 */}
          <div
            className="px-4 py-2.5 border-b"
            style={{
              borderColor: `${color}15`,
              backgroundColor: `${color}06`,
            }}
          >
            <p className="text-xs font-medium" style={{ color }}>
              Q. {solution.question}
            </p>
          </div>

          {/* 답변 본문 */}
          <div className="px-4 py-3">
            <p className="text-[13px] leading-relaxed text-slate-600 dark:text-white/70">
              {solution.solution}
            </p>
            {solution.context && (
              <p
                className="text-xs text-muted-foreground mt-2.5 pt-2.5 border-t"
                style={{ borderColor: `${color}10` }}
              >
                {solution.context}
              </p>
            )}
          </div>
        </div>
        <TimeStamp timestamp={solution.timestamp} className="ml-1" />
      </div>
    </div>
  );
}

/** 공통 타임스탬프 */
function TimeStamp({
  timestamp,
  className,
}: {
  timestamp: number;
  className?: string;
}) {
  return (
    <span className={cn("text-[10px] text-muted-foreground/60 mt-1", className)}>
      {new Date(timestamp).toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      })}
    </span>
  );
}
