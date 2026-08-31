import "@dotenvx/dotenvx/config";
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { findUserById } from "./db/users.js";
import { logAudit } from "./audit.js";
import {
  listCatalogSchema,
  handleListCatalog,
  registerIntentSchema,
  handleRegisterIntent,
  executePurchaseSchema,
  handleExecutePurchase
} from "./tools/index.js";

const HOST = process.env.HOST ?? "127.0.0.1";
const PORT = Number(process.env.PORT ?? 3001);

function json(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(value, null, 2)
      }
    ]
  };
}

export const app = express();
app.use(cors());
app.use(express.json({ limit: "256kb" }));

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "payments-mcp-server",
    timestamp: new Date().toISOString()
  });
});

app.get("/internal/users/:id", (req, res) => {
  const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const user = findUserById(userId);
  if (!user) {
    res.status(404).json({ error: "Usuário não encontrado." });
    return;
  }

  res.json({
    id: user.id,
    username: user.username,
    name: user.name,
    limite_total: user.limite_total,
    limite_disponivel: user.limite_disponivel
  });
});

app.post("/mcp", async (req, res) => {
  const userId = (req.headers["x-user-id"] as string | undefined) || "usr_std_02";
  const conversationId = (req.headers["x-conversation-id"] as string | undefined) || "default_conv";

  const mcp = new McpServer({
    name: "payments-mcp-server",
    version: "1.0.0"
  });

  mcp.registerTool(
    "listar_catalogo",
    {
      description: "Lista os produtos disponíveis no catálogo com preços em BRL, estoque e filtro opcional por categoria.",
      inputSchema: listCatalogSchema.shape
    },
    async ({ categoria }) => {
      const result = handleListCatalog({ categoria });
      logAudit({ userId, conversationId, tool: "listar_catalogo", args: { categoria }, result });
      return json(result);
    }
  );

  mcp.registerTool(
    "registrar_intencao",
    {
      description: "Registra a intenção de compra de um produto e quantidade.",
      inputSchema: registerIntentSchema.shape
    },
    async (args) => {
      if (!userId || !conversationId) {
        const errResult = { error: "Contexto de autenticação ausente." };
        logAudit({ userId, conversationId, tool: "registrar_intencao", args, result: errResult });
        return json(errResult);
      }
      const result = handleRegisterIntent(args, { userId, conversationId });
      logAudit({ userId, conversationId, tool: "registrar_intencao", args, result });
      return json(result);
    }
  );

  mcp.registerTool(
    "realizar_compra",
    {
      description: "Executa a compra a partir de cartão ou pix. Valida intenção, prazo e limite de crédito do usuário.",
      inputSchema: executePurchaseSchema.shape
    },
    async (args) => {
      if (!userId || !conversationId) {
        const errResult = { error: "Contexto de autenticação ausente." };
        logAudit({ userId, conversationId, tool: "realizar_compra", args, result: errResult });
        return json(errResult);
      }
      const result = handleExecutePurchase(args, { userId, conversationId });
      logAudit({ userId, conversationId, tool: "realizar_compra", args, result });
      return json(result);
    }
  );

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined
  });

  res.on("close", () => transport.close());
  await mcp.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

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
    console.log(`[MCP-SERVER] Payments: http://${HOST}:${PORT}/mcp`);
  });
}

