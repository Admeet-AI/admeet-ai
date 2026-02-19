"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Settings2,
  Loader2,
  Sparkles,
  Zap,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const DEMO_PRESETS = [
  {
    label: "친환경 펫푸드",
    projectName: "에코펫 - 친환경 펫푸드",
    rawText: `에코펫은 친환경 원료로 만든 프리미엄 반려견 사료 브랜드입니다.
주요 특징:
- 100% 유기농 원료 사용, 국내 생산
- 1인 가구 반려인을 위한 소포장 라인업
- 친환경 포장재 사용 (생분해성 패키지)
- 월 정기구독 서비스 운영 중
- 가격대: 월 3만원~5만원

현재 상황:
- 인스타그램 팔로워 2,300명
- 월 매출 약 800만원
- 재구매율 45%
- 주요 고객: 20~30대 여성, 서울/경기 거주

고민:
- 마케팅 채널을 확대하고 싶은데 어디서부터 시작해야 할지 모르겠음
- 타겟을 더 구체화해야 할 것 같음
- 광고 카피가 너무 일반적인 것 같음`,
    meetingTitle: "마케팅 채널 확대 계획",
  },
  {
    label: "SaaS 프로젝트 관리",
    projectName: "TaskFlow - 팀 프로젝트 관리 SaaS",
    rawText: `TaskFlow는 스타트업을 위한 올인원 프로젝트 관리 도구입니다.
주요 기능:
- 칸반 보드, 타임라인, 스프린트 관리
- Slack/Notion 연동
- AI 기반 업무 우선순위 추천
- 실시간 협업 기능

현재 상황:
- MAU 1,200명 (무료 사용자 포함)
- 유료 전환율 8%
- 주요 고객: 5~20인 규모 스타트업
- 경쟁사: Jira, Linear, Asana

고민:
- 무료 → 유료 전환율을 높이고 싶음
- "빠르고 직관적"이라는 메시지가 와닿는지 모르겠음
- 콘텐츠 마케팅을 시작하려는데 방향을 못 잡겠음`,
    meetingTitle: "Q1 마케팅 전략 회의",
  },
  {
    label: "오프라인 카페",
    projectName: "브루잇 - 스페셜티 커피 로스터리",
    rawText: `브루잇은 서울 성수동에 위치한 스페셜티 커피 로스터리 카페입니다.
주요 특징:
- 자체 로스팅, 싱글 오리진 원두 전문
- 원두 구독 서비스 (월 2만5천원~)
- 카페 + 원두 판매 (온/오프라인)
- 바리스타 클래스 월 2회 운영

현재 상황:
- 카페 일 매출 약 80만원
- 온라인 원두 판매 월 400만원
- 네이버 스마트스토어 + 자사몰 운영
- 인스타그램 팔로워 5,100명

고민:
- 온라인 원두 판매를 더 키우고 싶음
- 단골 외에 신규 유입이 적음
- 브랜드 스토리를 어떻게 전달해야 할지 고민`,
    meetingTitle: "온라인 채널 성장 전략",
  },
];

