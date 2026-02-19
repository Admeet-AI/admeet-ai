"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LiveBubbleStream } from "@/components/landing/live-bubble-stream";

export function HeroSection() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 py-20">
      <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-20">
        <div className="flex-1 space-y-8 animate-[fadeInUp_0.8s_ease-out_both]">
          <h1
            className="font-extrabold leading-[1.1] tracking-tight text-center"
            style={{ fontSize: "clamp(1.75rem, 1.2rem + 3vw, 3rem)" }}
          >
            <span className="bg-linear-to-r from-[#0066ff] via-[#00d4ff] to-[#7c3aed] bg-clip-text text-transparent">
              회의 중 놓치는 것,
            </span>
            <br />
            AI가 잡아줍니다.
          </h1>

          <p className="text-sm leading-relaxed text-slate-500 dark:text-white/50 md:text-base text-center w-full">
            발언이 오가는 그 순간, AI 전문가들이
            <br />
            함께 듣고 정리합니다.
          </p>  

          <div className="flex flex-col gap-3 justify-center items-center">
            <Link href="/init">
              <Button variant="brand" size="xl">
                Admit Meet!
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative flex-1 animate-[fadeInUp_0.8s_ease-out_0.3s_both]">
          <LiveBubbleStream />
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
