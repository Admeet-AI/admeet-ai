import { openai } from "../lib/openai.js";
import { supabase } from "../lib/supabase.js";

const REPORT_PROMPT = `당신은 마케팅 전문가입니다. 회의 데이터를 바탕으로 마케팅 관점이 포함된 회의록을 Markdown으로 생성하세요.

아래 템플릿을 따르세요:

# 회의록 - {날짜} {회의 제목}

## 📋 회의 요약
(전체 회의 핵심 내용 3~5줄)

## 🎯 마케팅 관점 정리
### 타겟 고객 (확정 / 후보)
### 핵심 메시지 (확정 / 후보)
### 차별점 (확정 / 검증 필요)
### 채널 전략 (논의됨 / 미논의)

## 🧪 실험 계획
(가설, 변수, 성공 기준, 기간 포함)

## ✅ 결정사항

## 📌 액션 아이템
(담당 / 기한 / 내용)

## ❓ 미해결 질문

논의되지 않은 섹션은 "미논의"로 표시하세요.`;

export const reportService = {
  async generateReport(meetingId: string) {
    // 회의 정보 조회
    const { data: meeting } = await supabase
      .from("meetings")
      .select("*, projects(name, context_card)")
      .eq("id", meetingId)
      .single();

    if (!meeting) throw new Error("회의를 찾을 수 없음");

    // 최신 상태 스냅샷
    const { data: stateSnapshot } = await supabase
      .from("meeting_states")
      .select("state")
      .eq("meeting_id", meetingId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // 이벤트 로그
    const { data: events } = await supabase
      .from("meeting_events")
      .select("*")
      .eq("meeting_id", meetingId)
      .order("created_at", { ascending: true });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: REPORT_PROMPT },
        {
          role: "user",
          content: `회의 제목: ${meeting.title}\n회의 유형: ${meeting.type}\n날짜: ${meeting.created_at}\n\n[프로젝트 컨텍스트]\n${JSON.stringify(meeting.projects?.context_card)}\n\n[회의 상태]\n${JSON.stringify(stateSnapshot?.state)}\n\n[이벤트 로그]\n${JSON.stringify(events?.map((e: { type: string; payload: unknown }) => ({ type: e.type, payload: e.payload })))}`,
        },
      ],
      temperature: 0.3,
    });

    const markdown = response.choices[0].message.content || "";

    // 저장
    const { data, error } = await supabase
      .from("final_reports")
      .upsert({
        meeting_id: meetingId,
        markdown,
      })
      .select()
      .single();

    if (error) throw error;

    return { report: data, markdown };
  },

  async getReport(meetingId: string) {
    const { data, error } = await supabase
      .from("final_reports")
      .select("*")
      .eq("meeting_id", meetingId)
      .single();

    if (error) throw error;
    return data;
  },
};
