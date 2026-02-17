"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMeetingStore } from "@/stores/meeting";
import { SharedTranscript } from "@/components/meeting/shared-transcript";
import { InsightsSidebar } from "@/components/meeting/insights-sidebar";
import { MeetingControls } from "@/components/meeting/meeting-controls";
import { SummaryDrawer } from "@/components/meeting/summary-drawer";
import { ParticipantGrid } from "@/components/meeting/participant-grid";
import { SettingsModal } from "@/components/meeting/settings-modal";
import type { Persona } from "../../../../../packages/shared/types";
import { RotateCcw, X } from "lucide-react";

// ─── Mock Data ─────────────────────────────────────────────

const MOCK_PERSONAS: Persona[] = [
  {
    id: "persona-marketer",
    name: "시니어 마케터",
    role: "마케팅 전략가",
    expertise: ["퍼포먼스 마케팅", "브랜딩", "그로스 해킹"],
    systemPrompt: "",
    thoughtCategories: [
      { key: "observation", label: "관찰", icon: "👀" },
      { key: "concern", label: "우려", icon: "⚠️" },
      { key: "opportunity", label: "기회", icon: "✨" },
      { key: "insight", label: "인사이트", icon: "💡" },
    ],
    signalKeywords: ["마케팅", "광고", "채널"],
    stateFields: [],
    isPreset: true,
  },
  {
    id: "persona-pm",
    name: "PM",
    role: "프로덕트 매니저",
    expertise: ["로드맵", "사용자 리서치", "우선순위"],
    systemPrompt: "",
    thoughtCategories: [
      { key: "user_need", label: "사용자 니즈", icon: "🎯" },
      { key: "risk", label: "리스크", icon: "🚨" },
      { key: "priority", label: "우선순위", icon: "📋" },
      { key: "metric", label: "지표", icon: "📊" },
    ],
    signalKeywords: ["제품", "기능", "사용자"],
    stateFields: [],
    isPreset: true,
  },
];

const MOCK_TRANSCRIPTS = [
  {
    speakerId: "user-1",
    speakerName: "김대표",
    text: "오늘 회의는 에코펫의 마케팅 채널 확대 전략에 대해 논의하겠습니다.",
    isFinal: true,
    timestamp: Date.now() - 300000,
  },
  {
    speakerId: "user-2",
    speakerName: "박매니저",
    text: "현재 인스타그램 위주로 운영하고 있는데, 다른 채널로 확대해야 할 것 같습니다.",
    isFinal: true,
    timestamp: Date.now() - 270000,
  },
  {
    speakerId: "user-1",
    speakerName: "김대표",
    text: "유튜브 쇼츠나 틱톡도 고려하고 있어요. 반려동물 콘텐츠가 잘 되는 것 같더라고요.",
    isFinal: true,
    timestamp: Date.now() - 240000,
  },
  {
    speakerId: "ai-persona-marketer",
    speakerName: "시니어 마케터",
    text: "숏폼 콘텐츠 전략이 좋습니다. 다만 채널별 타겟 세그먼트가 다르니 메시지를 차별화하는 것이 중요합니다. 인스타는 감성적 브랜딩, 유튜브 쇼츠는 정보성 콘텐츠, 틱톡은 바이럴 요소를 강화하세요.",
    isFinal: true,
    timestamp: Date.now() - 210000,
    isAI: true,
  },
  {
    speakerId: "user-2",
    speakerName: "박매니저",
    text: "광고 예산이 월 200만원 정도인데, 어디에 집중하는 게 좋을까요?",
    isFinal: true,
    timestamp: Date.now() - 180000,
  },
  {
    speakerId: "user-1",
    speakerName: "김대표",
    text: "재구매율이 45%니까 기존 고객 유지도 중요한데, 신규 유입이 너무 적어서 고민이에요.",
    isFinal: true,
    timestamp: Date.now() - 150000,
  },
  {
    speakerId: "ai-persona-pm",
    speakerName: "PM",
    text: "재구매율 45%는 꽤 높은 편입니다. 리텐션은 CRM 자동화로 효율화하고, 예산은 신규 유입에 70% 이상 배분하는 것을 권장합니다.",
    isFinal: true,
    timestamp: Date.now() - 120000,
    isAI: true,
  },
];

