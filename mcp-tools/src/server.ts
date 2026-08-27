import "@dotenvx/dotenvx/config";
import express from "express";
import cors from "cors";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import {
  listCatalogSchema,
  handleListCatalog,
  registerIntentSchema,
  handleRegisterIntent,
  executePurchaseSchema,
  handleExecutePurchase
} from "./tools/index.js";

const PORT = Number(process.env.PORT ?? 3001);

const mcp = new McpServer({
  name: "payments-mcp-server",
  version: "1.0.0"
});

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


mcp.registerTool(
  "listar_catalogo",
  {
    description: "Lista os produtos disponíveis no catálogo com preços em BRL, estoque e filtro opcional por categoria.",
    inputSchema: listCatalogSchema.shape
  },
  async ({ categoria }) => json(handleListCatalog({ categoria }))
);

mcp.registerTool(
  "registrar_intencao",
  {
    description: "Registra a intenção de compra de um produto e quantidade.",
    inputSchema: registerIntentSchema.shape
  },
  async ({ produto_id, quantidade }) =>
    json(handleRegisterIntent({ produto_id, quantidade }))
);

mcp.registerTool(
  "realizar_compra",
  {
    description: "Executa a compra a partir de cartão ou pix. Valida intenção, prazo e limite de crédito do usuário.",
    inputSchema: executePurchaseSchema.shape
  },
  async ({ intencao_id, metodo_pagamento }) =>
    json(handleExecutePurchase({ intencao_id, metodo_pagamento }))
);

const app = express();
app.use(cors());
app.use(express.json());

app.post("/mcp", async (req, res) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined
  });
  res.on("close", () => transport.close());
  await mcp.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "payments-mcp-server",
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`[MCP-SERVER] Payments: http://localhost:${PORT}/mcp`);
});
