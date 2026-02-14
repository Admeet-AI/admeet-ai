import { openai } from "../lib/openai.js";
import { supabase } from "../lib/supabase.js";
import type { ProjectContextCard } from "@admeet/shared";

const CONTEXT_CARD_PROMPT = `당신은 마케팅 전문가(CMO)입니다. 사용자가 제공한 제품/서비스 정보를 분석하여 Project Context Card를 생성하세요.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "contextCard": {
    "productSummary": "제품 한 줄 설명",
    "coreValue": "핵심 가치",
    "targetPersonas": ["타겟 페르소나 1", "타겟 페르소나 2"],
    "differentiators": ["차별점 1", "차별점 2"],
    "kpiGoals": { "주요KPI": "목표값" },
    "constraints": ["제약사항"]
  },
  "followUpQuestions": [
    "보충 질문 1 (업종/시장 관련)",
    "보충 질문 2 (경쟁사 관련)",
    "보충 질문 3 (현재 마케팅 채널 관련)"
  ]
}

정보가 부족한 항목은 "미정" 또는 "부재"로 표시하세요.
followUpQuestions는 컨텍스트를 더 잘 이해하기 위한 핵심 질문 2~4개를 생성하세요.`;

export const initService = {
  async createContextCard(projectName: string, rawText: string) {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: CONTEXT_CARD_PROMPT },
        { role: "user", content: `프로젝트명: ${projectName}\n\n제품 정보:\n${rawText}` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const parsed = JSON.parse(response.choices[0].message.content || "{}");

    const { data, error } = await supabase
      .from("projects")
      .insert({
        name: projectName,
        context_card: parsed.contextCard,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      project: data,
      contextCard: parsed.contextCard as ProjectContextCard,
      followUpQuestions: parsed.followUpQuestions as string[],
    };
  },

  async refineContextCard(projectId: string, answers: Record<string, string>) {
    const { data: project } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (!project) throw new Error("프로젝트를 찾을 수 없음");

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: CONTEXT_CARD_PROMPT },
        {
          role: "user",
          content: `기존 Context Card:\n${JSON.stringify(project.context_card)}\n\n보충 답변:\n${JSON.stringify(answers)}\n\n위 정보를 반영하여 Context Card를 업데이트하세요.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const parsed = JSON.parse(response.choices[0].message.content || "{}");

    const { data, error } = await supabase
      .from("projects")
      .update({ context_card: parsed.contextCard })
      .eq("id", projectId)
      .select()
      .single();

    if (error) throw error;

    return {
      project: data,
      contextCard: parsed.contextCard as ProjectContextCard,
    };
  },
};
