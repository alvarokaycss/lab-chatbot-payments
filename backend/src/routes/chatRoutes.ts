import { Router, type Request, type Response } from "express";
import { requireAuth } from "../auth/middleware.js";
import {
  streamAgentChat,
  type ConversationMessage
} from "../llm/agentService.js";

export const chatRouter = Router();

chatRouter.post("/", requireAuth, async (req: Request, res: Response) => {
  const { messages } = req.body ?? {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      error: "O campo 'messages' deve ser um array nao-vazio de mensagens."
    });
  }

  res.setHeader("Content-Type", "application/x-ndjson");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const abortController = new AbortController();
  req.on("close", () => {
    abortController.abort();
  });

  const onLine = (data: Record<string, unknown>) => {
    if (!res.writableEnded) {
      res.write(JSON.stringify(data) + "\n");
    }
  };

  try {
    await streamAgentChat(messages as ConversationMessage[], {
      onLine,
      signal: abortController.signal
    });
  } catch (error) {
    if (!res.writableEnded) {
      onLine({
        error: `Erro interno no servidor: ${error instanceof Error ? error.message : String(error)}`,
        done: true
      });
    }
  } finally {
    if (!res.writableEnded) {
      res.end();
    }
  }
});
