import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { HeroSection } from "@/components/landing/hero-section";
import { PersonaSection } from "@/components/landing/persona-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { CtaSection } from "@/components/landing/cta-section";
import { ScrollEffects } from "@/components/landing/scroll-effects";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#f8f9fb] dark:bg-[#0a0a0f] text-slate-900 dark:text-white overflow-hidden font-[family-name:var(--font-sora)]">
      <ScrollEffects />

      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.06) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 opacity-0 dark:opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="parallax-orb pointer-events-none fixed top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-[#0066ff]/10 dark:bg-[#0066ff]/20 blur-[120px] animate-[pulse_8s_ease-in-out_infinite]" />
      <div className="parallax-orb pointer-events-none fixed bottom-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-[#7c3aed]/8 dark:bg-[#7c3aed]/15 blur-[100px] animate-[pulse_6s_ease-in-out_infinite_1s]" />
      <div className="parallax-orb pointer-events-none fixed top-[50%] right-[10%] h-[300px] w-[300px] rounded-full bg-[#00d4ff]/5 dark:bg-[#00d4ff]/10 blur-[80px] animate-[pulse_10s_ease-in-out_infinite_2s]" />

      <nav className="landing-nav relative z-10 flex items-center justify-between px-6 py-5 md:px-12 lg:px-20 transition-all duration-300" style={{ borderBottom: "1px solid transparent" }}>
        <Link href="/" className="flex items-center gap-1.5">
          <img src="/logo.png" alt="AdMeet AI" className="h-7 w-7" />
          <span className="text-lg font-bold tracking-tight">AdMeet</span>
        </Link>
        <Link href="/init">
          <Button
            variant="outline"
            className="rounded-full border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-sm text-slate-700 dark:text-white backdrop-blur-sm hover:border-[#00d4ff]/50 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
          >
            Admit Meet!
          </Button>
        </Link>
      </nav>

      <HeroSection />
      <PersonaSection />
      <HowItWorksSection />
      <CtaSection />

      <Footer />
    </main>
  );
}
