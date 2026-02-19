"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X, Loader2 } from "lucide-react";
import type { Persona } from "../../../../../packages/shared/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface ThoughtCategoryInput {
  key: string;
  label: string;
  icon: string;
}

interface PersonaCreatorProps {
  editPersona?: Persona;
  onSaved: (persona: Persona) => void;
  onClose: () => void;
}

export function PersonaCreator({ editPersona, onSaved, onClose }: PersonaCreatorProps) {
  const isEditMode = !!editPersona;
  const isReadOnly = !!editPersona?.isPreset;

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [expertiseText, setExpertiseText] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [signalKeywordsText, setSignalKeywordsText] = useState("");
  const [categories, setCategories] = useState<ThoughtCategoryInput[]>([
    { key: "", label: "", icon: "" },
    { key: "", label: "", icon: "" },
  ]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editPersona) {
      setName(editPersona.name);
      setRole(editPersona.role);
      setExpertiseText(editPersona.expertise.join(", "));
      setSystemPrompt(editPersona.systemPrompt);
      setSignalKeywordsText(editPersona.signalKeywords.join(", "));
      setCategories(
        editPersona.thoughtCategories.length > 0
          ? editPersona.thoughtCategories.map((c) => ({
              key: c.key,
              label: c.label,
              icon: c.icon,
            }))
          : [{ key: "", label: "", icon: "" }]
      );
    }
  }, [editPersona]);

  const addCategory = () => {
    setCategories((prev) => [...prev, { key: "", label: "", icon: "" }]);
  };

  const updateCategory = (
    index: number,
    field: keyof ThoughtCategoryInput,
    value: string
  ) => {
    setCategories((prev) =>
      prev.map((cat, i) => (i === index ? { ...cat, [field]: value } : cat))
    );
  };

  const removeCategory = (index: number) => {
    if (categories.length <= 1) return;
    setCategories((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name.trim() || !role.trim()) return;

    setSubmitting(true);
    try {
      const expertise = expertiseText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const signalKeywords = signalKeywordsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const thoughtCategories = categories
        .filter((c) => c.key.trim() && c.label.trim())
        .map((c) => ({
          key: c.key.trim(),
          label: c.label.trim(),
          icon: c.icon.trim() || "📌",
        }));

      const url = isEditMode
        ? `${API_URL}/api/personas/${editPersona.id}`
        : `${API_URL}/api/personas`;

      const res = await fetch(url, {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          role,
          expertise,
          systemPrompt,
          thoughtCategories,
          signalKeywords,
        }),
      });

      const persona = await res.json();
      onSaved(persona);
    } catch (error) {
      console.error("Failed to create persona:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClassName = `h-11 rounded-xl border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus:border-[#00d4ff]/40 focus:ring-[#00d4ff]/10${isReadOnly ? " opacity-60 cursor-not-allowed" : ""}`;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#12121a] text-slate-900 dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white font-[family-name:var(--font-noto-kr)]">
            {isReadOnly ? "페르소나 상세" : isEditMode ? "페르소나 수정" : "커스텀 페르소나 생성"}
          </DialogTitle>
          <p className="text-sm text-slate-500 dark:text-white/40 font-[family-name:var(--font-noto-kr)]">
            {isReadOnly
              ? "기본 페르소나는 수정할 수 없습니다."
              : isEditMode
                ? "페르소나의 역할과 전문 분야를 수정하세요."
                : "회의에 참여할 AI 페르소나의 역할과 전문 분야를 정의하세요."}
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-400 dark:text-white/40">
              이름
            </label>
            <Input
              placeholder="예: UX 리서처"
              value={name}
              onChange={(e) => setName(e.target.value)}
              readOnly={isReadOnly}
              className={inputClassName}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-400 dark:text-white/40">
              역할
            </label>
            <Input
              placeholder="예: 사용자 경험 분석 전문가"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              readOnly={isReadOnly}
              className={inputClassName}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-400 dark:text-white/40">
              전문 분야 (쉼표로 구분)
            </label>
            <Input
              placeholder="예: 사용성 테스트, 유저 인터뷰, A/B 테스트"
              value={expertiseText}
              onChange={(e) => setExpertiseText(e.target.value)}
              readOnly={isReadOnly}
              className={inputClassName}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-400 dark:text-white/40">
              시스템 프롬프트
            </label>
            <Textarea
              placeholder="페르소나의 행동 방식과 분석 관점을 정의하세요..."
              rows={4}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              readOnly={isReadOnly}
              className={`rounded-xl border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus:border-[#00d4ff]/40 focus:ring-[#00d4ff]/10 resize-none${isReadOnly ? " opacity-60 cursor-not-allowed" : ""}`}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-400 dark:text-white/40">
              사고 카테고리
            </label>
            <div className="space-y-2">
              {categories.map((cat, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    placeholder="key"
                    className={`w-24 ${inputClassName}`}
                    value={cat.key}
                    onChange={(e) => updateCategory(i, "key", e.target.value)}
                    readOnly={isReadOnly}
                  />
                  <Input
                    placeholder="라벨"
                    className={`flex-1 ${inputClassName}`}
                    value={cat.label}
                    onChange={(e) => updateCategory(i, "label", e.target.value)}
                    readOnly={isReadOnly}
                  />
                  <Input
                    placeholder="이모지"
                    className={`w-20 ${inputClassName}`}
                    value={cat.icon}
                    onChange={(e) => updateCategory(i, "icon", e.target.value)}
                    readOnly={isReadOnly}
                  />
                  {!isReadOnly && (
                    <button
                      onClick={() => removeCategory(i)}
                      disabled={categories.length <= 1}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 dark:text-white/30 transition-colors hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-600 dark:hover:text-white/60 disabled:opacity-30"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {!isReadOnly && (
              <button
                className="mt-2 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-slate-400 dark:text-white/40 transition-colors hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-600 dark:hover:text-white/60"
                onClick={addCategory}
              >
                <Plus className="h-3 w-3" />
                카테고리 추가
              </button>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-400 dark:text-white/40">
              시그널 키워드 (쉼표로 구분)
            </label>
            <Input
              placeholder="예: 사용자, UX, 테스트"
              value={signalKeywordsText}
              onChange={(e) => setSignalKeywordsText(e.target.value)}
              readOnly={isReadOnly}
              className={inputClassName}
            />
          </div>

          <div className="flex gap-3 pt-2">
            {!isReadOnly && (
              <Button
                onClick={handleSubmit}
                disabled={submitting || !name.trim() || !role.trim()}
                className="flex-1 h-11 rounded-xl bg-linear-to-r from-[#0066ff] to-[#00d4ff] text-sm font-semibold shadow-[0_0_20px_rgba(0,102,255,0.2)] hover:shadow-[0_0_40px_rgba(0,102,255,0.3)] transition-all disabled:opacity-40"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? "수정 중..." : "생성 중..."}
                  </>
                ) : (
                  isEditMode ? "페르소나 수정" : "페르소나 생성"
                )}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={onClose}
              className={`h-11 rounded-xl border-slate-200 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.03] text-slate-500 dark:text-white/50 hover:border-slate-300 dark:hover:border-white/[0.15] hover:bg-white dark:hover:bg-white/[0.06] hover:text-slate-700 dark:hover:text-white/70${isReadOnly ? " flex-1" : ""}`}
            >
              {isReadOnly ? "닫기" : "취소"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
