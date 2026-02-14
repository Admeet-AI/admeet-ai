import { Router } from "express";
import { initService } from "../services/init.js";

export const initRoutes = Router();

// POST /api/init - 컨텍스트 주입 → Project Context Card 생성
initRoutes.post("/", async (req, res) => {
  try {
    const { projectName, rawText } = req.body;
    const result = await initService.createContextCard(projectName, rawText);
    res.json(result);
  } catch (error) {
    console.error("[init] Error:", error);
    res.status(500).json({ error: "Context Card 생성 실패" });
  }
});

// POST /api/init/:projectId/answer - 보충 질문 답변 처리
initRoutes.post("/:projectId/answer", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { answers } = req.body;
    const result = await initService.refineContextCard(projectId, answers);
    res.json(result);
  } catch (error) {
    console.error("[init] Error:", error);
    res.status(500).json({ error: "Context Card 업데이트 실패" });
  }
});
