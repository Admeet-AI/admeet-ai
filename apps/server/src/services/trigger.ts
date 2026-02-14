import { openai } from "../lib/openai.js";
import type { MeetingState, TriggerType } from "@admeet/shared";

interface TriggerResult {
  hasTrigger: boolean;
  triggerType: TriggerType | null;
  summary: string;
  stateUpdate: Partial<MeetingState> | null;
}

interface InterventionResult {
  message: string;
  trigger: TriggerType;
}

const TRIGGER_DETECT_PROMPT = `당신은 회의에 배석한 AI 마케터입니다. 최근 발언을 분석하여 마케팅 관점에서 개입이 필요한지 판단하세요.

트리거 3종:
1. "target_vague" - 타겟이 모호 ("20~30대", "누구나", "모든 사람", "전부")
2. "message_abstract" - 메시지가 추상적 ("빠르고 편리", "혁신적", "쉽고 직관적", "좋은")
3. "experiment_missing" - 실험 설계 없이 실행하려 함 ("카피 바꿔보자", "광고 돌려보자", "마케팅 해보자")

반드시 JSON으로 응답:
{
  "hasTrigger": boolean,
  "triggerType": "target_vague" | "message_abstract" | "experiment_missing" | null,
  "summary": "최근 발언 요약 (1~2문장)",
  "stateUpdate": { 변경된 MeetingState 필드 } | null
}`;

const INTERVENTION_PROMPT = `당신은 회의에 배석한 AI 마케터입니다. 팀원처럼 자연스럽게 마케팅 관점에서 질문하세요.

규칙:
- 1~2문장 + 질문 1개로 짧게
- 단정하지 말고 질문/옵션으로 제시
- 한국어로 자연스럽게
- 팀원이 옆에서 "잠깐, 그거 마케팅 관점에서 보면..." 하는 톤

트리거별 질문 방향:
- target_vague: 타겟 세분화 (직군/상황/문제 기반)
- message_abstract: 메시지 구체화 (비교대상/수치/사례)
- experiment_missing: 실험 설계 (가설/지표/기간/성공기준)`;

export const triggerService = {
  async detectTrigger(
    recentTranscript: string,
    state: MeetingState,
    contextCard: Record<string, unknown>
  ): Promise<TriggerResult> {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: TRIGGER_DETECT_PROMPT },
        {
          role: "user",
          content: `[프로젝트 컨텍스트]\n${JSON.stringify(contextCard)}\n\n[현재 회의 상태]\n${JSON.stringify(state)}\n\n[최근 발언]\n${recentTranscript}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  },

  async generateIntervention(
    triggerType: TriggerType,
    recentTranscript: string,
    state: MeetingState,
    contextCard: Record<string, unknown>
  ): Promise<InterventionResult> {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: INTERVENTION_PROMPT },
        {
          role: "user",
          content: `트리거: ${triggerType}\n\n[컨텍스트]\n${JSON.stringify(contextCard)}\n\n[회의 상태]\n${JSON.stringify(state)}\n\n[최근 발언]\n${recentTranscript}\n\n마케팅 관점에서 자연스럽게 개입하세요.`,
        },
      ],
      temperature: 0.7,
    });

    return {
      message: response.choices[0].message.content || "",
      trigger: triggerType,
    };
  },
};
