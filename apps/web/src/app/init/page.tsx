"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PersonaSelector } from "@/components/persona/persona-selector";
import {
  BrainCircuit,
  ArrowRight,
  ArrowLeft,
  Settings2,
  FileText,
  MessageCircle,
  Users,
  Check,
  Loader2,
  Sparkles,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const STEPS = [
  { key: "input", label: "정보 입력", icon: FileText },
  { key: "questions", label: "보충 질문", icon: MessageCircle },
  { key: "done", label: "컨텍스트 확인", icon: Check },
  { key: "personas", label: "페르소나 선택", icon: Users },
] as const;

export default function InitPage() {
  const router = useRouter();
  const [step, setStep] = useState<"input" | "questions" | "done" | "personas">("input");
  const [selectedPersonaIds, setSelectedPersonaIds] = useState<string[]>([]);
  const [projectName, setProjectName] = useState("");
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);

  const [projectId, setProjectId] = useState<string | null>(null);
  const [contextCard, setContextCard] = useState<Record<string, unknown> | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentStepIndex = STEPS.findIndex((s) => s.key === step);

  const handleSubmit = async () => {
    if (!projectName.trim() || !rawText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectName, rawText }),
      });
      const data = await res.json();
      setProjectId(data.project.id);
      setContextCard(data.contextCard);
      setQuestions(data.followUpQuestions || []);
      setStep("questions");
    } catch (error) {
      console.error("Init failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/init/${projectId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      setContextCard(data.contextCard);
      setStep("done");
    } catch (error) {
      console.error("Answer failed:", error);
    } finally {
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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#0066ff] to-[#00d4ff]">
            <BrainCircuit className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Admeet<span className="text-[#00d4ff]">.</span>
          </span>
        </Link>
        <Link href="/">
          <Button
            variant="outline"
            className="rounded-full border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-sm text-slate-700 dark:text-white backdrop-blur-sm hover:border-[#00d4ff]/50 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="mr-1 h-3.5 w-3.5" />
            홈으로
          </Button>
        </Link>
      </nav>

      {/* Step Indicator */}
      <div className="relative z-10 mx-auto max-w-3xl px-6 pt-8 pb-2 md:px-12">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => {
            const isActive = i === currentStepIndex;
            const isDone = i < currentStepIndex;
            const StepIcon = s.icon;
            return (
              <div key={s.key} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300 ${
                      isActive
                        ? "border-[#00d4ff]/40 bg-[#00d4ff]/10 shadow-[0_0_20px_rgba(0,212,255,0.15)]"
                        : isDone
                          ? "border-[#00d4ff]/20 bg-[#00d4ff]/5"
                          : "border-slate-200 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.02]"
                    }`}
                  >
                    {isDone ? (
                      <Check className="h-4 w-4 text-[#00d4ff]" />
                    ) : (
                      <StepIcon
                        className={`h-4 w-4 ${isActive ? "text-[#00d4ff]" : "text-slate-400 dark:text-white/30"}`}
                      />
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-medium tracking-wide font-[family-name:var(--font-noto-kr)] ${
                      isActive ? "text-[#00d4ff]" : isDone ? "text-slate-500 dark:text-white/50" : "text-slate-300 dark:text-white/20"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`mx-2 mt-[-20px] h-px flex-1 transition-colors duration-300 ${
                      isDone ? "bg-[#00d4ff]/30" : "bg-slate-200 dark:bg-white/[0.06]"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 py-10 md:px-12">
        {/* Step: Input */}
        {step === "input" && (
          <div className="animate-[fadeInUp_0.6s_ease-out_both]">
            <div className="mb-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#00d4ff]/20 bg-[#00d4ff]/5 px-4 py-1.5 text-xs font-medium text-[#00d4ff] backdrop-blur-sm">
                <Settings2 className="h-3 w-3" />
                Step 01
              </div>
              <h1
                className="font-extrabold tracking-tight font-[family-name:var(--font-noto-kr)]"
                style={{ fontSize: "clamp(1.75rem, 1.5rem + 2vw, 2.5rem)" }}
              >
                <span className="bg-gradient-to-r from-[#0066ff] via-[#00d4ff] to-[#7c3aed] bg-clip-text text-transparent">
                  프로젝트
                </span>
                를 알려주세요
              </h1>
              <p className="mt-3 text-sm text-slate-500 dark:text-white/40 font-[family-name:var(--font-noto-kr)]">
                제품 정보를 입력하면 AI가 프로젝트 컨텍스트를 파악합니다.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/60 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.02] p-6 backdrop-blur-sm">
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-400 dark:text-white/40">
                    프로젝트 이름
                  </label>
                  <Input
                    placeholder="예: AdMeet AI"
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
                    placeholder="README, 랜딩페이지 문구, 앱 소개문 등을 자유롭게 붙여넣으세요..."
                    rows={8}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    className="rounded-xl border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus:border-[#00d4ff]/40 focus:ring-[#00d4ff]/10 resize-none"
                  />
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !projectName.trim() || !rawText.trim()}
                  className="group h-12 w-full rounded-xl bg-gradient-to-r from-[#0066ff] to-[#00d4ff] text-sm font-semibold text-white shadow-[0_0_30px_rgba(0,102,255,0.2)] transition-all hover:shadow-[0_0_50px_rgba(0,102,255,0.4)] hover:scale-[1.01] disabled:opacity-40 disabled:hover:scale-100"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      AI가 분석 중...
                    </>
                  ) : (
                    <>
                      Context Card 생성
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step: Questions */}
        {step === "questions" && (
          <div className="space-y-6 animate-[fadeInUp_0.6s_ease-out_both]">
            {contextCard && (
              <div className="rounded-2xl border border-slate-200/60 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.02] p-6 backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#00d4ff]/10">
                    <Sparkles className="h-3.5 w-3.5 text-[#00d4ff]" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-white/70">Project Context Card</h3>
                </div>
                <pre className="text-xs leading-relaxed text-slate-500 dark:text-white/50 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] p-4 rounded-xl overflow-auto whitespace-pre-wrap font-mono">
                  {JSON.stringify(contextCard, null, 2)}
                </pre>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200/60 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.02] p-6 backdrop-blur-sm">
              <div className="mb-6">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#7c3aed]/20 bg-[#7c3aed]/5 px-4 py-1.5 text-xs font-medium text-[#7c3aed] backdrop-blur-sm">
                  <MessageCircle className="h-3 w-3" />
                  Step 02
                </div>
                <h2 className="text-lg font-bold font-[family-name:var(--font-noto-kr)]">
                  AI 보충 질문
                </h2>
                <p className="mt-1 text-xs text-slate-400 dark:text-white/30 font-[family-name:var(--font-noto-kr)]">
                  더 정확한 분석을 위한 질문입니다. 건너뛰기도 가능합니다.
                </p>
              </div>

              <div className="space-y-5">
                {questions.map((q, i) => (
                  <div key={i}>
                    <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-white/60 font-[family-name:var(--font-noto-kr)]">
                      {q}
                    </label>
                    <Input
                      value={answers[q] || ""}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, [q]: e.target.value }))}
                      placeholder="답변을 입력하세요 (선택)"
                      className="h-11 rounded-xl border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus:border-[#7c3aed]/40 focus:ring-[#7c3aed]/10"
                    />
                  </div>
                ))}
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleAnswerSubmit}
                    disabled={loading}
                    className="flex-1 h-11 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#0066ff] text-sm font-semibold shadow-[0_0_20px_rgba(124,58,237,0.2)] hover:shadow-[0_0_40px_rgba(124,58,237,0.3)] transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        업데이트 중...
                      </>
                    ) : (
                      "답변 제출"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setStep("done")}
                    className="rounded-xl border-slate-200 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.03] text-slate-500 dark:text-white/50 hover:border-slate-300 dark:hover:border-white/[0.15] hover:bg-white dark:hover:bg-white/[0.06] hover:text-slate-700 dark:hover:text-white/70"
                  >
                    건너뛰기
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step: Done (Context Card confirmed) */}
        {step === "done" && (
          <div className="space-y-6 animate-[fadeInUp_0.6s_ease-out_both]">
            {contextCard && (
              <div className="rounded-2xl border border-slate-200/60 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.02] p-6 backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#10b981]/10">
                    <Check className="h-3.5 w-3.5 text-[#10b981]" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-white/70">최종 Context Card</h3>
                </div>
                <pre className="text-xs leading-relaxed text-slate-500 dark:text-white/50 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] p-4 rounded-xl overflow-auto whitespace-pre-wrap font-mono">
                  {JSON.stringify(contextCard, null, 2)}
                </pre>
              </div>
            )}
            <Button
              onClick={() => setStep("personas")}
              className="group h-14 w-full rounded-xl bg-gradient-to-r from-[#0066ff] to-[#00d4ff] text-sm font-semibold text-white shadow-[0_0_30px_rgba(0,102,255,0.2)] transition-all hover:shadow-[0_0_50px_rgba(0,102,255,0.4)] hover:scale-[1.01]"
            >
              다음: 페르소나 선택
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>
        )}

        {/* Step: Persona Selection */}
        {step === "personas" && (
          <div className="space-y-6 animate-[fadeInUp_0.6s_ease-out_both]">
            <div className="mb-2">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f59e0b]/20 bg-[#f59e0b]/5 px-4 py-1.5 text-xs font-medium text-[#f59e0b] backdrop-blur-sm">
                <Users className="h-3 w-3" />
                Step 04
              </div>
              <h2
                className="font-extrabold tracking-tight font-[family-name:var(--font-noto-kr)]"
                style={{ fontSize: "clamp(1.5rem, 1.2rem + 1.5vw, 2rem)" }}
              >
                누구를{" "}
                <span className="bg-gradient-to-r from-[#f59e0b] to-[#00d4ff] bg-clip-text text-transparent">
                  입장
                </span>
                시킬 건가요?
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-white/40 font-[family-name:var(--font-noto-kr)]">
                회의에 참여할 AI 페르소나를 선택하세요. 여러 명을 동시에 선택할 수 있습니다.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/60 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.02] p-6 backdrop-blur-sm">
              <PersonaSelector
                onSelect={setSelectedPersonaIds}
                selectedIds={selectedPersonaIds}
              />
            </div>

            <Button
              onClick={() => {
                const params = new URLSearchParams();
                if (selectedPersonaIds.length > 0) {
                  params.set("personaIds", selectedPersonaIds.join(","));
                }
                router.push(`/meeting/${projectId}?${params.toString()}`);
              }}
              disabled={selectedPersonaIds.length === 0}
              className="group h-14 w-full rounded-xl bg-gradient-to-r from-[#0066ff] to-[#00d4ff] text-sm font-semibold text-white shadow-[0_0_30px_rgba(0,102,255,0.2)] transition-all hover:shadow-[0_0_50px_rgba(0,102,255,0.4)] hover:scale-[1.01] disabled:opacity-40 disabled:hover:scale-100"
            >
              회의 시작하기 ({selectedPersonaIds.length}명 선택됨)
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>
        )}
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
