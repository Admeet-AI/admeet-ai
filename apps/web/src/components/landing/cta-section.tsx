"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Cpu } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PERSONA_SHOWCASE } from "@/components/landing/persona-section";

gsap.registerPlugin(ScrollTrigger);

export function CtaSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const lightLineRef = useRef<HTMLDivElement>(null);
  const iconsRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const card = cardRef.current;
    const lightLine = lightLineRef.current;
    const icons = iconsRef.current;
    const title = titleRef.current;
    const button = buttonRef.current;
    if (!section || !card || !lightLine || !icons || !title || !button) return;

    const iconEls = icons.querySelectorAll<HTMLElement>(".cta-icon");
    const words = title.querySelectorAll<HTMLElement>(".cta-word");

    const ctx = gsap.context(() => {
      gsap.fromTo(
        card,
        { scale: 0.85, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 75%",
            once: true,
          },
        }
      );

      gsap.fromTo(
        lightLine,
        { x: "-100%" },
        {
          x: "200%",
          duration: 1.2,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            once: true,
          },
        }
      );

      gsap.fromTo(
        iconEls,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.4,
          stagger: 0.1,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            once: true,
          },
          delay: 0.3,
        }
      );

      gsap.fromTo(
        words,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            once: true,
          },
          delay: 0.5,
        }
      );

      gsap.fromTo(
        button,
        { opacity: 0, y: 20, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "back.out(1.4)",
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            once: true,
          },
          delay: 0.8,
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const titleText = "이번 회의, 참석해도 될까요?";
  const titleWords = titleText.split(" ");

  return (
    <section
      ref={sectionRef}
      className="relative z-10 mx-auto max-w-7xl px-6 py-14 md:py-24 md:px-12"
    >
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-slate-200/60 dark:border-white/[0.06] bg-linear-to-br from-[#0066ff]/10 via-white dark:via-[#0a0a0f] to-[#7c3aed]/10 p-8 text-center sm:p-12 md:p-20"
      >
        <div
          ref={lightLineRef}
          className="pointer-events-none absolute top-0 left-0 h-px w-1/3 bg-linear-to-r from-transparent via-[#00d4ff]/50 to-transparent"
        />

        <div ref={iconsRef} className="mb-6 flex justify-center gap-3">
          {PERSONA_SHOWCASE.map((p) => (
            <div
              key={p.name}
              className="cta-icon flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${p.color}12` }}
            >
              <p.icon className="h-5 w-5" style={{ color: p.color }} />
            </div>
          ))}
          <div className="cta-icon flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.04]">
            <Cpu className="h-5 w-5 text-slate-400 dark:text-white/30" />
          </div>
        </div>

        <h2
          ref={titleRef}
          className="mb-4 font-bold tracking-tight"
          style={{ fontSize: "clamp(1.5rem, 1rem + 2.5vw, 2.25rem)" }}
        >
          {titleWords.map((word, i) => (
            <span key={i} className="cta-word inline-block mr-[0.3em]">
              {word}
            </span>
          ))}
        </h2>

        <p className="mx-auto mb-8 max-w-md text-sm text-slate-500 dark:text-white/40">
          AI 전문가들이 옆에서 함께 들으며, 놓쳤던 것들을 대신 잡아드립니다.
        </p>

        <div ref={buttonRef}>
          <Link href="/init">
            <Button variant="brand-inverse" size="2xl">
              Admit Meet!
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
