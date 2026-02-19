"use client";

import { useEffect, useRef } from "react";
import { Settings2, Users, AudioLines, Mic, FileBarChart } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    step: "01",
    title: "회의 맥락 입력",
    desc: "회의 주제와 참석자를 입력하면 실시간 분석 세션을 준비합니다.",
    icon: Settings2,
    color: "#00d4ff",
  },
  {
    step: "02",
    title: "AI 전문가 배석",
    desc: "마케팅, PM, UX 전문가가 저마다의 시선으로 대화를 듣습니다.",
    icon: Users,
    color: "#7c3aed",
  },
  {
    step: "03",
    title: "마이크만 켜주세요",
    desc: "실시간 음성 전사를 AI가 자동 보정하여 정확한 회의록을 만들어냅니다.",
    icon: AudioLines,
    color: "#ec4899",
  },
  {
    step: "04",
    title: "실시간 인사이트",
    desc: "발언을 요청하면 핵심 키워드와 리스크를 바로 짚어냅니다.",
    icon: Mic,
    color: "#f59e0b",
  },
  {
    step: "05",
    title: "다음 액션 정리",
    desc: "회의 후 자동 회의록, 액션 아이템, 우선순위, 다음 단계까지 전부 AI가 정리해 드립니다.",
    icon: FileBarChart,
    color: "#10b981",
  },
];

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stepsContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const container = stepsContainerRef.current;
    if (!section || !container) return;

    const stepEls = container.querySelectorAll<HTMLElement>(".step-item");
    const iconEls = container.querySelectorAll<HTMLElement>(".step-icon-ring");
    const stepNumbers = container.querySelectorAll<HTMLElement>(".step-number");
    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      stepEls.forEach((el) => {
        gsap.set(el, { opacity: 0.12, scale: 0.88, y: 20 });
      });

      const svgPath = svgRef.current?.querySelector("line");

      const stepCount = STEPS.length;
      const stepInterval = 1 / stepCount;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 15%",
          end: "+=120%",
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
        },
      });

      stepEls.forEach((el, i) => {
        const iconRing = iconEls[i];
        const stepNum = stepNumbers[i];
        const start = i * stepInterval;

        tl.to(
          el,
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.18,
            ease: "power3.out",
          },
          start
        );

        if (iconRing) {
          tl.fromTo(
            iconRing,
            {
              boxShadow: "0 0 0 0 transparent",
              background: "transparent",
            },
            {
              boxShadow: `0 0 0 12px ${STEPS[i].color}25, 0 0 30px ${STEPS[i].color}15`,
              background: `${STEPS[i].color}08`,
              duration: 0.18,
              ease: "power2.out",
            },
            start
          );
        }

        if (stepNum) {
          tl.fromTo(
            stepNum,
            { scale: 0.8, opacity: 0.5 },
            {
              scale: 1,
              opacity: 1,
              duration: 0.15,
              ease: "back.out(1.4)",
            },
            start + 0.05
          );
        }

        if (i > 0) {
          tl.to(
            stepEls[i - 1],
            {
              opacity: 0.3,
              scale: 0.92,
              y: -8,
              duration: 0.15,
              ease: "power2.in",
            },
            start
          );
          if (iconEls[i - 1]) {
            tl.to(
              iconEls[i - 1],
              {
                boxShadow: "0 0 0 0 transparent",
                background: "transparent",
                duration: 0.15,
              },
              start
            );
          }
          if (stepNumbers[i - 1]) {
            tl.to(
              stepNumbers[i - 1],
              { scale: 0.8, opacity: 0.3, duration: 0.15 },
              start
            );
          }
        }
      });

      if (svgPath) {
        const length = Math.sqrt(
          Math.pow(svgPath.x2.baseVal.value - svgPath.x1.baseVal.value, 2) +
          Math.pow(svgPath.y2.baseVal.value - svgPath.y1.baseVal.value, 2)
        );
        gsap.set(svgPath, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });
        tl.to(
          svgPath,
          { strokeDashoffset: 0, duration: 1, ease: "none" },
          0
        );
      }
    });

    mm.add("(max-width: 767px)", () => {
      stepEls.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              once: true,
            },
          }
        );
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative z-10 mx-auto max-w-7xl px-6 py-14 md:py-24 md:px-12"
    >
      <div className="mb-16 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#00d4ff]/70">
          How it works
        </p>
        <h2
          className="font-bold tracking-tight"
          style={{ fontSize: "clamp(1.5rem, 1rem + 2.5vw, 2.25rem)" }}
        >
          Admit. Meet. Insight.
        </h2>
      </div>

      <div
        ref={stepsContainerRef}
        className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-5 sm:gap-6 lg:gap-0"
      >
        <svg
          ref={svgRef}
          className="pointer-events-none absolute top-12 left-[10%] right-[10%] hidden h-[2px] w-[80%] lg:block"
          preserveAspectRatio="none"
        >
          <line
            x1="0"
            y1="1"
            x2="100%"
            y2="1"
            stroke="url(#lineGrad)"
            strokeWidth="2"
          />
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.4" />
              <stop offset="25%" stopColor="#7c3aed" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#ec4899" stopOpacity="0.4" />
              <stop offset="75%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
            </linearGradient>
          </defs>
        </svg>

        {STEPS.map((item) => (
          <div
            key={item.step}
            className="step-item relative flex flex-col items-center text-center lg:px-3 xl:px-5"
          >
            <div className="relative mb-6 flex h-24 w-24 lg:h-28 lg:w-28 items-center justify-center">
              <div
                className="absolute inset-0 rounded-full border-2 transition-colors duration-500"
                style={{ borderColor: `${item.color}20` }}
              />
              <div
                className="step-icon-ring absolute inset-2 rounded-full border-2 transition-all duration-500"
                style={{ borderColor: `${item.color}30` }}
              />
              <item.icon
                className="h-8 w-8 transition-all duration-500"
                style={{ color: item.color }}
              />
            </div>
            <span
              className="step-number mb-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold"
              style={{
                backgroundColor: `${item.color}15`,
                color: item.color,
              }}
            >
              {item.step}
            </span>
            <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
            <p className="max-w-[200px] text-sm leading-relaxed text-slate-500 dark:text-white/50">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
