import assert from "node:assert/strict";
import "@dotenvx/dotenvx/config";
import {
  handleListCatalog,
  handleRegisterIntent,
  handleExecutePurchase
} from "./tools/index.js";
import { resetCatalogStore, findProductById } from "./db/catalog.js";
import { resetUsersStore, findUserById } from "./db/users.js";
import { resetIntentsStore } from "./db/intents.js";
import type { PurchaseSuccess, PurchaseError } from "./types.js";

function runTests() {
  resetCatalogStore();
  resetUsersStore();
  resetIntentsStore();

  // listar_catalogo
  const catalogo = handleListCatalog({});
  assert.ok(catalogo.produtos.length > 0, "Catálogo não deve estar vazio");
  
  const audio = handleListCatalog({ categoria: "audio" });
  assert.strictEqual(audio.produtos.length, 1);
  assert.strictEqual(audio.produtos[0].id, "prod_003");
  console.log("[OK] listar_catalogo");

  // registrar_intencao
  const intencao = handleRegisterIntent(
    { produto_id: "prod_003", quantidade: 2 },
    "usr_std_02"
  );
  assert.ok("intencao_id" in intencao);
  assert.strictEqual(intencao.valor_total, 499.80);
  assert.strictEqual(intencao.status, "pendente");
  console.log("[OK] registrar_intencao");

  // realizar_compra com PIX (sucesso)
  const compraPix = handleExecutePurchase(
    { intencao_id: intencao.intencao_id, metodo_pagamento: "pix" },
    "usr_std_02"
  );
  assert.strictEqual(compraPix.status, "aprovado");
  const pixSuccess = compraPix as PurchaseSuccess;
  assert.strictEqual(pixSuccess.metodo_pagamento, "pix");
  assert.strictEqual(pixSuccess.limite_restante, 1500.20);
  
  const usuario = findUserById("usr_std_02");
  assert.strictEqual(usuario?.limite_disponivel, 1500.20);

  const produto = findProductById("prod_003");
  assert.strictEqual(produto?.estoque, 18);
  console.log("[OK] realizar_compra (PIX)");

  // realizar_compra com Cartao (sucesso)
  const intencaoCard = handleRegisterIntent(
    { produto_id: "prod_005", quantidade: 1 },
    "usr_std_02"
  );
  assert.ok("intencao_id" in intencaoCard);
  const compraCard = handleExecutePurchase(
    { intencao_id: intencaoCard.intencao_id, metodo_pagamento: "cartao" },
    "usr_std_02"
  );
  assert.strictEqual(compraCard.status, "aprovado");
  console.log("[OK] realizar_compra (Cartão)");

  // Erro: INTENCAO_JA_PAGA
  const compraDuplicada = handleExecutePurchase(
    { intencao_id: intencao.intencao_id, metodo_pagamento: "pix" },
    "usr_std_02"
  );
  assert.strictEqual(compraDuplicada.status, "recusado");
  assert.strictEqual((compraDuplicada as PurchaseError).erro, "INTENCAO_JA_PAGA");
  console.log("[OK] Erro INTENCAO_JA_PAGA");

  // Erro: INTENCAO_INVALIDA
  const compraInvalida = handleExecutePurchase(
    { intencao_id: "int_falsa_123", metodo_pagamento: "pix" },
    "usr_std_02"
  );
  assert.strictEqual(compraInvalida.status, "recusado");
  assert.strictEqual((compraInvalida as PurchaseError).erro, "INTENCAO_INVALIDA");
  console.log("[OK] Erro INTENCAO_INVALIDA");

  // Erro: LIMITE_EXCEDIDO
  const intencaoCara = handleRegisterIntent(
    { produto_id: "prod_006", quantidade: 1 },
    "usr_low_03"
  );
  assert.ok("intencao_id" in intencaoCara);
  const compraLimite = handleExecutePurchase(
    { intencao_id: intencaoCara.intencao_id, metodo_pagamento: "pix" },
    "usr_low_03"
  );
  assert.strictEqual(compraLimite.status, "recusado");
  assert.strictEqual((compraLimite as PurchaseError).erro, "LIMITE_EXCEDIDO");
  console.log("[OK] Erro LIMITE_EXCEDIDO");

  console.log("\nTodos os testes passaram com sucesso.");
}

runTests();
