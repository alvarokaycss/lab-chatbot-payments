import assert from "node:assert/strict";
import "@dotenvx/dotenvx/config";
import { hashPassword, verifyPassword } from "../auth/password.js";
import {
  authenticateUser,
  findUserById,
  getUserProfile,
  deductUserBalance,
  resetUsersStore
} from "../auth/users.js";
import { generateToken, verifyToken } from "../auth/jwt.js";

function runTests() {
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

  console.log("\nTodos os testes de autenticacao passaram com sucesso.");
}

runTests();
