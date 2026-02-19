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
  onMobileInviteClick?: () => void;
}

export function SettingsModal({ onIntervalChange, onMobileInviteClick }: SettingsModalProps) {
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
          {"설정"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{"회의 설정"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {onMobileInviteClick && (
            <div className="sm:hidden">
              <DialogClose asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={onMobileInviteClick}
                  className="w-full"
                >
                  {"링크 초대"}
                </Button>
              </DialogClose>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium">{"AI 분석 주기"}</label>
            <p className="mb-3 text-xs text-muted-foreground">
              {"회의 내용을 분석하는 간격을 설정합니다."}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {INTERVAL_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelected(option.value)}
                  className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                    selected === option.value
                      ? "border-blue-500 bg-blue-50 font-medium text-blue-700"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{"AI 음성 출력"}</p>
              <p className="text-xs text-muted-foreground">
                {"회의에서 나온 인사이트를 음성으로 읽어줍니다."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTtsEnabled(!ttsEnabled)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                ttsEnabled ? "bg-blue-500" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  ttsEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline" size="sm">
              {"취소"}
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button size="sm" onClick={handleSave}>
              {"저장"}
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
