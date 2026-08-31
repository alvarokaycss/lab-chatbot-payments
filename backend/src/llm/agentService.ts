import "@dotenvx/dotenvx/config";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  connectMcpClient,
  toOllamaTools,
  runMcpTool,
  type ToolCallItem
} from "../mcp/client.js";
import { SALES_SYSTEM_PROMPT } from "./prompts.js";
import { deductUserBalance } from "../auth/users.js";

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "qwen3:1.7b";
const MAX_ROUNDS = 4;

export interface ConversationMessage {
  role: "user" | "assistant" | "system" | "tool";
  content?: string;
  tool_calls?: ToolCallItem[];
}

export interface AgentStreamCallbacks {
  onLine: (data: Record<string, unknown>) => void;
  signal?: AbortSignal;
  userId?: string;
  conversationId?: string;
}

export async function streamAgentChat(
  messages: ConversationMessage[],
  callbacks: AgentStreamCallbacks
): Promise<ConversationMessage[]> {
  let mcpClient: Client | undefined;
  let ollamaTools: unknown[] | undefined;

  try {
    mcpClient = await connectMcpClient({
      userId: callbacks.userId,
      conversationId: callbacks.conversationId
    });
    const { tools } = await mcpClient.listTools();
    ollamaTools = toOllamaTools(tools);
  } catch (error) {
    callbacks.onLine({
      warning: `Nao foi possivel conectar ao servidor MCP: ${error instanceof Error ? error.message : String(error)}`
    });
    mcpClient = undefined;
    ollamaTools = undefined;
  }

  const convo: ConversationMessage[] = [];
  const hasSystem = messages.some((m) => m.role === "system");
  if (!hasSystem) {
    convo.push({ role: "system", content: SALES_SYSTEM_PROMPT });
  }
  convo.push(...messages);

  try {
    for (let round = 0; round < MAX_ROUNDS; round++) {
      const res = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages: convo,
          tools: ollamaTools,
          stream: true
        }),
        signal: callbacks.signal
      });

      if (!res.ok || !res.body) {
        callbacks.onLine({
          error: `Erro ao comunicar com Ollama (${res.status}): ${await res.text()}`,
          done: true
        });
        break;
      }

      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = "";
      let accumulatedContent = "";
      const capturedCalls: ToolCallItem[] = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += value;
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const chunk = JSON.parse(line);
            const tokenText = chunk.message?.content ?? "";

            if (tokenText) {
              accumulatedContent += tokenText;
              callbacks.onLine({
                message: {
                  role: "assistant",
                  content: tokenText
                }
              });
            }

            if (chunk.message?.tool_calls) {
              capturedCalls.push(...chunk.message.tool_calls);
            }
          } catch {
          }
        }
      }

      if (capturedCalls.length === 0) {
        if (accumulatedContent) {
          convo.push({
            role: "assistant",
            content: accumulatedContent
          });
        }
        callbacks.onLine({ done: true });
        break;
      }

      convo.push({
        role: "assistant",
        content: accumulatedContent,
        tool_calls: capturedCalls
      });

      for (const call of capturedCalls) {
        if (
          callbacks.userId &&
          (call.function.name === "registrar_intencao" ||
            call.function.name === "realizar_compra")
        ) {
          call.function.arguments = {
            ...call.function.arguments,
            user_id: callbacks.userId
          };
        }
        if (
          callbacks.conversationId &&
          (call.function.name === "registrar_intencao" ||
            call.function.name === "realizar_compra")
        ) {
          call.function.arguments = {
            ...call.function.arguments,
            conversation_id: callbacks.conversationId
          };
        }

        const toolResult = mcpClient
          ? await runMcpTool(mcpClient, call)
          : { error: "Servidor MCP indisponivel" };

        if (
          call.function.name === "realizar_compra" &&
          toolResult &&
          typeof toolResult === "object" &&
          (toolResult as Record<string, unknown>).status === "aprovado" &&
          callbacks.userId
        ) {
          const valor = (toolResult as Record<string, unknown>).valor;
          if (typeof valor === "number") {
            deductUserBalance(callbacks.userId, valor);
          }
        }

        convo.push({
          role: "tool",
          content: JSON.stringify(toolResult)
        });

        callbacks.onLine({
          tool: {
            name: call.function.name,
            arguments: call.function.arguments,
            result: toolResult
          }
        });
      }
    }
  } catch (error) {
    if ((error as { name?: string }).name !== "AbortError") {
      callbacks.onLine({
        error: `Erro no loop do agente: ${error instanceof Error ? error.message : String(error)}`,
        done: true
      });
    }
  } finally {
    if (mcpClient) {
      await mcpClient.close();
    }
  }

  return convo;
}
