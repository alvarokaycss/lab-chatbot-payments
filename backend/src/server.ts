import "@dotenvx/dotenvx/config";
import express from "express";
import cors from "cors";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { authRouter } from "./routes/authRoutes.js";
import { chatRouter } from "./routes/chatRoutes.js";

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "127.0.0.1";

const allowedOrigins = process.env.FRONTEND_ORIGINS
  ? process.env.FRONTEND_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
  : ["http://localhost:5173", "http://127.0.0.1:5173"];

export const app = express();

app.use(
  cors({
    origin: allowedOrigins.length === 1 && allowedOrigins[0] === "*" ? true : allowedOrigins,
    credentials: true
  })
);
app.use(express.json({ limit: "256kb" }));

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "chatbot-backend",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authRouter);
app.use("/api/user", authRouter);
app.use("/api/chat", chatRouter);

const isMain = () => {
  if (!process.argv[1]) return false;
  try {
    const currentFile = fileURLToPath(import.meta.url);
    return path.resolve(process.argv[1]) === path.resolve(currentFile);
  } catch {
    return false;
  }
};

if (isMain()) {
  app.listen(PORT, HOST, () => {
    console.log(`[BACKEND-API] Servidor rodando em http://${HOST}:${PORT}`);
  });
}
