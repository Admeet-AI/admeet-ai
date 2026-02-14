import { openai } from "../lib/openai.js";
import type { MeetingState, ThoughtCategory } from "@admeet/shared";

export interface AiCallMeta {
  purpose: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  response: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

interface ThoughtResult {
  content: string;
  category: ThoughtCategory;
}

interface SignalResult {
  hasSignal: boolean;
  question: string | null;
}

interface SolutionResult {
  question: string;
  solution: string;
  context: string;
}

const THOUGHT_PROMPT = `당신은 회의에 배석한 시니어 마케터입니다. 회의 내용을 관찰하며 마케팅 관점의 인사이트를 제공합니다.

회의 요약과 최근 발언을 보고, 마케팅 관점에서 떠오르는 "생각" 하나를 짧게 표현하세요.

카테고리 4종 (가장 적합한 1개 선택):
- "observation": 흥미로운 관찰 포인트 (예: "타겟층이 점점 좁혀지고 있네요")
- "concern": 우려 사항 (예: "경쟁사 대비 차별점이 아직 불명확합니다")
- "opportunity": 기회 발견 (예: "이 기능은 바이럴 포인트가 될 수 있겠어요")
- "insight": 마케팅 인사이트 (예: "이 가격대면 프리미엄 포지셔닝이 적합합니다")

규칙:
- 1~2문장으로 짧고 자연스럽게
- 한국어로 작성
- 회의 맥락에 맞는 구체적인 내용
- 매번 다른 관점에서 작성

반드시 JSON으로 응답:
{
  "content": "생각 내용",
  "category": "observation" | "concern" | "opportunity" | "insight"
}`;

const SIGNAL_DETECT_PROMPT = `당신은 회의 발언에서 AI 마케터 호출 시그널을 감지합니다.

"애드밋아", "애드밋", "마케터" 등의 호출어 뒤에 오는 질문이나 요청을 감지하세요.

규칙:
- 여러 발언 중 호출어가 포함된 발언이 여러 개면, 반드시 **가장 마지막(최신) 발언**의 질문/요청만 추출
- 호출어가 있고 그 뒤에 질문/요청이 있으면 hasSignal: true
- 호출어만 있고 질문이 없으면 hasSignal: false
- 호출어가 없으면 hasSignal: false

반드시 JSON으로 응답:
{
  "hasSignal": boolean,
  "question": "가장 마지막 호출의 질문/요청" | null
}`;

const SOLUTION_PROMPT = `당신은 10년차 시니어 퍼포먼스 마케터입니다. 회의 참여자가 당신을 호출하여 질문했습니다.

프로젝트 컨텍스트와 현재 회의 상태를 바탕으로, 구체적이고 실행 가능한 솔루션을 제공하세요.

규칙:
- 핵심 답변 2~4문장
- 구체적 수치, 벤치마크, 실행 방안 포함
- "~를 추천합니다", "~가 효과적입니다" 등 확신 있는 톤
- 프로젝트 맥락(타겟, KPI, 제약사항)을 반영한 맞춤 답변
- 한국어로 자연스럽게

반드시 JSON으로 응답:
{
  "question": "원래 질문 요약",
  "solution": "솔루션 내용",
  "context": "이 솔루션을 제안하는 근거 (1문장)"
}`;

interface SummaryResult {
  summary: string;
  stateUpdate: Partial<MeetingState> | null;
}

const SUMMARY_PROMPT = `당신은 회의 내용을 실시간 요약하는 AI 어시스턴트입니다.

최근 전사(transcript) 내용을 읽고, 이전 요약에 이어 새로운 내용을 간결하게 요약하세요.

규칙:
- 1~2문장으로 핵심만 요약
- 이전 요약과 중복되지 않는 새로운 내용만
- 사실 기반 — 발언된 내용만 요약 (추론/의견 X)
- 한국어로 자연스럽게
- 회의에서 논의된 구체적인 내용(타겟, 채널, 가격, 기능 등)이 있으면 stateUpdate에 반영

stateUpdate 가능 필드:
- targetSegment: string[] (타겟 고객층)
- problemStatement: string (문제 정의)
- valueProposition: string (가치 제안)
- keyMessages: string[] (핵심 메시지)
- channels: string[] (마케팅 채널)
- kpi: Record<string, string> (KPI)
- hypotheses: string[] (가설)
- decisions: { content: string, timestamp: string }[] (결정사항)
- actions: { content: string, assignee: string, deadline: string }[] (액션아이템)

반드시 JSON으로 응답:
{
  "summary": "요약 내용",
  "stateUpdate": { 변경된 필드 } | null
}`;

const SIGNAL_REGEX = /애드밋|마케터/;

export const marketerService = {
  async generateSummary(
    recentTranscript: string,
    previousSummaries: string[],
    state: MeetingState
  ): Promise<{ result: SummaryResult; meta: AiCallMeta }> {
    const model = "gpt-4o-mini";
    const systemPrompt = SUMMARY_PROMPT;
    const prevSummaryText = previousSummaries.slice(-3).join("\n");
    const trimmedState = { ...state, summary: state.summary.slice(-3) };
    const userPrompt = `[이전 요약]\n${prevSummaryText || "(없음)"}\n\n[현재 회의 상태]\n${JSON.stringify(trimmedState)}\n\n[최근 전사 내용]\n${recentTranscript}`;

    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0].message.content || "{}";
    const usage = response.usage;

    return {
      result: JSON.parse(content),
      meta: {
        purpose: "summary_generate",
        model,
        systemPrompt,
        userPrompt,
        response: content,
        promptTokens: usage?.prompt_tokens ?? 0,
        completionTokens: usage?.completion_tokens ?? 0,
        totalTokens: usage?.total_tokens ?? 0,
      },
    };
  },

