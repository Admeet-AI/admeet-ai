"use client";

import { Button } from "@/components/ui/button";
import { BrainCircuit, RefreshCw } from "lucide-react";

export type EndingPhase = "ending" | "generating" | "redirecting" | "error";

interface EndMeetingOverlayProps {
  phase: EndingPhase;
  onRetry: () => void;
}

const PHASE_CONFIG: Record<
  EndingPhase,
  { message: string; sub: string; showSpinner: boolean }
> = {
  ending: {
    message: "회의를 마무리하고 있습니다...",
    sub: "데이터를 정리하는 중입니다",
    showSpinner: true,
  },
  generating: {
    message: "AI가 리포트를 생성하고 있습니다...",
    sub: "회의 내용을 분석하고 인사이트를 정리하고 있습니다",
    showSpinner: true,
  },
  redirecting: {
    message: "리포트 페이지로 이동합니다",
    sub: "잠시만 기다려주세요",
    showSpinner: true,
  },
  error: {
    message: "리포트 생성에 실패했습니다",
    sub: "네트워크 상태를 확인하고 다시 시도해주세요",
    showSpinner: false,
  },
};

export function EndMeetingOverlay({ phase, onRetry }: EndMeetingOverlayProps) {
  const config = PHASE_CONFIG[phase];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0f]/80 backdrop-blur-md">
      {/* Background effects */}
      <div className="pointer-events-none absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-[#0066ff]/20 blur-[120px] animate-[pulse_8s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-[#7c3aed]/15 blur-[100px] animate-[pulse_6s_ease-in-out_infinite_1s]" />

      <div className="relative z-10 flex flex-col items-center gap-6 text-center px-6">
        {/* Logo */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0066ff] to-[#00d4ff] shadow-[0_0_40px_rgba(0,212,255,0.3)]">
          <BrainCircuit className="h-8 w-8 text-white" />
        </div>

        {/* Spinner */}
        {config.showSpinner && (
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-2 border-white/10" />
            <div className="absolute inset-0 rounded-full border-2 border-[#00d4ff] border-t-transparent animate-spin" />
          </div>
        )}

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">{config.message}</h2>
          <p className="text-sm text-white/40">{config.sub}</p>
        </div>

        {/* Progress dots */}
        {phase !== "error" && (
          <div className="flex items-center gap-3">
            {(["ending", "generating", "redirecting"] as const).map((step, i) => {
              const stepOrder = ["ending", "generating", "redirecting"];
              const currentIdx = stepOrder.indexOf(phase);
              const isCompleted = i < currentIdx;
              const isCurrent = i === currentIdx;

              return (
                <div key={step} className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full transition-all duration-500 ${
                      isCompleted
                        ? "bg-[#00d4ff]"
                        : isCurrent
                          ? "bg-[#00d4ff] animate-pulse scale-125"
                          : "bg-white/20"
                    }`}
                  />
                  {i < 2 && (
                    <div
                      className={`h-px w-8 transition-all duration-500 ${
                        isCompleted ? "bg-[#00d4ff]/50" : "bg-white/10"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Retry button */}
        {phase === "error" && (
          <Button
            onClick={onRetry}
            className="mt-2 rounded-full bg-gradient-to-r from-[#0066ff] to-[#00d4ff] px-6 text-sm font-semibold text-white shadow-[0_0_20px_rgba(0,102,255,0.3)] hover:shadow-[0_0_30px_rgba(0,102,255,0.5)] gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            다시 시도
          </Button>
        )}
      </div>
    </div>
  );
}
