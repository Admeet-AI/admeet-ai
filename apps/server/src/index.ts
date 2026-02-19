import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { join } from "path";
import { initRoutes } from "./routes/init.js";
import { meetingRoutes } from "./routes/meeting.js";
import { reportRoutes } from "./routes/report.js";
import { logRoutes } from "./routes/logs.js";
import { personaRoutes } from "./routes/persona.js";
import { setupWebSocket } from "./ws/handler.js";

const app = express();
const port = process.env.PORT || 4000;

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "1mb" }));

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// REST Routes
app.use("/api/init", initRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/personas", personaRoutes);

// Static files (log viewer)
app.use(express.static(join(process.cwd(), "public")));

// HTTP + WebSocket 서버
const server = createServer(app);
setupWebSocket(server);

server.listen(port, () => {
  console.log(`[AdMeet] Server running on port ${port}`);
});