const MOCK_THOUGHTS = [
  {
    id: "t1",
    personaId: "persona-marketer",
    personaName: "시니어 마케터",
    content: "인스타그램 팔로워 2,300명은 아직 초기 단계. 콘텐츠 빈도와 해시태그 전략 개선 필요.",
    category: "observation",
    timestamp: Date.now() - 250000,
  },
  {
    id: "t2",
    personaId: "persona-marketer",
    personaName: "시니어 마케터",
    content: "월 200만원 예산으로 3개 채널 동시 운영은 리소스 분산 위험.",
    category: "concern",
    timestamp: Date.now() - 200000,
  },
  {
    id: "t3",
    personaId: "persona-marketer",
    personaName: "시니어 마케터",
    content: "반려동물 UGC(사용자 생성 콘텐츠)는 바이럴 잠재력이 높음. 리뷰 캠페인 활용 가능.",
    category: "opportunity",
    timestamp: Date.now() - 160000,
  },
  {
    id: "t4",
    personaId: "persona-pm",
    personaName: "PM",
    content: "월 매출 800만원 대비 재구매율 45%면 LTV가 높은 편. 기존 고객 기반 레퍼럴 프로그램 검토 필요.",
    category: "user_need",
    timestamp: Date.now() - 230000,
  },
  {
    id: "t5",
    personaId: "persona-pm",
    personaName: "PM",
    content: "동시 채널 확대 시 콘텐츠 제작 리소스가 병목이 될 수 있음.",
    category: "risk",
    timestamp: Date.now() - 170000,
  },
];

const MOCK_SOLUTIONS = [
  {
    id: "s1",
    personaId: "persona-marketer",
    personaName: "시니어 마케터",
    question: "마케팅 채널을 어디서부터 확대해야 할까?",
    solution:
      "1단계: 인스타그램 릴스 강화 (기존 채널 최적화) → 2단계: 유튜브 쇼츠 진출 (크로스 포스팅) → 3단계: 틱톡 실험. 예산 배분은 인스타 60%, 유튜브 30%, 틱톡 10%로 시작.",
    context: "현재 인스타그램 팔로워 2,300명, 월 예산 200만원 기준",
    timestamp: Date.now() - 140000,
  },
];

const MOCK_SUMMARIES = [
  "에코펫 마케팅 채널 확대 논의 시작. 현재 인스타그램 중심 운영에서 유튜브 쇼츠, 틱톡으로 확대 검토 중.",
  "월 광고 예산 200만원 배분 방안과 신규 유입 vs 기존 고객 유지 전략에 대한 논의 진행.",
];

// ─── Demo Page ─────────────────────────────────────────────

