import { Router } from "express";
import { meetingLogger } from "../lib/logger.js";

export const logRoutes = Router();

// 회의 로그 목록
logRoutes.get("/", (_req, res) => {
  const logs = meetingLogger.listLogs();
  res.json(logs);
});

// 개별 회의 로그
logRoutes.get("/:meetingId", (req, res) => {
  const log = meetingLogger.getLog(req.params.meetingId);
  if (!log) {
    res.status(404).json({ error: "로그를 찾을 수 없습니다" });
    return;
  }
  res.json(log);
});
