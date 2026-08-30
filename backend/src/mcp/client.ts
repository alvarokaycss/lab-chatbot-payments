import "@dotenvx/dotenvx/config";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const MCP_URL = process.env.MCP_URL ?? "http://localhost:3001/mcp";

export interface OllamaFunctionParameter {
  type: string;
  properties?: Record<string, unknown>;
  required?: string[];
}

export interface OllamaTool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: unknown;
  };
}

export interface ToolCallItem {
  function: {
    name: string;
    arguments: Record<string, unknown>;
  };
}

export async function connectMcpClient(): Promise<Client> {
  const client = new Client({
    name: "chatbot-backend-client",
    version: "1.0.0"
  });

  const transport = new StreamableHTTPClientTransport(new URL(MCP_URL));
  await client.connect(transport);
  return client;
}

export function toOllamaTools(
  mcpTools: Array<{
    name: string;
    description?: string;
    inputSchema: unknown;
  }>
): OllamaTool[] {
  return mcpTools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description ?? "",
      parameters: tool.inputSchema
    }
  }));
}

export async function runMcpTool(
  client: Client,
  call: ToolCallItem
): Promise<unknown> {
  try {
    const output = await client.callTool({
      name: call.function.name,
      arguments: call.function.arguments ?? {}
    });

    const textContent = Array.isArray(output.content)
      ? output.content.find((c) => c.type === "text")?.text
      : undefined;

    if (output.isError) {
      return { error: textContent ?? "Falha na execucao da ferramenta no servidor MCP." };
    }

    try {
      return JSON.parse(textContent ?? "null");
    } catch {
      return textContent;
    }
  } catch (error) {
    return {
      error: `Erro ao comunicar com o servidor MCP: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}