export default function DemoPage() {
  const store = useMeetingStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const hydrateMockData = useCallback(() => {
    clearTimers();
    store.reset();

    store.setConnected(true);
    store.setCurrentUser("user-1", "김대표");
    store.setMeetingId("demo-meeting-001");
    store.setMeetingStarted(true);

    store.setParticipants([
      { id: "user-1", displayName: "김대표", isAI: false, isSpeaking: false },
      { id: "user-2", displayName: "박매니저", isAI: false, isSpeaking: false },
      {
        id: "ai-persona-marketer",
        displayName: "시니어 마케터",
        isAI: true,
        isSpeaking: false,
        personaId: "persona-marketer",
        role: "마케팅 전략가",
      },
      {
        id: "ai-persona-pm",
        displayName: "PM",
        isAI: true,
        isSpeaking: false,
        personaId: "persona-pm",
        role: "프로덕트 매니저",
      },
    ]);

    store.setActivePersonas(MOCK_PERSONAS);

    // 트랜스크립트는 즉시 로드
    MOCK_TRANSCRIPTS.forEach((t) => store.addSharedTranscript(t));
    MOCK_SUMMARIES.forEach((s) => store.addSummary(s));

    // AI 생각 & 솔루션은 순차적으로 생성 시뮬레이션
    const allItems = [
      ...MOCK_THOUGHTS.map((t) => ({ type: "thought" as const, data: t })),
      ...MOCK_SOLUTIONS.map((s) => ({ type: "solution" as const, data: s })),
    ].sort((a, b) => a.data.timestamp - b.data.timestamp);

    allItems.forEach((item, i) => {
      const timer = setTimeout(() => {
        if (item.type === "thought") {
          store.addThought({ ...item.data, timestamp: Date.now() });
        } else {
          store.addSolution({ ...item.data, timestamp: Date.now() });
        }
      }, 800 + i * 1200);
      timersRef.current.push(timer);
    });

    setIsHydrated(true);
  }, [store, clearTimers]);

  useEffect(() => {
    hydrateMockData();
    return () => {
      clearTimers();
      store.reset();
    };
  }, []);

  if (!isHydrated) {
    return (
      <main className="h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">데모 데이터 로딩 중...</p>
      </main>
    );
  }

  const meetingTitle = "마케팅 채널 확대 계획";
  const humanCount = store.participants.filter((p) => !p.isAI).length;
  const aiCount = store.participants.filter((p) => p.isAI).length;

  return (
    <main className="h-screen flex flex-col bg-background">
      {/* 데모 배너 */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 text-xs">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 text-[10px]">
            DEMO
          </Badge>
          <span className="text-amber-700 dark:text-amber-400">
            서버 연결 없이 목 데이터로 렌더링됩니다. UI 수정 후 새로고침하면 반영됩니다.
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 gap-1 text-amber-700 dark:text-amber-400 hover:text-amber-900"
          onClick={hydrateMockData}
        >
          <RotateCcw className="h-3 w-3" />
          리셋
        </Button>
      </div>

      {/* Header — /meeting/[id]와 동일 */}
      <header className="flex items-center justify-between px-3 sm:px-4 py-2 bg-card border-b border-border gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="font-bold text-base sm:text-lg shrink-0">AdMeet</h1>
          <span className="text-muted-foreground hidden sm:inline">|</span>
          <span className="text-sm font-medium hidden sm:inline truncate">{meetingTitle}</span>
          <Badge variant={store.isConnected ? "default" : "destructive"} className="text-[10px] sm:text-xs shrink-0">
            {store.isConnected ? "연결됨" : "끊김"}
          </Badge>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* 참여자 아바타 — 모바일 숨김 */}
          <div className="hidden sm:flex items-center gap-1.5">
            <ParticipantGrid />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {humanCount}명{aiCount > 0 && ` + AI ${aiCount}`}
            </span>
          </div>

          {/* 요약 */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDrawerOpen(true)}
          >
            요약
          </Button>

          {/* 설정 */}
          <SettingsModal
            onIntervalChange={() => {}}
          />

          {/* 종료 (데모에서는 홈으로 이동) */}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              store.reset();
              window.location.href = "/";
            }}
          >
            종료
          </Button>
        </div>
      </header>

      {/* 메인 영역: 왼쪽 AI 인사이트 고정 + 오른쪽 채팅 — /meeting/[id]와 동일 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 왼쪽: AI 인사이트 패널 (고정) */}
        <aside className="hidden sm:flex w-72 lg:w-80 border-r border-border bg-card flex-col shrink-0">
          <InsightsSidebar />
        </aside>

        {/* 오른쪽: 채팅 영역 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden bg-slate-50 dark:bg-slate-950">
            <SharedTranscript />
          </div>

          {/* 하단 메신저 입력바 */}
          <MeetingControls
            isListening={false}
            onToggleMic={() => {}}
            onSendText={(text) => {
              store.addTranscript(text);
            }}
          />
        </div>
      </div>

      {/* 오른쪽 Drawer: 실시간 요약 — /meeting/[id]와 동일 */}
      <SummaryDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />

      {/* 모바일: AI 인사이트 슬라이드 패널 */}
      {insightsOpen && (
        <div className="fixed inset-0 z-40 sm:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setInsightsOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-[85%] max-w-80 bg-card border-r border-border flex flex-col animate-[slideInLeft_0.25s_ease-out_both]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#2563eb]">AI</span>
                <span className="text-sm font-semibold">인사이트</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setInsightsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <InsightsSidebar />
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
