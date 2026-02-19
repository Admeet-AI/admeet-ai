"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Cpu, Mic, MessageCircle, Send, UserRound } from "lucide-react";
import { gsap } from "gsap";
import { ChatFeedBubble } from "@/components/landing/chat-feed-bubble";

type BubbleMessage = {
  id: number;
  name: string;
  role: "Host" | "AI";
  text: string;
  color: string;
};

const DEMO_STREAM: Omit<BubbleMessage, "id">[] = [
  {
    name: "나",
    role: "Host",
    text: "요즘 잠재 고객이 계속 이탈하는 구간이 어디인지 먼저 보려고요.",
    color: "#94a3b8",
  },
  {
    name: "PM",
    role: "AI",
    text: "좋아요. 지금은 첫 30초 이탈 포인트가 가장 중요합니다. 지표 순서를 정렬해볼게요.",
    color: "#7c3aed",
  },
  {
    name: "마케터",
    role: "AI",
    text: "메시지 톤이 길어요. 제안은 한 문장으로 먼저 정리하고, CTA로 바로 연결하세요.",
    color: "#00d4ff",
  },
  {
    name: "디자이너",
    role: "AI",
    text: "버튼 대비와 간격을 강화하면 오인률이 줄고, CTA 클릭률이 바로 안정됩니다.",
    color: "#f59e0b",
  },
  {
    name: "나",
    role: "Host",
    text: "그럼 지금 당장 바꿔야 할 액션이 뭐가 제일 급한가요?",
    color: "#94a3b8",
  },
  {
    name: "PM",
    role: "AI",
    text: "우선순위는 1) 핵심 제안 한 줄 정리 2) 질문 유도형 CTA 3) 재방문 리마인드입니다.",
    color: "#7c3aed",
  },
  {
    name: "마케터",
    role: "AI",
    text: "광고는 인스타 확장형 우선, 유튜브 쇼츠는 2주 실험으로 가볍게 노출을 보강하세요.",
    color: "#00d4ff",
  },
  {
    name: "디자이너",
    role: "AI",
    text: "현재 버튼 위치를 상단으로 한 단계 당겨서 확인하세요. 오입력/이탈이 확 줄어듭니다.",
    color: "#f59e0b",
  },
];

const AI_STREAM: Omit<BubbleMessage, "id">[] = [
  {
    name: "PM",
    role: "AI",
    text: "좋은 포인트입니다. 지금 맥락은 오리엔테이션 단계라 메시지 통일이 중요해 보여요.",
    color: "#7c3aed",
  },
  {
    name: "마케터",
    role: "AI",
    text: "그 이슈는 인식했습니다. 지금은 참여율을 높이려면 질문 템플릿 정규화가 우선입니다.",
    color: "#00d4ff",
  },
  {
    name: "디자이너",
    role: "AI",
    text: "1분 뒤 액션 3개: 온보딩 문구 축약, 2차 툴팁 배치, CTA 우선순위 재정렬입니다.",
    color: "#f59e0b",
  },
  {
    name: "PM",
    role: "AI",
    text: "리스크 알림: 나 2명이 계속 같은 흐름에서 벗어나고 있어요. 질문 전환 신호를 넣어보세요.",
    color: "#7c3aed",
  },
  {
    name: "마케터",
    role: "AI",
    text: "현재 상태 점수는 72점입니다. 문장 길이 감소형 리라이팅으로 84점까지 개선 가능성이 큽니다.",
    color: "#00d4ff",
  },
];

