import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { requireAuth } from "../auth/middleware.js";
import {
  streamAgentChat,
  type ConversationMessage
} from "../llm/agentService.js";

const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system", "tool"]),
  content: z.string().optional(),
  tool_calls: z.array(z.record(z.string(), z.unknown())).optional()
});

const chatSchema = z.object({
  conversation_id: z.string().optional(),
  messages: z.array(messageSchema).min(1)
});

export const chatRouter = Router();

chatRouter.post("/", requireAuth, async (req: Request, res: Response) => {
  const parseResult = chatSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      error: "O payload deve conter 'messages' (array não-vazio de mensagens)."
    });
  }

  const { conversation_id, messages } = parseResult.data;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      error: "Usuário não autenticado."
    });
  }

  res.setHeader("Content-Type", "application/x-ndjson");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const abortController = new AbortController();
  res.on("close", () => {
    if (!res.writableEnded) {
      abortController.abort();
    }
  });

  const onLine = (data: Record<string, unknown>) => {
    if (!res.writableEnded) {
      res.write(JSON.stringify(data) + "\n");
    }
  };

  try {
    await streamAgentChat(messages as ConversationMessage[], {
      onLine,
      signal: abortController.signal,
      userId,
      conversationId: conversation_id || "conv_default"
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


