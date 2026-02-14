import { Router } from "express";
import { reportService } from "../services/report.js";

export const reportRoutes = Router();

// POST /api/reports/:meetingId - 회의록 생성
reportRoutes.post("/:meetingId", async (req, res) => {
  try {
    const report = await reportService.generateReport(req.params.meetingId);
    res.json(report);
  } catch (error) {
    console.error("[report] Error:", error);
    res.status(500).json({ error: "회의록 생성 실패" });
  }
});

// GET /api/reports/:meetingId - 회의록 조회
reportRoutes.get("/:meetingId", async (req, res) => {
  try {
    const report = await reportService.getReport(req.params.meetingId);
    res.json(report);
  } catch (error) {
    res.status(404).json({ error: "회의록을 찾을 수 없음" });
  }
});
