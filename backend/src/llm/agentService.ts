import "@dotenvx/dotenvx/config";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  connectMcpClient,
  toOllamaTools,
  runMcpTool,
  type ToolCallItem
} from "../mcp/client.js";
import { SALES_SYSTEM_PROMPT } from "./prompts.js";

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
}

export async function streamAgentChat(
  messages: ConversationMessage[],
  callbacks: AgentStreamCallbacks
): Promise<void> {
  let mcpClient: Client | undefined;
  let ollamaTools: unknown[] | undefined;

  try {
    mcpClient = await connectMcpClient();
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
              callbacks.onLine(chunk);
            }

            if (chunk.message?.tool_calls) {
              capturedCalls.push(...chunk.message.tool_calls);
            }
          } catch {
          }
        }
      }

      if (capturedCalls.length === 0) {
        callbacks.onLine({ done: true });
        break;
      }

      convo.push({
        role: "assistant",
        content: accumulatedContent,
        tool_calls: capturedCalls
      });

      for (const call of capturedCalls) {
        const toolResult = mcpClient
          ? await runMcpTool(mcpClient, call)
          : { error: "Servidor MCP indisponivel" };

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
}
