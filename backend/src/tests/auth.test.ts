import assert from "node:assert/strict";
import "@dotenvx/dotenvx/config";
import type { Server } from "node:http";
import { hashPassword, verifyPassword } from "../auth/password.js";
import {
  authenticateUser,
  findUserById,
  getUserProfile,
  deductUserBalance,
  resetUsersStore
} from "../auth/users.js";
import { generateToken, verifyToken } from "../auth/jwt.js";
import { app } from "../server.js";

async function runTests() {
  resetUsersStore();

  const hash = hashPassword("senha_teste");
  assert.ok(hash.includes(":"), "Hash deve conter salt:hash");
  assert.strictEqual(verifyPassword("senha_teste", hash), true);
  assert.strictEqual(verifyPassword("senha_incorreta", hash), false);
  console.log("[OK] Hashing e verificacao scrypt");

  const userVip = authenticateUser("cliente_vip", "123");
  assert.ok(userVip !== null);
  assert.strictEqual(userVip?.id, "usr_vip_01");
  assert.strictEqual(userVip?.limite_total, 15000.0);
  assert.strictEqual(userVip?.limite_disponivel, 15000.0);

  const authInvalida = authenticateUser("cliente_vip", "senha_errada");
  assert.strictEqual(authInvalida, null);

  const userInexistente = authenticateUser("nao_existe", "123");
  assert.strictEqual(userInexistente, null);

  const foundById = findUserById("usr_vip_01");
  assert.strictEqual(foundById?.username, "cliente_vip");
  console.log("[OK] Autenticacao de usuarios e perfis");

  const tokenData = generateToken({
    id: userVip!.id,
    username: userVip!.username,
    name: userVip!.name
  });
  assert.ok(typeof tokenData.token === "string" && tokenData.token.length > 0);
  assert.strictEqual(tokenData.expiresIn, "1h");

  const verified = verifyToken(tokenData.token);
  assert.ok(verified !== null);
  assert.strictEqual(verified?.id, "usr_vip_01");
  assert.strictEqual(verified?.username, "cliente_vip");

  const tokenInvalido = verifyToken("token.falso.invalido");
  assert.strictEqual(tokenInvalido, null);
  console.log("[OK] Emissao e verificacao de JWT");

  const novoSaldo = deductUserBalance("usr_vip_01", 500);
  assert.strictEqual(novoSaldo, 14500.0);
  const perfil = getUserProfile("usr_vip_01");
  assert.strictEqual(perfil?.limite_disponivel, 14500.0);

  const saldoInsuficiente = deductUserBalance("usr_vip_01", 20000);
  assert.strictEqual(saldoInsuficiente, false);
  console.log("[OK] Controle e debito de limites");

  // Testes HTTP das rotas de Auth
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, "127.0.0.1", () => resolve(s));
  });

  try {
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 3000;
    const baseUrl = `http://127.0.0.1:${port}`;

    // Teste 1: POST /api/auth/login sucesso
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "cliente_vip", password: "123" })
    });
    assert.strictEqual(loginRes.status, 200);
    const loginBody = await loginRes.json() as {
      token: string;
      user: { id: string; username: string; name: string; limite_total: number; limite_disponivel: number };
      expiresIn: string;
    };
    assert.ok(loginBody.token);
    assert.strictEqual(loginBody.user.id, "usr_vip_01");
    assert.strictEqual(loginBody.user.username, "cliente_vip");
    assert.ok(typeof loginBody.user.limite_total === "number");
    assert.ok(typeof loginBody.user.limite_disponivel === "number");
    console.log("[OK] Rota POST /api/auth/login com credenciais validas");

    // Teste 2: POST /api/auth/login credenciais invalidas
    const loginFailRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "cliente_vip", password: "wrong" })
    });
    assert.strictEqual(loginFailRes.status, 401);
    console.log("[OK] Rota POST /api/auth/login com senha errada retornando 401");

    // Teste 3: POST /api/auth/login payload incompleto
    const loginBadRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "cliente_vip" })
    });
    assert.strictEqual(loginBadRes.status, 400);
    console.log("[OK] Rota POST /api/auth/login com payload invalido retornando 400");

    // Teste 4: GET /api/auth/me autenticado
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${loginBody.token}` }
    });
    assert.strictEqual(meRes.status, 200);
    const meBody = await meRes.json() as {
      id: string;
      username: string;
      name: string;
      limite_total: number;
      limite_disponivel: number;
    };
    assert.strictEqual(meBody.id, "usr_vip_01");
    assert.strictEqual(meBody.username, "cliente_vip");
    assert.ok(typeof meBody.limite_total === "number");
    assert.ok(typeof meBody.limite_disponivel === "number");
    console.log("[OK] Rota GET /api/auth/me autenticado com JWT");

    // Teste 5: GET /api/auth/me sem token
    const meUnauthRes = await fetch(`${baseUrl}/api/auth/me`);
    assert.strictEqual(meUnauthRes.status, 401);
    console.log("[OK] Rota GET /api/auth/me sem token retornando 401");

    // Teste 6: GET /health
    const healthRes = await fetch(`${baseUrl}/health`);
    assert.strictEqual(healthRes.status, 200);
    const healthBody = await healthRes.json() as { status: string; service: string };
    assert.strictEqual(healthBody.status, "ok");
    assert.strictEqual(healthBody.service, "chatbot-backend");
    console.log("[OK] Rota GET /health");
  } finally {
    server.close();
  }

  console.log("\nTodos os testes de autenticacao passaram com sucesso.");
}

runTests();