  async generateThought(
    recentSummary: string,
    recentTranscript: string,
    state: MeetingState,
    contextCard: Record<string, unknown>
  ): Promise<{ result: ThoughtResult; meta: AiCallMeta } | null> {
    // 60% 확률로 실행하여 과다 생성 방지
    if (Math.random() > 0.6) return null;

    const model = "gpt-4o-mini";
    const systemPrompt = THOUGHT_PROMPT;
    const trimmedState = { ...state, summary: state.summary.slice(-3) };
    const userPrompt = `[프로젝트 컨텍스트]\n${JSON.stringify(contextCard)}\n\n[현재 회의 상태]\n${JSON.stringify(trimmedState)}\n\n[최근 요약]\n${recentSummary}\n\n[최근 발언]\n${recentTranscript}`;

    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const content = response.choices[0].message.content || "{}";
    const usage = response.usage;

    return {
      result: JSON.parse(content),
      meta: {
        purpose: "thought_generate",
        model,
        systemPrompt,
        userPrompt,
        response: content,
        promptTokens: usage?.prompt_tokens ?? 0,
        completionTokens: usage?.completion_tokens ?? 0,
        totalTokens: usage?.total_tokens ?? 0,
      },
    };
  },

  hasSignalKeyword(text: string): boolean {
    return SIGNAL_REGEX.test(text);
  },

  async detectSignal(
    recentTranscript: string
  ): Promise<{ result: SignalResult; meta: AiCallMeta }> {
    const model = "gpt-4o-mini";
    const systemPrompt = SIGNAL_DETECT_PROMPT;
    const userPrompt = `[최근 발언]\n${recentTranscript}`;

    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const content = response.choices[0].message.content || "{}";
    const usage = response.usage;

    return {
      result: JSON.parse(content),
      meta: {
        purpose: "signal_detect",
        model,
        systemPrompt,
        userPrompt,
        response: content,
        promptTokens: usage?.prompt_tokens ?? 0,
        completionTokens: usage?.completion_tokens ?? 0,
        totalTokens: usage?.total_tokens ?? 0,
      },
    };
  },

  async generateSolution(
    question: string,
    recentTranscript: string,
    state: MeetingState,
    contextCard: Record<string, unknown>
  ): Promise<{ result: SolutionResult; meta: AiCallMeta }> {
    const model = "gpt-4o";
    const systemPrompt = SOLUTION_PROMPT;
    const userPrompt = `[프로젝트 컨텍스트]\n${JSON.stringify(contextCard)}\n\n[현재 회의 상태]\n${JSON.stringify(state)}\n\n[최근 발언]\n${recentTranscript}\n\n[질문]\n${question}`;

    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = response.choices[0].message.content || "{}";
    const usage = response.usage;

    return {
      result: JSON.parse(content),
      meta: {
        purpose: "solution_generate",
        model,
        systemPrompt,
        userPrompt,
        response: content,
        promptTokens: usage?.prompt_tokens ?? 0,
        completionTokens: usage?.completion_tokens ?? 0,
        totalTokens: usage?.total_tokens ?? 0,
      },
    };
  },
};