export function LiveBubbleStream() {
  const [bubbles, setBubbles] = useState<BubbleMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const indexRef = useRef(0);
  const demoTimeoutRef = useRef<number | null>(null);
  const replyTimeoutRefs = useRef<number[]>([]);
  const isDemoModeRef = useRef(true);
  const aiReplyIndexRef = useRef(0);
  const idRef = useRef(1);
  const bubbleRefs = useRef(new Map<number, HTMLDivElement | null>());
  const streamRef = useRef<HTMLDivElement | null>(null);

  const appendBubble = (template: Omit<BubbleMessage, "id">) => {
    setBubbles((prev) => {
      const next = [...prev, { ...template, id: idRef.current++ }];
      return next.slice(-10);
    });
  };

  useEffect(() => {
    const bubbleMap = bubbleRefs.current;

    const pushDemoBubble = () => {
      if (!isDemoModeRef.current) return;

      const template = DEMO_STREAM[indexRef.current];
      indexRef.current = (indexRef.current + 1) % DEMO_STREAM.length;
      appendBubble(template);

      demoTimeoutRef.current = window.setTimeout(
        pushDemoBubble,
        template.role === "Host" ? 2600 : 2200
      );
    };

    demoTimeoutRef.current = window.setTimeout(pushDemoBubble, 1700);

    return () => {
      if (demoTimeoutRef.current) {
        window.clearTimeout(demoTimeoutRef.current);
      }

      replyTimeoutRefs.current.forEach((timeoutRef) => {
        window.clearTimeout(timeoutRef);
      });
      replyTimeoutRefs.current = [];

      bubbleMap.forEach((node) => {
        if (node) {
          gsap.killTweensOf(node);
        }
      });
      bubbleMap.clear();
    };
  }, []);

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = inputMessage.trim();
    if (!message) return;

    isDemoModeRef.current = false;
    if (demoTimeoutRef.current) {
      window.clearTimeout(demoTimeoutRef.current);
      demoTimeoutRef.current = null;
    }

    appendBubble({
      name: "나",
      role: "Host",
      text: message,
      color: "#94a3b8",
    });
    setInputMessage("");

    const replies = [
      AI_STREAM[aiReplyIndexRef.current % AI_STREAM.length],
      AI_STREAM[(aiReplyIndexRef.current + 1) % AI_STREAM.length],
      AI_STREAM[(aiReplyIndexRef.current + 2) % AI_STREAM.length],
    ];
    aiReplyIndexRef.current += 3;

    replyTimeoutRefs.current.forEach((timeoutRef) => {
      window.clearTimeout(timeoutRef);
    });
    replyTimeoutRefs.current = [];

    replies.forEach((reply, index) => {
      const timerRef = window.setTimeout(() => {
        appendBubble(reply);
      }, 1500 + index * 2200 + Math.floor(Math.random() * 500));
      replyTimeoutRefs.current.push(timerRef);
    });
  };

  useEffect(() => {
    if (!streamRef.current) return;
    streamRef.current.scrollTop = streamRef.current.scrollHeight;
  }, [bubbles]);

  useEffect(() => {
    const latest = bubbles[bubbles.length - 1];
    if (!latest) return;

    const node = bubbleRefs.current.get(latest.id);
    if (!node) return;

    gsap.killTweensOf(node);
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

    bubbleRefs.current.forEach((nodeRef, key) => {
      if (!bubbles.find((bubble) => bubble.id === key)) {
        if (nodeRef) {
          gsap.killTweensOf(nodeRef);
        }
        bubbleRefs.current.delete(key);
      }
    });
  }, [bubbles]);

  return (
    <div className="relative">
      <div className="relative max-w-lg mx-auto">
        <div className="rounded-2xl border border-slate-200/60 bg-white/70 dark:border-white/[0.06] dark:bg-white/[0.02] p-5 backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                <span className="absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-30 animate-ping" />
                <Mic className="h-3.5 w-3.5 text-emerald-500" />
              </span>
            </div>
            <div className="flex items-center gap-2">
              <UserRound className="h-3.5 w-3.5 text-slate-400" />
              <MessageCircle className="h-3.5 w-3.5 text-slate-400" />
              <Cpu className="h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>

          <div
            ref={streamRef}
            className="live-bubble-feed flex h-[420px] flex-col justify-end gap-3 overflow-y-auto pr-1"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {bubbles.map((bubble) => {
              const isParticipant = bubble.role === "Host";

              return (
                <ChatFeedBubble
                  key={bubble.id}
                  align={isParticipant ? "right" : "left"}
                  label={bubble.role === "AI" ? bubble.name : "나"}
                  text={bubble.text}
                  color={bubble.color}
                  bubbleRef={(el) => {
                    if (el) {
                      bubbleRefs.current.set(bubble.id, el);
                    } else {
                      bubbleRefs.current.delete(bubble.id);
                    }
                  }}
                />
              );
            })}
          </div>

          <form
            className="mt-3 flex items-center gap-2"
            onSubmit={(event) => {
              sendMessage(event);
            }}
          >
            <input
              value={inputMessage}
              onChange={(event) => setInputMessage(event.target.value)}
              disabled
              className="flex-1 rounded-full border border-slate-200/70 bg-white/90 px-3 py-2 text-xs text-slate-700 placeholder:text-slate-400 dark:border-white/[0.1] dark:bg-slate-900/40 dark:text-white"
              placeholder="메시지를 입력하세요..."
            />
            <button
              type="submit"
              disabled
              className="inline-flex h-9 items-center justify-center rounded-full bg-[#0066ff] px-3 text-xs font-semibold text-white transition hover:bg-[#0052cc]"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

        <style>{`
          .live-bubble-feed::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </div>
  );
}
