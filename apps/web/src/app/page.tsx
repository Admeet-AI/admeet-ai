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
} from "lucide-react";

/* ── Preset persona showcase data ── */
const PERSONA_SHOWCASE = [
  {
    name: "마케터",
    role: "퍼포먼스 마케팅 전문가",
    expertise: ["타겟 세분화", "메시지 전략", "A/B 테스트"],
    icon: Target,
    color: "#00d4ff",
    thought: "타겟이 '2030 직장인'이면 범위가 넓습니다. 소비 패턴 기준으로 좁혀볼까요?",
    category: "타겟 분석",
  },
  {
    name: "데이터 분석가",
    role: "데이터 기반 의사결정 전문가",
    expertise: ["지표 설계", "코호트 분석", "퍼널 최적화"],
    icon: BarChart3,
    color: "#7c3aed",
    thought: "현재 논의된 KPI에 선행지표가 없습니다. North Star Metric을 먼저 정의하면 어떨까요?",
    category: "지표 설계",
  },
  {
    name: "UX 리서처",
    role: "사용자 경험 분석 전문가",
    expertise: ["유저 인터뷰", "사용성 테스트", "여정 맵"],
    icon: Users,
    color: "#f59e0b",
    thought: "온보딩 플로우에서 이탈 지점을 먼저 파악해야 합니다. 사용성 테스트를 설계해볼까요?",
    category: "리서치 제안",
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#f8f9fb] dark:bg-[#0a0a0f] text-slate-900 dark:text-white overflow-hidden font-[family-name:var(--font-sora)]">
      {/* Background grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.06) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Dark grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-0 dark:opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Gradient orbs */}
      <div className="pointer-events-none fixed top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-[#0066ff]/10 dark:bg-[#0066ff]/20 blur-[120px] animate-[pulse_8s_ease-in-out_infinite]" />
      <div className="pointer-events-none fixed bottom-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-[#7c3aed]/8 dark:bg-[#7c3aed]/15 blur-[100px] animate-[pulse_6s_ease-in-out_infinite_1s]" />
      <div className="pointer-events-none fixed top-[50%] right-[10%] h-[300px] w-[300px] rounded-full bg-[#00d4ff]/5 dark:bg-[#00d4ff]/10 blur-[80px] animate-[pulse_10s_ease-in-out_infinite_2s]" />

      {/* ── Navigation ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12 lg:px-20">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#0066ff] to-[#00d4ff]">
            <BrainCircuit className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Admeet<span className="text-[#00d4ff]">.</span>
          </span>
        </div>
        <Link href="/init">
          <Button
            variant="outline"
            className="rounded-full border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-sm text-slate-700 dark:text-white backdrop-blur-sm hover:border-[#00d4ff]/50 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
          >
            시작하기
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </Link>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-12 pb-16 md:px-12 md:pt-28 md:pb-36">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-20">
          {/* Left: text */}
          <div className="flex-1 space-y-8 animate-[fadeInUp_0.8s_ease-out_both]">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#00d4ff]/20 bg-[#00d4ff]/5 px-4 py-1.5 text-xs font-medium text-[#00d4ff] backdrop-blur-sm">
              <Sparkles className="h-3 w-3" />
              Admit experts to every meeting.
            </div>

            <h1 className="font-extrabold leading-[1.1] tracking-tight font-[family-name:var(--font-noto-kr)]" style={{ fontSize: "clamp(2.25rem, 1.5rem + 4vw, 4.5rem)" }}>
              <span className="bg-gradient-to-r from-[#0066ff] via-[#00d4ff] to-[#7c3aed] bg-clip-text text-transparent">
                AI 전문가
              </span>
              를
              <br />
              회의에 입장시키세요.
            </h1>

            <p className="max-w-lg text-base leading-relaxed text-slate-500 dark:text-white/50 md:text-lg font-[family-name:var(--font-noto-kr)]">
              마케터, 데이터 분석가, UX 리서처 — 필요한 전문가를 선택하면
              <br className="hidden md:block" />
              AI가 회의에 배석하여 실시간으로 인사이트를 제공합니다.
              <br />
              <span className="text-slate-700 dark:text-white/70">직접 페르소나를 만들 수도 있습니다.</span>
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link href="/init">
                <Button className="group h-12 rounded-full bg-gradient-to-r from-[#0066ff] to-[#00d4ff] px-8 text-sm font-semibold text-white shadow-[0_0_30px_rgba(0,102,255,0.3)] transition-all hover:shadow-[0_0_50px_rgba(0,102,255,0.5)] hover:scale-[1.02]">
                  회의 시작하기
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
              <span className="text-xs text-slate-400 dark:text-white/30 font-[family-name:var(--font-noto-kr)]">
                Admit · Meet · Insight
              </span>
            </div>
          </div>

          {/* Right: Live meeting mockup with multiple personas */}
          <div className="relative flex-1 animate-[fadeInUp_0.8s_ease-out_0.3s_both]">
            <div className="relative mx-auto max-w-lg">
              {/* Main meeting panel */}
              <div className="rounded-2xl border border-slate-200/60 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.02] p-5 backdrop-blur-sm">
                {/* Meeting header */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mic className="h-3.5 w-3.5 text-red-400 animate-pulse" />
                    <span className="text-xs text-slate-400 dark:text-white/40 font-[family-name:var(--font-noto-kr)]">신규 서비스 런칭 회의</span>
                  </div>
                  <div className="flex -space-x-1.5">
                    {PERSONA_SHOWCASE.map((p) => (
                      <div
                        key={p.name}
                        className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#f8f9fb] dark:border-[#0a0a0f]"
                        style={{ backgroundColor: `${p.color}30` }}
                      >
                        <p.icon className="h-3 w-3" style={{ color: p.color }} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transcript snippet */}
                <div className="mb-4 space-y-2">
                  <div className="flex gap-2.5">
                    <span className="shrink-0 text-[10px] font-semibold text-slate-400 dark:text-white/30 mt-0.5">PM</span>
                    <p className="text-[12px] leading-relaxed text-slate-500 dark:text-white/50 font-[family-name:var(--font-noto-kr)]">
                      이번 신규 서비스는 2030 직장인 대상으로 빠르게 런칭하려고 합니다.
                    </p>
                  </div>
                </div>

                {/* Persona thought bubbles */}
                <div className="space-y-2.5">
                  {PERSONA_SHOWCASE.map((persona, i) => (
                    <div
                      key={persona.name}
                      className="rounded-xl border p-3.5 transition-all"
                      style={{
                        borderColor: `${persona.color}15`,
                        background: `linear-gradient(135deg, ${persona.color}08, transparent)`,
                        animationDelay: `${1 + i * 0.5}s`,
                        animation: "fadeInUp 0.6s ease-out both",
                      }}
                    >
                      <div className="mb-1.5 flex items-center gap-2">
                        <div
                          className="flex h-5 w-5 items-center justify-center rounded-md"
                          style={{ backgroundColor: `${persona.color}20` }}
                        >
                          <persona.icon className="h-3 w-3" style={{ color: persona.color }} />
                        </div>
                        <span className="text-[11px] font-semibold" style={{ color: persona.color }}>
                          {persona.name}
                        </span>
                        <span
                          className="rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                          style={{
                            backgroundColor: `${persona.color}10`,
                            color: persona.color,
                          }}
                        >
                          {persona.category}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-600 dark:text-white/60 font-[family-name:var(--font-noto-kr)]">
                        {persona.thought}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-3 -right-3 hidden h-20 w-20 rounded-full border border-[#7c3aed]/10 sm:block animate-[spin_20s_linear_infinite]" />
              <div className="absolute -bottom-4 -left-4 hidden h-28 w-28 rounded-full border border-[#00d4ff]/10 sm:block animate-[spin_30s_linear_infinite_reverse]" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Persona Showcase Section ── */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-14 md:py-24 md:px-12">
        <div className="mb-16 max-w-lg animate-[fadeInUp_0.8s_ease-out_both]">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#00d4ff]/70">
            AI Personas
          </p>
          <h2 className="font-bold tracking-tight font-[family-name:var(--font-noto-kr)]" style={{ fontSize: "clamp(1.5rem, 1rem + 2.5vw, 2.25rem)" }}>
            누구를 <span className="text-[#00d4ff]">입장</span>시킬 건가요?
          </h2>
          <p className="mt-4 text-sm text-slate-500 dark:text-white/40 font-[family-name:var(--font-noto-kr)]">
            프리셋 전문가를 바로 입장시키거나, 팀에 맞는 커스텀 페르소나를 만들어 보세요.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PERSONA_SHOWCASE.map((persona, i) => (
            <div
              key={persona.name}
              className="group relative rounded-2xl border border-slate-200/60 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.02] p-6 transition-all duration-500 hover:border-slate-300 dark:hover:border-white/[0.12] hover:bg-white/80 dark:hover:bg-white/[0.04]"
              style={{
                animationDelay: `${i * 150}ms`,
                animation: "fadeInUp 0.8s ease-out both",
              }}
            >
              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: `${persona.color}12` }}
              >
                <persona.icon className="h-6 w-6" style={{ color: persona.color }} />
              </div>
              <h3 className="mb-1 text-base font-bold font-[family-name:var(--font-noto-kr)]">
                {persona.name}
              </h3>
              <p className="mb-3 text-xs text-slate-500 dark:text-white/40 font-[family-name:var(--font-noto-kr)]">
                {persona.role}
              </p>
              <div className="flex flex-wrap gap-1.5">
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

              {/* Hover glow line */}
              <div
                className="pointer-events-none absolute -bottom-px left-1/2 h-px w-0 -translate-x-1/2 transition-all duration-500 group-hover:w-3/4"
                style={{
                  background: `linear-gradient(90deg, transparent, ${persona.color}40, transparent)`,
                }}
              />
            </div>
          ))}

          {/* Custom persona CTA card */}
          <div
            className="group relative flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200/60 dark:border-white/[0.08] bg-white/30 dark:bg-white/[0.01] p-6 transition-all duration-500 hover:border-[#00d4ff]/20 hover:bg-white/60 dark:hover:bg-white/[0.03]"
            style={{ animation: "fadeInUp 0.8s ease-out 0.45s both" }}
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.04] transition-transform duration-300 group-hover:scale-110">
              <Plus className="h-6 w-6 text-slate-400 dark:text-white/30 group-hover:text-[#00d4ff]" />
            </div>
            <h3 className="mb-1 text-sm font-semibold text-slate-500 dark:text-white/50 group-hover:text-slate-700 dark:group-hover:text-white/70 font-[family-name:var(--font-noto-kr)]">
              커스텀 페르소나
            </h3>
            <p className="text-center text-[11px] text-slate-400 dark:text-white/30 font-[family-name:var(--font-noto-kr)]">
              팀에 맞는 전문가를
              <br />
              직접 만들어보세요
            </p>
          </div>
        </div>
      </section>

      {/* ── How It Works Section ── */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-14 md:py-24 md:px-12">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#00d4ff]/70">
            How it works
          </p>
          <h2 className="font-bold tracking-tight font-[family-name:var(--font-noto-kr)]" style={{ fontSize: "clamp(1.5rem, 1rem + 2.5vw, 2.25rem)" }}>
            Admit. Meet. Insight.
          </h2>
        </div>

        <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 lg:gap-0">
          {/* Connecting line */}
          <div className="pointer-events-none absolute top-12 left-[12.5%] right-[12.5%] hidden h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent lg:block" />

          {[
            {
              step: "01",
              title: "컨텍스트 설정",
              desc: "제품/서비스 정보를 입력하면 AI가 맥락을 학습합니다.",
              icon: Settings2,
              color: "#00d4ff",
            },
            {
              step: "02",
              title: "전문가 입장",
              desc: "마케터, 분석가, 리서처 — 회의에 입장시킬 AI를 선택합니다.",
              icon: Users,
              color: "#7c3aed",
            },
            {
              step: "03",
              title: "실시간 회의",
              desc: "음성 인식으로 대화를 분석하고, AI가 실시간으로 사고합니다.",
              icon: Mic,
              color: "#f59e0b",
            },
            {
              step: "04",
              title: "인사이트 리포트",
              desc: "각 전문가의 분석과 액션플랜을 통합 리포트로 생성합니다.",
              icon: FileBarChart,
              color: "#10b981",
            },
          ].map((item, i) => (
            <div
              key={item.step}
              className="relative flex flex-col items-center text-center lg:px-6"
              style={{
                animationDelay: `${i * 150}ms`,
                animation: "fadeInUp 0.8s ease-out both",
              }}
            >
              <div className="relative mb-6 flex h-24 w-24 items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-slate-200/60 dark:border-white/[0.06]" />
                <div
                  className="absolute inset-2 rounded-full border bg-white/60 dark:bg-white/[0.02]"
                  style={{ borderColor: `${item.color}15` }}
                />
                <item.icon className="h-7 w-7" style={{ color: `${item.color}90` }} />
              </div>
              <span
                className="mb-2 text-[11px] font-bold tracking-[0.15em]"
                style={{ color: `${item.color}70` }}
              >
                STEP {item.step}
              </span>
              <h3 className="mb-2 text-base font-semibold font-[family-name:var(--font-noto-kr)]">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-white/40 font-[family-name:var(--font-noto-kr)]">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Signal System Section ── */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-14 md:py-24 md:px-12">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#00d4ff]/70">
            Signal & Solution
          </p>
          <h2 className="font-bold tracking-tight font-[family-name:var(--font-noto-kr)]" style={{ fontSize: "clamp(1.5rem, 1rem + 2.5vw, 2.25rem)" }}>
            호출하면 <span className="text-[#00d4ff]">즉시 답변</span>합니다
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-slate-500 dark:text-white/40 font-[family-name:var(--font-noto-kr)]">
            AI가 실시간으로 사고하다가, 팀원이 이름을 부르면 구체적인 솔루션을 제공합니다.
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          {/* Simulated conversation flow */}
          <div className="space-y-4">
            {/* Human speaks */}
            <div
              className="flex gap-3 animate-[fadeInUp_0.6s_ease-out_both]"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-white/[0.06]">
                <MessageCircle className="h-4 w-4 text-slate-400 dark:text-white/40" />
              </div>
              <div className="rounded-2xl rounded-tl-sm border border-slate-200/60 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.03] px-4 py-3">
                <span className="mb-1 block text-[10px] font-medium text-slate-400 dark:text-white/30">PM</span>
                <p className="text-sm text-slate-600 dark:text-white/60 font-[family-name:var(--font-noto-kr)]">
                  &ldquo;마케터, 이 제품의 초기 타겟을 어떻게 잡아야 할까요?&rdquo;
                </p>
              </div>
            </div>

            {/* AI persona detects signal and responds */}
            <div
              className="flex gap-3 justify-end animate-[fadeInUp_0.6s_ease-out_0.4s_both]"
            >
              <div className="max-w-[calc(100%-3rem)] sm:max-w-md rounded-2xl rounded-tr-sm border p-3 sm:p-4" style={{ borderColor: "#00d4ff20", background: "linear-gradient(135deg, #00d4ff08, #0066ff04)" }}>
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#00d4ff]/20">
                    <Target className="h-3 w-3 text-[#00d4ff]" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#00d4ff]">마케터</span>
                  <span className="rounded-full bg-[#00d4ff]/10 px-2 py-0.5 text-[9px] font-medium text-[#00d4ff]">
                    솔루션
                  </span>
                </div>
                <p className="text-[13px] leading-relaxed text-slate-600 dark:text-white/70 font-[family-name:var(--font-noto-kr)]">
                  프로젝트 컨텍스트 기준으로, <strong className="text-slate-800 dark:text-white/90">25~30세 1인 가구 직장인</strong>이 가장 유망합니다.
                  월 평균 외식비 40만원 이상, 건강식 관심도가 높은 세그먼트를 우선 공략하고
                  Instagram/블로그 리뷰 마케팅으로 시작하는 것을 추천합니다.
                </p>
              </div>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00d4ff]/10">
                <Target className="h-4 w-4 text-[#00d4ff]" />
              </div>
            </div>

            {/* Thinking indicator */}
            <div
              className="flex gap-3 justify-end animate-[fadeInUp_0.6s_ease-out_0.8s_both]"
            >
              <div className="max-w-[calc(100%-3rem)] sm:max-w-sm rounded-2xl rounded-tr-sm border px-3 py-2.5 sm:px-4 sm:py-3" style={{ borderColor: "#7c3aed15", background: "linear-gradient(135deg, #7c3aed06, transparent)" }}>
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#7c3aed]/15">
                    <BarChart3 className="h-3 w-3 text-[#7c3aed]" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#7c3aed]">데이터 분석가</span>
                  <span className="rounded-full bg-[#7c3aed]/10 px-2 py-0.5 text-[9px] font-medium text-[#7c3aed]/70">
                    💭 사고 중
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] text-slate-500 dark:text-white/40 font-[family-name:var(--font-noto-kr)]">
                  타겟 세그먼트에 대한 데이터 검증 포인트를 고민하고 있습니다...
                </p>
              </div>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#7c3aed]/10">
                <BarChart3 className="h-4 w-4 text-[#7c3aed]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-14 md:py-24 md:px-12">
        <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-slate-200/60 dark:border-white/[0.06] bg-gradient-to-br from-[#0066ff]/10 via-white dark:via-[#0a0a0f] to-[#7c3aed]/10 p-8 text-center sm:p-12 md:p-20">
          {/* Top glow line */}
          <div className="pointer-events-none absolute top-0 left-1/2 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#00d4ff]/30 to-transparent" />

          <div className="mb-6 flex justify-center gap-3">
            {PERSONA_SHOWCASE.map((p) => (
              <div
                key={p.name}
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${p.color}12` }}
              >
                <p.icon className="h-5 w-5" style={{ color: p.color }} />
              </div>
            ))}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.04]">
              <Plus className="h-5 w-5 text-slate-400 dark:text-white/30" />
            </div>
          </div>

          <h2 className="mb-4 font-bold tracking-tight font-[family-name:var(--font-noto-kr)]" style={{ fontSize: "clamp(1.5rem, 1rem + 2.5vw, 2.25rem)" }}>
            다음 회의에 누구를 입장시킬 건가요?
          </h2>
          <p className="mx-auto mb-8 max-w-md text-sm text-slate-500 dark:text-white/40 font-[family-name:var(--font-noto-kr)]">
            전문가가 없는 팀도, 전문가급 인사이트를 놓치지 않는 회의.
            <br />
            Admit experts to every meeting.
          </p>
          <Link href="/init">
            <Button className="group h-14 rounded-full bg-slate-900 dark:bg-white px-10 text-sm font-semibold text-white dark:text-[#0a0a0f] shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-all hover:shadow-[0_0_60px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] hover:scale-[1.02]">
              무료로 시작하기
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-slate-200/60 dark:border-white/[0.04] px-6 py-8 md:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-xs text-slate-400 dark:text-white/20">
          <span className="font-[family-name:var(--font-noto-kr)]">
            © 2025 Admeet
          </span>
          <span>Admit. Meet. Insight.</span>
        </div>
      </footer>

      {/* Global keyframes */}
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
