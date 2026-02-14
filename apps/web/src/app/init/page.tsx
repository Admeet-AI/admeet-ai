"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function InitPage() {
  const router = useRouter();
  const [step, setStep] = useState<"input" | "questions" | "done">("input");
  const [projectName, setProjectName] = useState("");
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);

  const [projectId, setProjectId] = useState<string | null>(null);
  const [contextCard, setContextCard] = useState<Record<string, unknown> | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

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
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-2xl px-6">
        <h1 className="text-3xl font-bold mb-2">프로젝트 설정</h1>
        <p className="text-muted-foreground mb-8">
          제품 정보를 입력하면 AI가 마케팅 컨텍스트를 파악합니다.
        </p>

        {step === "input" && (
          <Card>
            <CardHeader>
              <CardTitle>제품/서비스 정보 입력</CardTitle>
              <CardDescription>
                README, 랜딩페이지 문구, 앱 소개문 등을 붙여넣으세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="프로젝트 이름"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
              <Textarea
                placeholder="제품 소개, 기능, 타겟 등 아는 정보를 자유롭게 입력하세요..."
                rows={10}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
              />
              <Button
                onClick={handleSubmit}
                disabled={loading || !projectName.trim() || !rawText.trim()}
                className="w-full"
              >
                {loading ? "분석 중..." : "Context Card 생성"}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "questions" && (
          <div className="space-y-6">
            {contextCard && (
              <Card>
                <CardHeader><CardTitle>Project Context Card</CardTitle></CardHeader>
                <CardContent>
                  <pre className="text-sm bg-slate-100 p-4 rounded-lg overflow-auto whitespace-pre-wrap">
                    {JSON.stringify(contextCard, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader>
                <CardTitle>AI 보충 질문</CardTitle>
                <CardDescription>더 정확한 마케팅 조언을 위한 질문입니다. (건너뛰기 가능)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {questions.map((q, i) => (
                  <div key={i}>
                    <label className="text-sm font-medium block mb-1">{q}</label>
                    <Input
                      value={answers[q] || ""}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, [q]: e.target.value }))}
                      placeholder="답변을 입력하세요 (선택)"
                    />
                  </div>
                ))}
                <div className="flex gap-3">
                  <Button onClick={handleAnswerSubmit} disabled={loading}>
                    {loading ? "업데이트 중..." : "답변 제출"}
                  </Button>
                  <Button variant="outline" onClick={() => setStep("done")}>건너뛰기</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "done" && (
          <div className="space-y-6">
            {contextCard && (
              <Card>
                <CardHeader><CardTitle>최종 Context Card</CardTitle></CardHeader>
                <CardContent>
                  <pre className="text-sm bg-slate-100 p-4 rounded-lg overflow-auto whitespace-pre-wrap">
                    {JSON.stringify(contextCard, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
            <Button onClick={() => router.push(`/meeting/${projectId}`)} size="lg" className="w-full">
              회의 시작하기
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
