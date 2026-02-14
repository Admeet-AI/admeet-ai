import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import type { MeetingType } from "@admeet/shared";

export const meetingRoutes = Router();

// POST /api/meetings - 회의 생성
meetingRoutes.post("/", async (req, res) => {
  try {
    const { projectId, title, type } = req.body as {
      projectId: string;
      title: string;
      type: MeetingType;
    };

    const { data, error } = await supabase
      .from("meetings")
      .insert({ project_id: projectId, title, type, status: "preparing" })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("[meeting] Error:", error);
    res.status(500).json({ error: "회의 생성 실패" });
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
