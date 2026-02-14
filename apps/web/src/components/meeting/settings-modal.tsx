"use client";

import { useState } from "react";
import { useMeetingStore } from "@/stores/meeting";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

const INTERVAL_OPTIONS = [
  { label: "15초", value: 15 },
  { label: "30초", value: 30 },
  { label: "45초", value: 45 },
  { label: "60초", value: 60 },
  { label: "90초", value: 90 },
  { label: "120초", value: 120 },
];

interface SettingsModalProps {
  onIntervalChange: (seconds: number) => void;
}

export function SettingsModal({ onIntervalChange }: SettingsModalProps) {
  const analysisInterval = useMeetingStore((s) => s.analysisInterval);
  const setAnalysisInterval = useMeetingStore((s) => s.setAnalysisInterval);
  const ttsEnabled = useMeetingStore((s) => s.ttsEnabled);
  const setTtsEnabled = useMeetingStore((s) => s.setTtsEnabled);
  const [selected, setSelected] = useState(analysisInterval);

  const handleSave = () => {
    setAnalysisInterval(selected);
    onIntervalChange(selected);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          설정
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>회의 설정</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* 분석 주기 */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              AI 분석 주기
            </label>
            <p className="text-xs text-muted-foreground mb-3">
              마케터가 회의 내용을 분석하는 간격을 설정합니다.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {INTERVAL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelected(opt.value)}
                  className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                    selected === opt.value
                      ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* TTS 토글 */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">AI 음성 출력</p>
              <p className="text-xs text-muted-foreground">
                마케터의 인사이트를 음성으로 읽어줍니다.
              </p>
            </div>
            <button
              onClick={() => setTtsEnabled(!ttsEnabled)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                ttsEnabled ? "bg-blue-500" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow-sm ${
                  ttsEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <DialogClose asChild>
            <Button variant="outline" size="sm">취소</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button size="sm" onClick={handleSave}>저장</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
