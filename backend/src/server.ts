import "@dotenvx/dotenvx/config";
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/authRoutes.js";

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "localhost";

export const app = express();

app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`[BACKEND-API] Servidor rodando em http://${HOST}:${PORT}`);
});
