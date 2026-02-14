import { create } from "zustand";
import type { MeetingState, MarketerThought, MarketerSolution } from "../../../../packages/shared/types";

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

  // 마케터 생각 & 솔루션
  thoughts: MarketerThought[];
  solutions: MarketerSolution[];
  isAnalyzing: boolean;
  lastRefreshAt: number;
  analysisInterval: number;
  addThought: (thought: MarketerThought) => void;
  addSolution: (solution: MarketerSolution) => void;
  setAnalyzing: (v: boolean) => void;
  resetTimer: () => void;
  setAnalysisInterval: (v: number) => void;

  // TTS
  ttsEnabled: boolean;
  isAISpeaking: boolean;
  setTtsEnabled: (v: boolean) => void;
  setAISpeaking: (v: boolean) => void;

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

  thoughts: [],
  solutions: [],
  isAnalyzing: false,
  lastRefreshAt: Date.now(),
  analysisInterval: 30,
  addThought: (thought) =>
    set((s) => ({
      thoughts: [...s.thoughts, thought],
      isAnalyzing: false,
      lastRefreshAt: Date.now(),
    })),
  addSolution: (solution) =>
    set((s) => ({
      solutions: [...s.solutions, solution],
      isAnalyzing: false,
    })),
  setAnalyzing: (v) => set({ isAnalyzing: v }),
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
      meetingId: null,
      isRecording: false,
      transcripts: [],
      interimTranscript: "",
      summaries: [],
      thoughts: [],
      solutions: [],
      isAnalyzing: false,
      lastRefreshAt: Date.now(),
      analysisInterval: 30,
      ttsEnabled: true,
      isAISpeaking: false,
      meetingState: {},
    }),
}));
