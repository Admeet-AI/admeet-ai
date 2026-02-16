import { Router } from "express";
import { randomBytes } from "crypto";
import { supabase } from "../lib/supabase.js";
import type { MeetingType } from "@admeet/shared";

export const meetingRoutes = Router();

function generateInviteCode(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}

// POST /api/meetings - 회의 생성
meetingRoutes.post("/", async (req, res) => {
  try {
    const { projectId, title, type } = req.body as {
      projectId: string;
      title: string;
      type: MeetingType;
    };

    const inviteCode = generateInviteCode();

    const { data, error } = await supabase
      .from("meetings")
      .insert({
        project_id: projectId,
        title,
        type,
        status: "preparing",
        invite_code: inviteCode,
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("[meeting] Error:", error);
    res.status(500).json({ error: "회의 생성 실패" });
  }
});

// GET /api/meetings/invite/:code - 초대 코드로 회의 조회
meetingRoutes.get("/invite/:code", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("meetings")
      .select("*")
      .eq("invite_code", req.params.code)
      .single();

    if (error || !data) {
      res.status(404).json({ error: "유효하지 않은 초대 코드입니다" });
      return;
    }

    if (data.status === "ended") {
      res.status(410).json({ error: "이미 종료된 회의입니다" });
      return;
    }

    res.json(data);
  } catch (error) {
    res.status(404).json({ error: "회의를 찾을 수 없음" });
  }
});

// GET /api/meetings/:id - 회의 조회
meetingRoutes.get("/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("meetings")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: "회의를 찾을 수 없음" });
  }
});
