"use client";

import { useEffect, useRef } from "react";
import { Target, BarChart3, Users, Plus } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PERSONA_SHOWCASE = [
  {
    name: "마케터",
    role: "고객 관점 해석",
    expertise: ["퍼널 분석", "실험 설계", "A/B 테스트"],
    icon: Target,
    color: "#00d4ff",
    thought: "2030 고객들이 반복해서 꺼내는 불안, 이 대화에도 보이네요. 묶어서 정리해드릴게요.",
    category: "관찰",
  },
  {
    name: "PM",
    role: "우선순위 판단",
    expertise: ["목표 정합성", "리스크 분석", "지표 추적"],
    icon: BarChart3,
    color: "#7c3aed",
    thought: "지금 나온 것 중 KPI에 직결되는 건 두 가지예요. 나머지는 나중에 봐도 됩니다.",
    category: "우선순위",
  },
  {
    name: "디자이너",
    role: "사용자 흐름 개선",
    expertise: ["온보딩", "전환 동선", "메시지 톤"],
    icon: Users,
    color: "#f59e0b",
    thought: "여기서 사용자가 막히겠다 싶은 부분이 보여요. 문구 하나만 바꿔도 확 달라질 거예요.",
    category: "경험",
  },
];

export { PERSONA_SHOWCASE };

export function PersonaSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const header = headerRef.current;
    const cards = cardsRef.current;
    if (!section || !header || !cards) return;

    const cardEls = cards.querySelectorAll<HTMLElement>(".persona-card");
    const iconEls = cards.querySelectorAll<HTMLElement>(".persona-icon");
    const plusCard = cards.querySelector<HTMLElement>(".plus-card");

    const ctx = gsap.context(() => {
      gsap.fromTo(
        header,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: header,
            start: "top 85%",
            once: true,
          },
        }
      );

      gsap.fromTo(
        cardEls,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: cards,
            start: "top 80%",
            once: true,
          },
        }
      );

      gsap.fromTo(
        iconEls,
        { scale: 0 },
        {
          scale: 1,
          duration: 0.5,
          stagger: 0.15,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: cards,
            start: "top 80%",
            once: true,
          },
          delay: 0.3,
        }
      );

      if (plusCard) {
        gsap.fromTo(
          plusCard,
          { opacity: 0, scale: 0.9 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: plusCard,
              start: "top 85%",
              once: true,
            },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative z-10 mx-auto max-w-7xl px-6 py-14 md:py-24 md:px-12"
    >
      <div ref={headerRef} className="mb-8 w-full text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#00d4ff]/70">
          AI Personas
        </p>
        <h2
          className="font-bold tracking-tight"
          style={{ fontSize: "clamp(1.5rem, 1rem + 2.5vw, 2.25rem)" }}
        >
          각자의 눈으로 회의에 참여하는 AI
        </h2>
        <p className="mt-4 text-sm text-slate-500 dark:text-white/40">
          같은 대화에서 서로 다른 인사이트를 건져냅니다.
        </p>
      </div>

      <div ref={cardsRef} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PERSONA_SHOWCASE.map((persona) => (
          <div
            key={persona.name}
            className="persona-card group relative rounded-2xl border border-slate-200/60 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.02] p-6 transition-all duration-500 hover:border-slate-300 dark:hover:border-white/[0.12] hover:bg-white/80 dark:hover:bg-white/[0.04]"
          >
            <div
              className="persona-icon mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: `${persona.color}12` }}
            >
              <persona.icon className="h-6 w-6" style={{ color: persona.color }} />
            </div>
            <h3 className="mb-1 text-base font-bold">{persona.name}</h3>
            <p className="mb-3 text-xs text-slate-500 dark:text-white/40">{persona.role}</p>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {persona.expertise.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-white/50"
                  style={{
                    backgroundColor: `${persona.color}08`,
                    border: `1px solid ${persona.color}15`,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-sm text-slate-600 dark:text-white/60">{persona.thought}</p>
          </div>
        ))}

        <div className="plus-card group relative flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200/60 dark:border-white/[0.08] bg-white/30 dark:bg-white/[0.01] p-6 transition-all duration-500 hover:border-[#00d4ff]/20 hover:bg-white/60 dark:hover:bg-white/[0.03]">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.04]">
            <Plus className="h-6 w-6 text-slate-400 dark:text-white/30" />
          </div>
          <h3 className="mb-1 text-sm font-semibold text-slate-500 dark:text-white/50">
            나만의 전문가 추가
          </h3>
          <p className="text-center text-[11px] text-slate-400 dark:text-white/30">
            우리 팀에 꼭 맞는 관점을 직접 만들어보세요.
          </p>
        </div>
      </div>
    </section>
  );
}
