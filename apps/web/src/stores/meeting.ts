import { create } from "zustand";
import type { MeetingState, TriggerType } from "../../../../packages/shared/types";

interface AIIntervention {
  id: string;
  trigger: TriggerType;
  message: string;
  timestamp: number;
}

interface TranscriptEntry {
  text: string;
  isFinal: boolean;
  timestamp: number;
}

interface MeetingStore {
  // 연결 상태
  isConnected: boolean;
  setConnected: (v: boolean) => void;

  // 회의 상태
  meetingId: string | null;
  isRecording: boolean;
  setMeetingId: (id: string) => void;
  setRecording: (v: boolean) => void;

  // Transcript
  transcripts: TranscriptEntry[];
  interimTranscript: string;
  addTranscript: (text: string) => void;
  setInterimTranscript: (text: string) => void;

  // 요약
  summaries: string[];
  addSummary: (text: string) => void;

  // AI 개입
  interventions: AIIntervention[];
  addIntervention: (trigger: TriggerType, message: string) => void;

  // 회의 상태 (마케팅 관점)
  meetingState: Partial<MeetingState>;
  updateMeetingState: (update: Partial<MeetingState>) => void;

  // 리셋
  reset: () => void;
}

export const useMeetingStore = create<MeetingStore>((set) => ({
  isConnected: false,
  setConnected: (v) => set({ isConnected: v }),

  meetingId: null,
  isRecording: false,
  setMeetingId: (id) => set({ meetingId: id }),
  setRecording: (v) => set({ isRecording: v }),

  transcripts: [],
  interimTranscript: "",
  addTranscript: (text) =>
    set((s) => ({
      transcripts: [
        ...s.transcripts,
        { text, isFinal: true, timestamp: Date.now() },
      ],
    })),
  setInterimTranscript: (text) => set({ interimTranscript: text }),

  summaries: [],
  addSummary: (text) =>
    set((s) => ({ summaries: [...s.summaries, text] })),

  interventions: [],
  addIntervention: (trigger, message) =>
    set((s) => ({
      interventions: [
        ...s.interventions,
        {
          id: crypto.randomUUID(),
          trigger,
          message,
          timestamp: Date.now(),
        },
      ],
    })),

  meetingState: {},
  updateMeetingState: (update) =>
    set((s) => ({
      meetingState: { ...s.meetingState, ...update },
    })),

  reset: () =>
    set({
      isConnected: false,
      meetingId: null,
      isRecording: false,
      transcripts: [],
      interimTranscript: "",
      summaries: [],
      interventions: [],
      meetingState: {},
    }),
}));
