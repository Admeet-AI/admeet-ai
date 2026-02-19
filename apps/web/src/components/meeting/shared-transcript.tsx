"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useMeetingStore } from "@/stores/meeting";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BrainCircuit, Target, BarChart3, Users, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatFeedBubble } from "@/components/landing/chat-feed-bubble";

const LABEL_USER = "참여자";
const LABEL_AI_EXPERT = "AI 전문가";
const EMPTY_STATE_TITLE = "회의가 시작되면";
const EMPTY_STATE_BODY = "참여자들의 발언이 여기에 표시됩니다";

/** Persona color map shared with meeting panels. */
const AI_COLORS: Record<string, { color: string; icon: typeof BrainCircuit }> = {
  ["시니어 마케터"]: { color: "#2563eb", icon: Target },
  ["마케터"]: { color: "#2563eb", icon: Target },
  ["데이터 분석가"]: { color: "#7c3aed", icon: BarChart3 },
  PM: { color: "#7c3aed", icon: BarChart3 },
  ["UX 디자이너"]: { color: "#d97706", icon: Users },
  ["UX 리서처"]: { color: "#d97706", icon: Users },
  CTO: { color: "#059669", icon: BrainCircuit },
  ["법무 자문"]: { color: "#dc2626", icon: ShieldCheck },
};

function getAIStyle(name: string) {
  return AI_COLORS[name] || { color: "#2563eb", icon: BrainCircuit };
}

export { getAIStyle, AI_COLORS };

export function SharedTranscript() {
  const allTranscripts = useMeetingStore((s) => s.transcripts);
  const interimTranscript = useMeetingStore((s) => s.interimTranscript);
  const currentUserName = useMeetingStore((s) => s.currentUserName);
  const currentUserId = useMeetingStore((s) => s.currentUserId);
  const solutions = useMeetingStore((s) => s.solutions);
  const participants = useMeetingStore((s) => s.participants);

  const bottomRef = useRef<HTMLDivElement>(null);
  const bubbleRefs = useRef(new Map<string, HTMLDivElement | null>());
  const animatedKeysRef = useRef(new Set<string>());

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allTranscripts.length, solutions.length]);

  useEffect(() => {
    bubbleRefs.current.forEach((node, key) => {
      if (!node || animatedKeysRef.current.has(key)) return;
      animatedKeysRef.current.add(key);

      gsap.fromTo(
        node,
        { opacity: 0, y: 30, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.55,
          ease: "back.out(1.45)",
        }
      );
    });
  }, [allTranscripts.length, solutions.length]);

  useEffect(() => {
    const refs = bubbleRefs.current;
    return () => {
      refs.forEach((node) => {
        if (node) gsap.killTweensOf(node);
      });
      refs.clear();
      animatedKeysRef.current.clear();
    };
  }, []);

  const humanTranscripts = allTranscripts.filter((t) => !t.isAI && !t.speakerId.startsWith("ai-"));

  const getParticipantName = (speakerId: string) => {
    const participant = participants.find((p) => p.id === speakerId);
    return participant?.displayName || "";
  };

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
    <ScrollArea className="h-full">
      <div className="space-y-3 p-4">
        {timeline.map((item, i) => {
          if (item.kind === "solution") {
            const personaName =
              getParticipantName(`ai-${item.data.personaId}`) ||
              item.data.personaName ||
              LABEL_AI_EXPERT;
            const { color } = getAIStyle(personaName);
            const solutionText = `Q. ${item.data.question}\n\n${item.data.solution}${
              item.data.context ? `\n\n${item.data.context}` : ""
            }`;

            const solKey = `sol-${item.data.id}`;
            return (
              <div className="flex w-full flex-col items-start" key={solKey}>
                <ChatFeedBubble
                  align="left"
                  label={personaName}
                  text={solutionText}
                  color={color}
                  speakerType="ai"
                  className="max-w-[85%]"
                  bubbleRef={(el) => {
                    if (el) bubbleRefs.current.set(solKey, el);
                    else bubbleRefs.current.delete(solKey);
                  }}
                />
                <TimeStamp timestamp={item.data.timestamp} className="ml-1" />
              </div>
            );
          }

          const transcript = item.data;
          const isMe =
            (currentUserId && transcript.speakerId === currentUserId) ||
            transcript.speakerName === currentUserName;
          const isAI = transcript.isAI || transcript.speakerId.startsWith("ai-");
          const speakerLabel = transcript.speakerName || (isAI ? "AI" : LABEL_USER);
          const myLabel = currentUserName || speakerLabel;

          const color = isAI ? getAIStyle(speakerLabel).color : "#94a3b8";

          const tKey = `t-${transcript.timestamp}-${i}`;
          return (
            <div
              className={`flex w-full flex-col ${isMe ? "items-end" : "items-start"}`}
              key={tKey}
            >
              <ChatFeedBubble
                align={isMe ? "right" : "left"}
                label={isMe ? myLabel : speakerLabel}
                text={transcript.text}
                color={color}
                speakerType={isAI ? "ai" : "user"}
                className="max-w-[85%]"
                bubbleRef={(el) => {
                  if (el) bubbleRefs.current.set(tKey, el);
                  else bubbleRefs.current.delete(tKey);
                }}
              />
              <TimeStamp timestamp={transcript.timestamp} className={isMe ? "mr-1" : "ml-1"} />
            </div>
          );
        })}

        {interimTranscript && (
          <div className="flex justify-end">
            <div className="max-w-[75%]">
              <div className="rounded-2xl rounded-br-sm border border-slate-300/70 bg-slate-200/70 px-4 py-2.5 text-sm italic text-slate-700 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100">
                {interimTranscript}
                <span className="ml-1.5 inline-flex gap-0.5">
                  <span className="h-1 w-1 animate-bounce rounded-full bg-current opacity-60" />
                  <span className="h-1 w-1 animate-bounce rounded-full bg-current opacity-60 [animation-delay:0.15s]" />
                  <span className="h-1 w-1 animate-bounce rounded-full bg-current opacity-60 [animation-delay:0.3s]" />
                </span>
              </div>
            </div>
          </div>
        )}

        {timeline.length === 0 && !interimTranscript && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-[#0066ff]/10 to-[#00d4ff]/10">
              <img src="/logo.png" alt="AdMeet AI" className="h-7 w-7 opacity-50" />
            </div>
            <p className="mb-1 text-sm font-medium">{EMPTY_STATE_TITLE}</p>
            <p className="text-sm text-muted-foreground/60">{EMPTY_STATE_BODY}</p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}

function TimeStamp({
  timestamp,
  className,
}: {
  timestamp: number;
  className?: string;
}) {
  return (
    <span className={cn("mt-1 text-[10px] text-muted-foreground/60", className)}>
      {new Date(timestamp).toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      })}
    </span>
  );
}
