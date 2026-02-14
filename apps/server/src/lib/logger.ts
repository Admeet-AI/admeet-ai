import { writeFileSync, mkdirSync, existsSync, appendFileSync, readFileSync, readdirSync } from "fs";
import { join } from "path";

const LOGS_DIR = join(process.cwd(), "logs");

function ensureLogsDir() {
  if (!existsSync(LOGS_DIR)) {
    mkdirSync(LOGS_DIR, { recursive: true });
  }
}

function getLogPath(meetingId: string) {
  return join(LOGS_DIR, `${meetingId}.json`);
}

export interface LogEntry {
  timestamp: string;
  type: "meeting_start" | "meeting_end" | "transcript" | "summary" | "intervention" | "ai_call";
  data: Record<string, unknown>;
}

export interface MeetingLog {
  meetingId: string;
  title: string;
  startedAt: string;
  endedAt: string | null;
  entries: LogEntry[];
  tokenUsage: {
    totalPromptTokens: number;
    totalCompletionTokens: number;
    totalTokens: number;
    calls: number;
  };
}

function readLog(meetingId: string): MeetingLog | null {
  const path = getLogPath(meetingId);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8"));
}

function writeLog(log: MeetingLog) {
  writeFileSync(getLogPath(log.meetingId), JSON.stringify(log, null, 2), "utf-8");
}

export const meetingLogger = {
  start(meetingId: string, title: string) {
    ensureLogsDir();
    const log: MeetingLog = {
      meetingId,
      title,
      startedAt: new Date().toISOString(),
      endedAt: null,
      entries: [{ timestamp: new Date().toISOString(), type: "meeting_start", data: { title } }],
      tokenUsage: { totalPromptTokens: 0, totalCompletionTokens: 0, totalTokens: 0, calls: 0 },
    };
    writeLog(log);
  },

  transcript(meetingId: string, text: string) {
    const log = readLog(meetingId);
    if (!log) return;
    log.entries.push({ timestamp: new Date().toISOString(), type: "transcript", data: { text } });
    writeLog(log);
  },

  summary(meetingId: string, text: string) {
    const log = readLog(meetingId);
    if (!log) return;
    log.entries.push({ timestamp: new Date().toISOString(), type: "summary", data: { text } });
    writeLog(log);
  },

  intervention(meetingId: string, trigger: string, message: string) {
    const log = readLog(meetingId);
    if (!log) return;
    log.entries.push({ timestamp: new Date().toISOString(), type: "intervention", data: { trigger, message } });
    writeLog(log);
  },

  aiCall(meetingId: string, detail: {
    purpose: string;
    model: string;
    systemPrompt: string;
    userPrompt: string;
    response: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  }) {
    const log = readLog(meetingId);
    if (!log) return;
    log.entries.push({ timestamp: new Date().toISOString(), type: "ai_call", data: detail });
    log.tokenUsage.totalPromptTokens += detail.promptTokens;
    log.tokenUsage.totalCompletionTokens += detail.completionTokens;
    log.tokenUsage.totalTokens += detail.totalTokens;
    log.tokenUsage.calls += 1;
    writeLog(log);
  },

  end(meetingId: string) {
    const log = readLog(meetingId);
    if (!log) return;
    log.endedAt = new Date().toISOString();
    log.entries.push({ timestamp: new Date().toISOString(), type: "meeting_end", data: {} });
    writeLog(log);
  },

  getLog(meetingId: string): MeetingLog | null {
    return readLog(meetingId);
  },

  listLogs(): { meetingId: string; title: string; startedAt: string; endedAt: string | null; tokenUsage: MeetingLog["tokenUsage"] }[] {
    ensureLogsDir();
    const files = readdirSync(LOGS_DIR).filter((f) => f.endsWith(".json"));
    return files.map((f) => {
      const log: MeetingLog = JSON.parse(readFileSync(join(LOGS_DIR, f), "utf-8"));
      return { meetingId: log.meetingId, title: log.title, startedAt: log.startedAt, endedAt: log.endedAt, tokenUsage: log.tokenUsage };
    }).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  },
};
