import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Mic,
  BrainCircuit,
  FileBarChart,
  ArrowRight,
  Target,
  BarChart3,
  Sparkles,
  Users,
  Plus,
  Settings2,
  MessageCircle,
  Cpu,
} from "lucide-react";
import { LiveBubbleStream } from "@/components/landing/live-bubble-stream";

const PERSONA_SHOWCASE = [
  {
    name: "마케터",
    role: "브랜드 확장 전략",
    expertise: ["퍼널 분석", "실험 설계", "A/B 테스트"],
    icon: Target,
    color: "#00d4ff",
    thought: "2030 고객 인터뷰의 반복된 불안 포인트를 먼저 묶고, 다음 액션 순서를 제안하겠습니다.",
    category: "관찰",
  },
  {
    name: "PM",
    role: "프로덕트 의사결정",
    expertise: ["목표 정합성", "리스크 분석", "지표 추적"],
    icon: BarChart3,
    color: "#7c3aed",
    thought: "지표의 변동을 KPI와 연결해 우선순위를 재정렬하면, 의사결정 속도가 빨라집니다.",
    category: "우선순위",
  },
  {
    name: "디자이너",
    role: "사용자 경험 최적화",
    expertise: ["온보딩", "전환 동선", "메시지 톤"],
    icon: Users,
    color: "#f59e0b",
    thought: "참여 지점에서의 마찰을 줄이기 위해 문구 길이와 버튼 강조를 바로 제안해 보겠습니다.",
    category: "경험",
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#f8f9fb] dark:bg-[#0a0a0f] text-slate-900 dark:text-white overflow-hidden font-[family-name:var(--font-sora)]">
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

      <div className="pointer-events-none fixed top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-[#0066ff]/10 dark:bg-[#0066ff]/20 blur-[120px] animate-[pulse_8s_ease-in-out_infinite]" />
      <div className="pointer-events-none fixed bottom-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-[#7c3aed]/8 dark:bg-[#7c3aed]/15 blur-[100px] animate-[pulse_6s_ease-in-out_infinite_1s]" />
      <div className="pointer-events-none fixed top-[50%] right-[10%] h-[300px] w-[300px] rounded-full bg-[#00d4ff]/5 dark:bg-[#00d4ff]/10 blur-[80px] animate-[pulse_10s_ease-in-out_infinite_2s]" />

      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12 lg:px-20">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#0066ff] to-[#00d4ff]">
            <BrainCircuit className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">Admeet<span className="text-[#00d4ff]">.</span></span>
        </div>
        <Link href="/init">
          <Button
            variant="outline"
            className="rounded-full border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-sm text-slate-700 dark:text-white backdrop-blur-sm hover:border-[#00d4ff]/50 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
          >
            회의 시작
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </Link>
      </nav>

      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-12 pb-16 md:px-12 md:pt-28 md:pb-36">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-20">
          <div className="flex-1 space-y-8 animate-[fadeInUp_0.8s_ease-out_both]">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#00d4ff]/20 bg-[#00d4ff]/5 px-4 py-1.5 text-xs font-medium text-[#00d4ff] backdrop-blur-sm">
              <Sparkles className="h-3 w-3" />
              Admit experts to every meeting.
            </div>

            <h1 className="font-extrabold leading-[1.1] tracking-tight" style={{ fontSize: "clamp(2.25rem, 1.5rem + 4vw, 4.5rem)" }}>
              <span className="bg-gradient-to-r from-[#0066ff] via-[#00d4ff] to-[#7c3aed] bg-clip-text text-transparent">
                AI가 실시간으로 도와주는
              </span>
              <br />
              회의 인사이트 페이지.
            </h1>

            <p className="max-w-lg text-base leading-relaxed text-slate-500 dark:text-white/50 md:text-lg">
              실제 회의 말풍선이 올라오면 즉시 신호를 감지하고,
              <br className="hidden md:block" />
              AI가 관찰·분석·요약을 동시에 보여줍니다.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link href="/init">
                <Button className="group h-12 rounded-full bg-gradient-to-r from-[#0066ff] to-[#00d4ff] px-8 text-sm font-semibold text-white shadow-[0_0_30px_rgba(0,102,255,0.3)] transition-all hover:shadow-[0_0_50px_rgba(0,102,255,0.5)] hover:scale-[1.02]">
                  지금 바로 시작
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
              <span className="text-xs text-slate-400 dark:text-white/30">Admit · Meet · Insight</span>
            </div>
          </div>

          <div className="relative flex-1 animate-[fadeInUp_0.8s_ease-out_0.3s_both]">
            <LiveBubbleStream />
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-14 md:py-24 md:px-12">
        <div className="mb-16 max-w-lg animate-[fadeInUp_0.8s_ease-out_both]">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#00d4ff]/70">AI Personas</p>
          <h2 className="font-bold tracking-tight" style={{ fontSize: "clamp(1.5rem, 1rem + 2.5vw, 2.25rem)" }}>
            실시간 관찰이 가능한 AI 페르소나
          </h2>
          <p className="mt-4 text-sm text-slate-500 dark:text-white/40">
            팀 상황과 회의 맥락을 반영해 각 역할별 인사이트를 분리해서 보여줍니다.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PERSONA_SHOWCASE.map((persona, i) => (
            <div
              key={persona.name}
              className="group relative rounded-2xl border border-slate-200/60 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.02] p-6 transition-all duration-500 hover:border-slate-300 dark:hover:border-white/[0.12] hover:bg-white/80 dark:hover:bg-white/[0.04]"
              style={{ animationDelay: `${i * 150}ms`, animation: "fadeInUp 0.8s ease-out both" }}
            >
              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: `${persona.color}12` }}
              >
                <persona.icon className="h-6 w-6" style={{ color: persona.color }} />
              </div>
              <h3 className="mb-1 text-base font-bold">{persona.name}</h3>
              <p className="mb-3 text-xs text-slate-500 dark:text-white/40">{persona.role}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {persona.expertise.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-white/50"
                    style={{ backgroundColor: `${persona.color}08`, border: `1px solid ${persona.color}15` }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-sm text-slate-600 dark:text-white/60">{persona.thought}</p>
            </div>
          ))}

          <div className="group relative flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200/60 dark:border-white/[0.08] bg-white/30 dark:bg-white/[0.01] p-6 transition-all duration-500 hover:border-[#00d4ff]/20 hover:bg-white/60 dark:hover:bg-white/[0.03]">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.04]">
              <Plus className="h-6 w-6 text-slate-400 dark:text-white/30" />
            </div>
            <h3 className="mb-1 text-sm font-semibold text-slate-500 dark:text-white/50">자체 정의 페르소나</h3>
            <p className="text-center text-[11px] text-slate-400 dark:text-white/30">팀에 맞는 역할별 페르소나를 추가해보세요.</p>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-14 md:py-24 md:px-12">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#00d4ff]/70">How it works</p>
          <h2 className="font-bold tracking-tight" style={{ fontSize: "clamp(1.5rem, 1rem + 2.5vw, 2.25rem)" }}>
            Admit. Meet. Insight.
          </h2>
        </div>

        <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 lg:gap-0">
          <div className="pointer-events-none absolute top-12 left-[12.5%] right-[12.5%] hidden h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent lg:block" />
          {[
            {
              step: "01",
              title: "미팅 설정",
              desc: "회의 주제와 대상자를 입력하면 실시간 분석 세션을 시작합니다.",
              icon: Settings2,
              color: "#00d4ff",
            },
            {
              step: "02",
              title: "페르소나 투입",
              desc: "마케팅, PM, UX 역할이 동시 관찰을 시작하고 신호를 분류합니다.",
              icon: Users,
              color: "#7c3aed",
            },
            {
              step: "03",
              title: "실시간 관찰",
              desc: "발언이 들어오면 핵심 키워드와 리스크를 즉시 레이블링합니다.",
              icon: Mic,
              color: "#f59e0b",
            },
            {
              step: "04",
              title: "요약·제안",
              desc: "회의 후 액션 아이템, 우선순위, 다음 단계까지 한 번에 출력합니다.",
              icon: FileBarChart,
              color: "#10b981",
            },
          ].map((item, i) => (
            <div key={item.step} className="relative flex flex-col items-center text-center lg:px-6" style={{ animationDelay: `${i * 150}ms`, animation: "fadeInUp 0.8s ease-out both" }}>
              <div className="relative mb-6 flex h-24 w-24 items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-slate-200/60 dark:border-white/[0.06]" />
                <div className="absolute inset-2 rounded-full border bg-white/60 dark:bg-white/[0.02]" style={{ borderColor: `${item.color}15` }} />
                <item.icon className="h-7 w-7" style={{ color: `${item.color}90` }} />
              </div>
              <span className="mb-2 text-[11px] font-bold tracking-[0.15em]" style={{ color: `${item.color}70` }}>
                STEP {item.step}
              </span>
              <h3 className="mb-2 text-base font-semibold">{item.title}</h3>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-white/40">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-14 md:py-24 md:px-12">
        <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-slate-200/60 dark:border-white/[0.06] bg-gradient-to-br from-[#0066ff]/10 via-white dark:via-[#0a0a0f] to-[#7c3aed]/10 p-8 text-center sm:p-12 md:p-20">
          <div className="pointer-events-none absolute top-0 left-1/2 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#00d4ff]/30 to-transparent" />
          <div className="mb-6 flex justify-center gap-3">
            {PERSONA_SHOWCASE.map((p) => (
              <div key={p.name} className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${p.color}12` }}>
                <p.icon className="h-5 w-5" style={{ color: p.color }} />
              </div>
            ))}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.04]">
              <Cpu className="h-5 w-5 text-slate-400 dark:text-white/30" />
            </div>
          </div>

          <h2 className="mb-4 font-bold tracking-tight" style={{ fontSize: "clamp(1.5rem, 1rem + 2.5vw, 2.25rem)" }}>
            지금 바로 실시간 미팅 인사이트를 체험해 보세요
          </h2>
          <p className="mx-auto mb-8 max-w-md text-sm text-slate-500 dark:text-white/40">
            AI가 회의 맥락을 실시간으로 읽어내고, 다음 액션까지 한눈에 정리해 줍니다.
          </p>
          <Link href="/init">
            <Button className="group h-14 rounded-full bg-slate-900 dark:bg-white px-10 text-sm font-semibold text-white dark:text-[#0a0a0f] shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-all hover:shadow-[0_0_60px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] hover:scale-[1.02]">
              회의 시작하기
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-slate-200/60 dark:border-white/[0.04] px-6 py-8 md:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-xs text-slate-400 dark:text-white/20">
          <span>© 2025 Admeet</span>
          <span>Admit. Meet. Insight.</span>
        </div>
      </footer>

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
    </main>
  );
}
