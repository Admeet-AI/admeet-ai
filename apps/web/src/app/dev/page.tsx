"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
      // 1. 프로젝트 초기화
      setStatus("프로젝트 Context Card 생성 중...");
      const initRes = await fetch(`${API_URL}/api/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectName, rawText }),
      });
      const initData = await initRes.json();
      const projectId = initData.project.id;

      setStatus("회의 생성 중...");

      // 2. 회의 바로 시작
      router.push(`/meeting/${projectId}?title=${encodeURIComponent(meetingTitle)}`);
    } catch (error) {
      console.error("Quick start failed:", error);
      setStatus("오류 발생! 서버 연결을 확인하세요.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-3xl px-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">데모 모드</h1>
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">DEV</Badge>
        </div>
        <p className="text-muted-foreground mb-8">
          프리셋을 선택하고 바로 회의를 시작할 수 있습니다. 서버에 실제로 연결됩니다.
        </p>

        {/* 프리셋 선택 */}
        <div className="flex gap-3 mb-6">
          {DEMO_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => selectPreset(idx)}
              className={`flex-1 text-left p-4 rounded-lg border-2 transition-all ${
                selectedPreset === idx
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="font-semibold text-sm">{preset.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{preset.meetingTitle}</div>
            </button>
          ))}
        </div>

        {/* 폼 */}
        <Card>
          <CardHeader>
            <CardTitle>빠른 시작</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">프로젝트 이름</label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">제품/서비스 정보</label>
              <Textarea
                rows={8}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">회의 제목</label>
              <Input
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
              />
            </div>

            {status && (
              <p className="text-sm text-blue-600 animate-pulse">{status}</p>
            )}

            <Button
              onClick={handleQuickStart}
              disabled={loading || !projectName.trim() || !rawText.trim() || !meetingTitle.trim()}
              className="w-full"
              size="lg"
            >
              {loading ? "준비 중..." : "Context Card 생성 → 회의 바로 시작"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
