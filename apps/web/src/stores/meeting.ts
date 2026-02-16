import { create } from "zustand";
import type {
  MeetingState,
  PersonaThought,
  PersonaSolution,
  Persona,
  ParticipantInfo,
  SharedTranscript,
  ChatMessage,
} from "../../../../packages/shared/types";

interface MeetingStore {
  // 연결 상태
  isConnected: boolean;
  setConnected: (v: boolean) => void;

  // 현재 사용자
  currentUserId: string | null;
  currentUserName: string;
  setCurrentUser: (id: string, name: string) => void;

  // 회의 상태
  meetingId: string | null;
  isRecording: boolean;
  meetingStarted: boolean;
  setMeetingId: (id: string) => void;
  setRecording: (v: boolean) => void;
  setMeetingStarted: (v: boolean) => void;

  // 참여자
  participants: ParticipantInfo[];
  setParticipants: (participants: ParticipantInfo[]) => void;
  addParticipant: (participant: ParticipantInfo) => void;
  removeParticipant: (participantId: string) => void;

  // 공유 트랜스크립트
  transcripts: SharedTranscript[];
  interimTranscript: string;
  addSharedTranscript: (entry: SharedTranscript) => void;
  addTranscript: (text: string) => void;
  setInterimTranscript: (text: string) => void;

  // 채팅
  chatMessages: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  isChatOpen: boolean;
  setChatOpen: (v: boolean) => void;

  // 요약
  summaries: string[];
  addSummary: (text: string) => void;

  // 페르소나
  activePersonas: Persona[];
  setActivePersonas: (personas: Persona[]) => void;

  // 페르소나 생각 & 솔루션
  thoughts: PersonaThought[];
  solutions: PersonaSolution[];
  isAnalyzing: boolean;
  analyzingPersonaId: string | null;
  lastRefreshAt: number;
  analysisInterval: number;
  addThought: (thought: PersonaThought) => void;
  addSolution: (solution: PersonaSolution) => void;
  setAnalyzing: (v: boolean, personaId?: string) => void;
  resetTimer: () => void;
  setAnalysisInterval: (v: number) => void;

  // TTS
  ttsEnabled: boolean;
  isAISpeaking: boolean;
  setTtsEnabled: (v: boolean) => void;
  setAISpeaking: (v: boolean) => void;

  // 회의 상태
  meetingState: Partial<MeetingState>;
  updateMeetingState: (update: Partial<MeetingState>) => void;

  // 리셋
  reset: () => void;
}

export const useMeetingStore = create<MeetingStore>((set) => ({
  isConnected: false,
  setConnected: (v) => set({ isConnected: v }),

  currentUserId: null,
  currentUserName: "",
  setCurrentUser: (id, name) => set({ currentUserId: id, currentUserName: name }),

  meetingId: null,
  isRecording: false,
  meetingStarted: false,
  setMeetingId: (id) => set({ meetingId: id }),
  setRecording: (v) => set({ isRecording: v }),
  setMeetingStarted: (v) => set({ meetingStarted: v }),

  participants: [],
  setParticipants: (participants) => set({ participants }),
  addParticipant: (participant) =>
    set((s) => ({
      participants: [...s.participants, participant],
    })),
  removeParticipant: (participantId) =>
    set((s) => ({
      participants: s.participants.filter((p) => p.id !== participantId),
    })),

  transcripts: [],
  interimTranscript: "",
  addSharedTranscript: (entry) =>
    set((s) => {
      if (!entry.isFinal) return s;
      return {
        transcripts: [...s.transcripts, entry],
      };
    }),
  addTranscript: (text) =>
    set((s) => ({
      transcripts: [
        ...s.transcripts,
        {
          speakerId: s.currentUserId || "local",
          speakerName: s.currentUserName || "나",
          text,
          isFinal: true,
          timestamp: Date.now(),
        },
      ],
    })),
  setInterimTranscript: (text) => set({ interimTranscript: text }),

  chatMessages: [],
  addChatMessage: (msg) =>
    set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
  isChatOpen: false,
  setChatOpen: (v) => set({ isChatOpen: v }),

  summaries: [],
  addSummary: (text) =>
    set((s) => ({ summaries: [...s.summaries, text] })),

  activePersonas: [],
  setActivePersonas: (personas) => set({ activePersonas: personas }),

  thoughts: [],
  solutions: [],
  isAnalyzing: false,
  analyzingPersonaId: null,
  lastRefreshAt: Date.now(),
  analysisInterval: 30,
  addThought: (thought) =>
    set((s) => ({
      thoughts: [...s.thoughts, thought],
      isAnalyzing: false,
      analyzingPersonaId: null,
      lastRefreshAt: Date.now(),
    })),
  addSolution: (solution) =>
    set((s) => ({
      solutions: [...s.solutions, solution],
      isAnalyzing: false,
      analyzingPersonaId: null,
    })),
  setAnalyzing: (v, personaId) =>
    set({ isAnalyzing: v, analyzingPersonaId: personaId || null }),
  resetTimer: () => set({ lastRefreshAt: Date.now() }),
  setAnalysisInterval: (v) => set({ analysisInterval: v }),

  ttsEnabled: true,
  isAISpeaking: false,
  setTtsEnabled: (v) => set({ ttsEnabled: v }),
  setAISpeaking: (v) => set({ isAISpeaking: v }),

  meetingState: {},
  updateMeetingState: (update) =>
    set((s) => ({
      meetingState: { ...s.meetingState, ...update },
    })),

  reset: () =>
    set({
      isConnected: false,
      currentUserId: null,
      currentUserName: "",
      meetingId: null,
      isRecording: false,
      meetingStarted: false,
      participants: [],
      transcripts: [],
      interimTranscript: "",
      chatMessages: [],
      isChatOpen: false,
      summaries: [],
      activePersonas: [],
      thoughts: [],
      solutions: [],
      isAnalyzing: false,
      analyzingPersonaId: null,
      lastRefreshAt: Date.now(),
      analysisInterval: 30,
      ttsEnabled: true,
      isAISpeaking: false,
      meetingState: {},
    }),
}));
