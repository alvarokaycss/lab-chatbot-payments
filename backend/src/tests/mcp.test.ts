import assert from "node:assert/strict";
import "@dotenvx/dotenvx/config";
import {
  connectMcpClient,
  toOllamaTools,
  runMcpTool,
  getMcpUserProfile
} from "../mcp/client.js";

async function runMcpTests() {
  console.log("Iniciando testes de conexao com o Servidor MCP...");
  let client;

  try {
    const testContext = {
      userId: "usr_std_02",
      conversationId: "conv_test_12345"
    };

    client = await connectMcpClient(testContext);
    assert.ok(client, "Cliente MCP deve ser instanciado e conectado");
    console.log("[OK] Conexao com Servidor MCP (http://localhost:3001/mcp) com contexto e headers de autenticacao");

    const { tools } = await client.listTools();
    assert.ok(Array.isArray(tools) && tools.length >= 3, "Deve listar pelo menos as 3 tools");
    
    const toolNames = tools.map((t) => t.name);
    assert.ok(toolNames.includes("listar_catalogo"), "Deve conter listar_catalogo");
    assert.ok(toolNames.includes("registrar_intencao"), "Deve conter registrar_intencao");
    assert.ok(toolNames.includes("realizar_compra"), "Deve conter realizar_compra");
    console.log("[OK] Descoberta das 3 ferramentas MCP");

    const ollamaTools = toOllamaTools(tools);
    assert.strictEqual(ollamaTools.length, tools.length);
    assert.strictEqual(ollamaTools[0].type, "function");
    assert.ok(ollamaTools[0].function.name.length > 0);
    assert.ok(typeof ollamaTools[0].function.parameters === "object");
    console.log("[OK] Conversao de schemas para formato Ollama Tools");

    const resultCatalog = await runMcpTool(client, {
      function: {
        name: "listar_catalogo",
        arguments: { categoria: "audio" }
      }
    });

    assert.ok(typeof resultCatalog === "object" && resultCatalog !== null);
    assert.ok("produtos" in (resultCatalog as Record<string, unknown>));
    console.log("[OK] Execucao remota da tool listar_catalogo via MCP Client");

    console.log("Iniciando testes de perfil de usuario MCP via endpoint interno...");
    const userProfile = await getMcpUserProfile("usr_std_02");
    assert.ok(userProfile, "getMcpUserProfile('usr_std_02') deve retornar dados do usuario");
    assert.strictEqual(userProfile.id, "usr_std_02");
    assert.ok(userProfile.username, "Perfil deve conter username");
    assert.ok(userProfile.name, "Perfil deve conter name");
    assert.ok(typeof userProfile.limite_total === "number", "limite_total deve ser number");
    assert.ok(typeof userProfile.limite_disponivel === "number", "limite_disponivel deve ser number");
    console.log(`[OK] Perfil obtido com sucesso para ${userProfile.name} (limite: R$ ${userProfile.limite_disponivel}/${userProfile.limite_total})`);

    const invalidProfile = await getMcpUserProfile("usr_inexistente_999");
    assert.strictEqual(invalidProfile, null, "getMcpUserProfile com usuario inexistente deve retornar null");
    console.log("[OK] Perfil de usuario inexistente retornou null como esperado");

    console.log("\nTodos os testes do MCP Client passaram com sucesso.");
  } catch (error) {
    console.error("\n[ERRO] Falha ao testar MCP Client:", error);
    console.log("Dica: Certifique-se de que o servidor mcp-tools esta rodando na porta 3001 (cd ../mcp-tools && npm run dev)");
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

runMcpTests();
