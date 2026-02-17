import { openai } from "../lib/openai.js";
import type { AiCallMeta } from "./persona-ai.js";

const SYSTEM_PROMPT = `당신은 한국어 음성인식(STT) 결과를 교정하는 전문가입니다.

규칙:
- 맞춤법, 띄어쓰기만 교정
- 마케팅/비즈니스 전문용어 정확도 향상 (예: "컨버젼" → "컨버전", "퍼널" 유지, "엘티비" → "LTV", "시피에이" → "CPA", "로아스" → "ROAS", "씨티알" → "CTR")
- 원본 의미/뉘앙스 절대 변경 금지
- 구어체 유지 (문어체 변환 금지)
- 교정할 것이 없으면 원본 그대로 반환

응답: JSON { "corrected": "교정된 텍스트" }`;

export async function correctTranscript(
  text: string
): Promise<{ corrected: string; meta: AiCallMeta }> {
  // 3글자 이하 짧은 텍스트는 스킵
  if (text.trim().length <= 3) {
    return {
      corrected: text,
      meta: {
        purpose: "transcript_correction_skipped",
        model: "none",
        systemPrompt: "",
        userPrompt: text,
        response: text,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
    };
  }

  const model = "gpt-4o-mini";
  const userPrompt = text;

  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const content = response.choices[0].message.content || "{}";
  const usage = response.usage;
  const parsed = JSON.parse(content);

  return {
    corrected: parsed.corrected || text,
    meta: {
      purpose: "transcript_correction",
      model,
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      response: content,
      promptTokens: usage?.prompt_tokens ?? 0,
      completionTokens: usage?.completion_tokens ?? 0,
      totalTokens: usage?.total_tokens ?? 0,
    },
  };
}
