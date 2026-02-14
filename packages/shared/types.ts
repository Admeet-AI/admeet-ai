// ============================================
// AdMeet AI - 공유 타입 정의
// ============================================

// --- Project / Init ---

export interface ProjectContextCard {
  productSummary: string;
  coreValue: string;
  targetPersonas: string[];
  differentiators: string[];
  kpiGoals: Record<string, string>;
  constraints: string[];
}

export interface Project {
  id: string;
  name: string;
  contextCard: ProjectContextCard;
  createdAt: string;
}

// --- Meeting ---

export type MeetingType =
  | "product"
  | "launch"
  | "strategy"
  | "brainstorm"
  | "sprint"
  | "other";

export type MeetingStatus = "preparing" | "active" | "ended";

export interface Meeting {
  id: string;
  projectId: string;
  title: string;
  type: MeetingType;
  status: MeetingStatus;
  createdAt: string;
}

// --- Meeting State ---

export interface Experiment {
  hypothesis: string;
  variable: string;
  successCriteria: string;
  duration: string;
}

export interface Decision {
  content: string;
  timestamp: string;
}

export interface ActionItem {
  content: string;
  assignee: string;
  deadline: string;
}

export interface MeetingState {
  meetingTitle: string;
  meetingType: MeetingType;
  summary: string[];

  // 마케팅 관점 (AI가 채움)
  targetSegment: string[];
  problemStatement: string;
  valueProposition: string;
  keyMessages: string[];
  differentiators: string[];
  channels: string[];
  kpi: Record<string, string>;
  hypotheses: string[];
  experiments: Experiment[];

  // 결정/액션
  decisions: Decision[];
  actions: ActionItem[];
  openQuestions: string[];
}

// --- WebSocket Events ---

export type WSClientEvent =
  | { type: "transcript"; data: { text: string; isFinal: boolean } }
  | { type: "meeting:start"; data: { meetingId: string } }
  | { type: "meeting:end"; data: { meetingId: string } };

export type WSServerEvent =
  | { type: "summary"; data: { text: string } }
  | { type: "ai:intervention"; data: { trigger: TriggerType; message: string } }
  | { type: "state:update"; data: Partial<MeetingState> }
  | { type: "error"; data: { message: string } };

export type TriggerType =
  | "target_vague"
  | "message_abstract"
  | "experiment_missing";

// --- Meeting Event Log ---

export type MeetingEventType =
  | "transcript"
  | "ai_summary"
  | "ai_intervention"
  | "decision"
  | "action_item";

export interface MeetingEvent {
  id: string;
  meetingId: string;
  type: MeetingEventType;
  payload: Record<string, unknown>;
  createdAt: string;
}