export default function DevPage() {
  const router = useRouter();
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [projectName, setProjectName] = useState(DEMO_PRESETS[0].projectName);
  const [rawText, setRawText] = useState(DEMO_PRESETS[0].rawText);
  const [meetingTitle, setMeetingTitle] = useState(DEMO_PRESETS[0].meetingTitle);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");

  const selectPreset = (idx: number) => {
    setSelectedPreset(idx);
    setProjectName(DEMO_PRESETS[idx].projectName);
    setRawText(DEMO_PRESETS[idx].rawText);
    setMeetingTitle(DEMO_PRESETS[idx].meetingTitle);
  };

  const handleQuickStart = async () => {
    if (!projectName.trim() || !rawText.trim() || !meetingTitle.trim()) return;
    setLoading(true);

    try {
      setStatus("프로젝트 Context Card 생성 중...");
      const initRes = await fetch(`${API_URL}/api/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectName, rawText }),
      });
      const initData = await initRes.json();
      const projectId = initData.project.id;

      setStatus("회의 생성 중...");
      router.push(`/meeting/${projectId}?title=${encodeURIComponent(meetingTitle)}`);
    } catch (error) {
      console.error("Quick start failed:", error);
      setStatus("오류 발생! 서버 연결을 확인하세요.");
      setLoading(false);
    }
  };

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

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12 lg:px-20">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-[#0066ff] to-[#00d4ff]">
            <img src="/logo.png" alt="AdMeet AI" className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Admeet<span className="text-[#00d4ff]">.</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Badge className="rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-semibold px-2.5 py-0.5">
            DEV
          </Badge>
        </div>
      </nav>

      {/* Content */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 py-10 md:px-12">
        <div className="animate-[fadeInUp_0.6s_ease-out_both]">
          <div className="mb-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 backdrop-blur-sm">
              <Zap className="h-3 w-3" />
              Quick Start
            </div>
            <h1
              className="font-extrabold tracking-tight font-[family-name:var(--font-noto-kr)]"
              style={{ fontSize: "clamp(1.75rem, 1.5rem + 2vw, 2.5rem)" }}
            >
              <span className="bg-linear-to-r from-[#0066ff] via-[#00d4ff] to-[#7c3aed] bg-clip-text text-transparent">
                데모 모드
              </span>
              로 빠르게 시작
            </h1>
            <p className="mt-3 text-sm text-slate-500 dark:text-white/40 font-[family-name:var(--font-noto-kr)]">
              프리셋을 선택하고 바로 회의를 시작할 수 있습니다. 서버에 실제로 연결됩니다.
            </p>
          </div>

          {/* 프리셋 선택 */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {DEMO_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => selectPreset(idx)}
                className={`group relative text-left p-4 rounded-xl border transition-all duration-300 backdrop-blur-sm ${
                  selectedPreset === idx
                    ? "border-[#00d4ff]/40 bg-[#00d4ff]/5 shadow-[0_0_20px_rgba(0,212,255,0.1)]"
                    : "border-slate-200/60 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.02] hover:border-slate-300 dark:hover:border-white/[0.12] hover:bg-white/80 dark:hover:bg-white/[0.04]"
                }`}
              >
                <div className={`text-sm font-semibold font-[family-name:var(--font-noto-kr)] ${
                  selectedPreset === idx ? "text-[#00d4ff]" : "text-slate-700 dark:text-white/70"
                }`}>
                  {preset.label}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-white/30 mt-1 font-[family-name:var(--font-noto-kr)]">
                  {preset.meetingTitle}
                </div>
                {selectedPreset === idx && (
                  <div className="pointer-events-none absolute -bottom-px left-1/2 h-px w-3/4 -translate-x-1/2 bg-linear-to-r from-transparent via-[#00d4ff]/40 to-transparent" />
                )}
              </button>
            ))}
          </div>

          {/* 폼 */}
          <div className="rounded-2xl border border-slate-200/60 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.02] p-6 backdrop-blur-sm">
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-400 dark:text-white/40">
                  프로젝트 이름
                </label>
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="h-12 rounded-xl border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus:border-[#00d4ff]/40 focus:ring-[#00d4ff]/10"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-400 dark:text-white/40">
                  제품/서비스 정보
                </label>
                <Textarea
                  rows={8}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="rounded-xl border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus:border-[#00d4ff]/40 focus:ring-[#00d4ff]/10 resize-none text-sm"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-400 dark:text-white/40">
                  회의 제목
                </label>
                <Input
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className="h-12 rounded-xl border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus:border-[#00d4ff]/40 focus:ring-[#00d4ff]/10"
                />
              </div>

              {status && (
                <div className="flex items-center gap-2 rounded-lg border border-[#00d4ff]/20 bg-[#00d4ff]/5 px-4 py-2.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#00d4ff] animate-pulse" />
                  <p className="text-sm text-[#00d4ff] font-medium font-[family-name:var(--font-noto-kr)]">{status}</p>
                </div>
              )}

              <Button
                onClick={handleQuickStart}
                disabled={loading || !projectName.trim() || !rawText.trim() || !meetingTitle.trim()}
                className="group h-14 w-full rounded-xl bg-linear-to-r from-[#0066ff] to-[#00d4ff] text-sm font-semibold text-white shadow-[0_0_30px_rgba(0,102,255,0.2)] transition-all hover:shadow-[0_0_50px_rgba(0,102,255,0.4)] hover:scale-[1.01] disabled:opacity-40 disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    준비 중...
                  </>
                ) : (
                  <>
                    Context Card 생성 → 회의 바로 시작
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>

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
