"use client";

import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMeetingStore } from "@/stores/meeting";
import { ParticipantGrid } from "@/components/meeting/participant-grid";
import { SharedTranscript } from "@/components/meeting/shared-transcript";
import { PersonaPanel } from "@/components/meeting/persona-panel";
import { SummaryPanel } from "@/components/meeting/summary-panel";
import { MeetingControls } from "@/components/meeting/meeting-controls";
import { SettingsModal } from "@/components/meeting/settings-modal";
import type { Persona } from "../../../../../packages/shared/types";
import { Users, RotateCcw } from "lucide-react";

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

const MOCK_CHAT = [
  {
    senderId: "user-2",
    senderName: "박매니저",
    text: "발표 자료에 이 내용 반영할게요",
    timestamp: Date.now() - 100000,
  },
  {
    senderId: "user-1",
    senderName: "김대표",
    text: "넵 좋습니다 👍",
    timestamp: Date.now() - 90000,
  },
  {
    senderId: "user-2",
    senderName: "박매니저",
    text: "UGC 캠페인 레퍼런스도 찾아볼게요",
    timestamp: Date.now() - 50000,
  },
];

// ─── Demo Page ─────────────────────────────────────────────

export default function DemoPage() {
  const store = useMeetingStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<"transcript" | "summary" | "insights">("transcript");
  const [activePersonaTab, setActivePersonaTab] = useState<string | null>(null);

  // 목 데이터 주입
  const hydrateMockData = useCallback(() => {
    store.reset();

    // 연결 상태
    store.setConnected(true);
    store.setCurrentUser("user-1", "김대표");
    store.setMeetingId("demo-meeting-001");
    store.setMeetingStarted(true);

    // 참여자
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

    // 페르소나
    store.setActivePersonas(MOCK_PERSONAS);

    // 트랜스크립트
    MOCK_TRANSCRIPTS.forEach((t) => store.addSharedTranscript(t));

    // 생각 & 솔루션
    MOCK_THOUGHTS.forEach((t) => store.addThought(t));
    MOCK_SOLUTIONS.forEach((s) => store.addSolution(s));

    // 요약
    MOCK_SUMMARIES.forEach((s) => store.addSummary(s));

    setIsHydrated(true);
  }, [store]);

  useEffect(() => {
    hydrateMockData();
    return () => {
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

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <h1 className="font-bold text-lg">AdMeet</h1>
          <span className="text-muted-foreground">|</span>
          <span className="text-sm font-medium">{meetingTitle}</span>
          <Badge variant={store.isConnected ? "default" : "destructive"} className="text-xs">
            {store.isConnected ? "연결됨" : "연결 끊김"}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span>
            {humanCount}명{aiCount > 0 && ` + AI ${aiCount}`}
          </span>
        </div>
      </header>

      {/* 참여자 그리드 */}
      <div className="bg-muted/30 border-b border-border">
        <ParticipantGrid />
      </div>

      {/* 모바일 탭 전환 */}
      <div className="flex border-b border-border bg-card sm:hidden">
        {(["transcript", "summary", "insights"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-muted-foreground"
            }`}
          >
            {tab === "transcript" ? "트랜스크립트" : tab === "summary" ? "실시간 요약" : "AI 상태"}
          </button>
        ))}
      </div>

      {/* 메인 컨텐츠 — 3컬럼 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 1. 공유 트랜스크립트 */}
        <div
          className={`flex-1 p-3 overflow-hidden border-r border-border ${
            activeTab !== "transcript" ? "hidden sm:flex sm:flex-col" : "flex flex-col"
          }`}
        >
          <SharedTranscript />
        </div>

        {/* 2. 실시간 요약 */}
        <div
          className={`flex-1 p-3 overflow-hidden border-r border-border ${
            activeTab !== "summary" ? "hidden sm:flex sm:flex-col" : "flex flex-col"
          }`}
        >
          <SummaryPanel />
        </div>

        {/* 3. AI 상태 (페르소나 인사이트) */}
        <div
          className={`flex-1 p-3 overflow-hidden flex flex-col ${
            activeTab !== "insights" ? "hidden sm:flex sm:flex-col" : "flex flex-col"
          }`}
        >
          {store.activePersonas.length > 1 && (
            <div className="flex gap-1 mb-2 overflow-x-auto pb-1">
              {store.activePersonas.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActivePersonaTab(p.id)}
                  className={`px-2 py-1 text-xs rounded-md whitespace-nowrap transition-colors ${
                    activePersonaTab === p.id
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-medium"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}
          {store.activePersonas.length > 0 ? (
            <PersonaPanel
              persona={
                store.activePersonas.find((p) => p.id === activePersonaTab) ||
                store.activePersonas[0]
              }
            />
          ) : (
            <PersonaPanel persona={null} />
          )}
        </div>
      </div>

      {/* 하단 컨트롤 바 */}
      <MeetingControls
        isListening={false}
        onToggleMic={() => {}}
        onSendText={(text) => {
          store.addTranscript(text);
        }}
        onEndMeeting={() => {
          alert("데모 모드에서는 회의 종료가 비활성화됩니다.");
        }}
        settingsSlot={
          <SettingsModal onIntervalChange={() => {}} />
        }
      />
    </main>
  );
}
