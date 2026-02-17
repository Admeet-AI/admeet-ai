// ============================================
// AdMeet AI - 공유 타입 정의
// ============================================

// --- Persona ---

export interface ThoughtCategoryDef {
  key: string;
  label: string;
  icon: string;
}

export interface StateFieldDef {
  key: string;
  label: string;
  type: "string" | "string[]" | "record";
}

export interface Persona {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  systemPrompt: string;
  thoughtCategories: ThoughtCategoryDef[];
  signalKeywords: string[];
  stateFields: StateFieldDef[];
  isPreset: boolean;
  createdBy?: string;
  createdAt?: string;
}

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

  // 동적 필드 (페르소나별로 정의되는 상태)
  dynamicFields: Record<string, unknown>;

  // 결정/액션 (공통)
  decisions: Decision[];
  actions: ActionItem[];
  openQuestions: string[];
}

// --- Persona AI ---

export interface PersonaThought {
  id: string;
  personaId: string;
  personaName: string;
  content: string;
  category: string;
  timestamp: number;
}

export interface PersonaSolution {
  id: string;
  personaId: string;
  personaName: string;
  question: string;
  solution: string;
  context: string;
  timestamp: number;
}

// --- Multi-user Participant ---

export interface ParticipantInfo {
  id: string;
  displayName: string;
  isAI: boolean;
  avatarUrl?: string;
  isSpeaking: boolean;
  personaId?: string;
  role?: string;
}

export interface SharedTranscript {
  speakerId: string;
  speakerName: string;
  text: string;
  isFinal: boolean;
  timestamp: number;
  isAI?: boolean;
}

export interface ChatMessage {
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

// --- WebSocket Events ---

export type WSClientEvent =
  | { type: "room:join"; data: { meetingId: string; displayName: string; avatarUrl?: string } }
  | { type: "room:leave"; data: Record<string, never> }
  | { type: "transcript"; data: { text: string; isFinal: boolean } }
  | { type: "chat:message"; data: { text: string } }
  | { type: "meeting:start"; data: { meetingId: string; personaIds: string[] } }
  | { type: "meeting:end"; data: { meetingId: string } }
  | { type: "meeting:config"; data: { analysisInterval: number } };

export type WSServerEvent =
  | { type: "room:participants"; data: { participants: ParticipantInfo[] } }
  | { type: "room:joined"; data: { participant: ParticipantInfo } }
  | { type: "room:left"; data: { participantId: string; displayName: string } }
  | { type: "transcript:shared"; data: SharedTranscript }
  | { type: "transcript:corrected"; data: { speakerId: string; timestamp: number; originalText: string; correctedText: string } }
  | { type: "chat:received"; data: ChatMessage }
  | { type: "summary"; data: { text: string } }
  | { type: "persona:thought"; data: PersonaThought }
  | { type: "persona:solution"; data: PersonaSolution }
  | { type: "persona:analyzing"; data: { personaId?: string } }
  | { type: "state:update"; data: Partial<MeetingState> }
  | { type: "error"; data: { message: string } };

// --- Meeting Event Log ---

export type MeetingEventType =
  | "transcript"
  | "ai_summary"
  | "ai_thought"
  | "ai_solution"
  | "decision"
  | "action_item";

export interface MeetingEvent {
  id: string;
  meetingId: string;
  type: MeetingEventType;
  payload: Record<string, unknown>;
  createdAt: string;
}
