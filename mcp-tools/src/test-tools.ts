import assert from "node:assert/strict";
import "@dotenvx/dotenvx/config";
import {
  handleListCatalog,
  handleRegisterIntent,
  handleExecutePurchase
} from "./tools/index.js";
import { resetCatalogStore, findProductById } from "./db/catalog.js";
import { resetUsersStore, findUserById } from "./db/users.js";
import { resetIntentsStore, findIntentById } from "./db/intents.js";
import type { PurchaseSuccess, PurchaseError, ToolContext } from "./types.js";

function runTests() {
  resetCatalogStore();
  resetUsersStore();
  resetIntentsStore();

  const ctx1: ToolContext = {
    userId: "usr_std_02",
    conversationId: "conv_test_01"
  };

  // 1. listar_catalogo
  const catalogo = handleListCatalog({});
  assert.ok(catalogo.produtos.length > 0, "Catálogo não deve estar vazio");

  const audio = handleListCatalog({ categoria: "audio" });
  assert.strictEqual(audio.produtos.length, 1);
  assert.strictEqual(audio.produtos[0].id, "prod_003");
  console.log("[OK] listar_catalogo");

  // 2. registrar_intencao (retornando PublicIntent)
  const intencao = handleRegisterIntent(
    { produto_id: "prod_003", quantidade: 2 },
    ctx1
  );
  assert.ok("intencao_id" in intencao, "Deve retornar PublicIntent com intencao_id");
  assert.strictEqual(intencao.produto_id, "prod_003");
  assert.strictEqual(intencao.quantidade, 2);
  assert.strictEqual(intencao.valor_total, 499.80);
  assert.strictEqual(intencao.status, "pendente");
  assert.ok(intencao.expira_em, "Deve conter data de expiração");
  assert.strictEqual((intencao as any).user_id, undefined, "PublicIntent não deve expor user_id");
  assert.strictEqual((intencao as any).conversation_id, undefined, "PublicIntent não deve expor conversation_id");
  assert.strictEqual((intencao as any).created_at, undefined, "PublicIntent não deve expor created_at");
  console.log("[OK] registrar_intencao (retornando PublicIntent)");

  // 3. realizar_compra com PIX (sucesso, decremento de estoque e débito de limite)
  const compraPix = handleExecutePurchase(
    { intencao_id: intencao.intencao_id, metodo_pagamento: "pix" },
    ctx1
  );
  assert.strictEqual(compraPix.status, "aprovado");
  const pixSuccess = compraPix as PurchaseSuccess;
  assert.strictEqual(pixSuccess.metodo_pagamento, "pix");
  assert.strictEqual(pixSuccess.valor, 499.80);
  assert.strictEqual(pixSuccess.limite_restante, 1500.20);
  assert.ok(pixSuccess.transacao_id.startsWith("tx_"));

  const usuario = findUserById("usr_std_02");
  assert.strictEqual(usuario?.limite_disponivel, 1500.20, "Limite do usuário deve ser atualizado no DB");

  const produto3 = findProductById("prod_003");
  assert.strictEqual(produto3?.estoque, 18, "Estoque deve ser decrementado de 20 para 18");
  console.log("[OK] realizar_compra (PIX com baixa de estoque e débito de limite)");

  // 4. realizar_compra com Cartão (sucesso, decremento de estoque e débito de limite)
  const intencaoCard = handleRegisterIntent(
    { produto_id: "prod_005", quantidade: 1 },
    ctx1
  );
  assert.ok("intencao_id" in intencaoCard);
  const compraCard = handleExecutePurchase(
    { intencao_id: intencaoCard.intencao_id, metodo_pagamento: "cartao" },
    ctx1
  );
  assert.strictEqual(compraCard.status, "aprovado");
  const cardSuccess = compraCard as PurchaseSuccess;
  assert.strictEqual(cardSuccess.metodo_pagamento, "cartao");
  assert.strictEqual(cardSuccess.valor, 129.90);
  assert.strictEqual(cardSuccess.limite_restante, 1370.30);

  const produto5 = findProductById("prod_005");
  assert.strictEqual(produto5?.estoque, 24, "Estoque deve ser decrementado de 25 para 24");
  console.log("[OK] realizar_compra (Cartão com baixa de estoque e débito de limite)");

  // 5. Erro: INTENCAO_JA_PAGA
  const compraDuplicada = handleExecutePurchase(
    { intencao_id: intencao.intencao_id, metodo_pagamento: "pix" },
    ctx1
  );
  assert.strictEqual(compraDuplicada.status, "recusado");
  assert.strictEqual((compraDuplicada as PurchaseError).erro, "INTENCAO_JA_PAGA");
  assert.strictEqual(
    (compraDuplicada as PurchaseError).mensagem,
    "Esta intenção de compra já foi paga e concluída anteriormente."
  );
  console.log("[OK] Erro INTENCAO_JA_PAGA");

  // 6. Erro: INTENCAO_INVALIDA
  // 6a. ID inexistente
  const compraInexistente = handleExecutePurchase(
    { intencao_id: "int_inexistente_999", metodo_pagamento: "pix" },
    ctx1
  );
  assert.strictEqual(compraInexistente.status, "recusado");
  assert.strictEqual((compraInexistente as PurchaseError).erro, "INTENCAO_INVALIDA");
  assert.strictEqual(
    (compraInexistente as PurchaseError).mensagem,
    "Intenção de compra não encontrada ou inexistente."
  );

  // 6b. ID pertencente a outro usuário
  const intencaoParaOutroUsuario = handleRegisterIntent(
    { produto_id: "prod_004", quantidade: 1 },
    ctx1
  );
  assert.ok("intencao_id" in intencaoParaOutroUsuario);

  const ctxOtherUser: ToolContext = {
    userId: "usr_vip_01",
    conversationId: "conv_test_01"
  };
  const compraOutroUsuario = handleExecutePurchase(
    { intencao_id: intencaoParaOutroUsuario.intencao_id, metodo_pagamento: "pix" },
    ctxOtherUser
  );
  assert.strictEqual(compraOutroUsuario.status, "recusado");
  assert.strictEqual((compraOutroUsuario as PurchaseError).erro, "INTENCAO_INVALIDA");
  assert.strictEqual(
    (compraOutroUsuario as PurchaseError).mensagem,
    "Intenção de compra não pertence à sessão atual do usuário."
  );

  // 6c. ID pertencente a outra conversa
  const ctxOtherConv: ToolContext = {
    userId: "usr_std_02",
    conversationId: "conv_test_99"
  };
  const compraOutraConversa = handleExecutePurchase(
    { intencao_id: intencaoParaOutroUsuario.intencao_id, metodo_pagamento: "pix" },
    ctxOtherConv
  );
  assert.strictEqual(compraOutraConversa.status, "recusado");
  assert.strictEqual((compraOutraConversa as PurchaseError).erro, "INTENCAO_INVALIDA");
  assert.strictEqual(
    (compraOutraConversa as PurchaseError).mensagem,
    "Intenção de compra não pertence à sessão atual do usuário."
  );
  console.log("[OK] Erro INTENCAO_INVALIDA (inexistente, outro usuário e outra conversa)");

  // 7. Erro: LIMITE_EXCEDIDO
  const ctxLow: ToolContext = {
    userId: "usr_low_03",
    conversationId: "conv_low"
  };
  const intencaoCara = handleRegisterIntent(
    { produto_id: "prod_006", quantidade: 1 },
    ctxLow
  );
  assert.ok("intencao_id" in intencaoCara);
  const compraLimite = handleExecutePurchase(
    { intencao_id: intencaoCara.intencao_id, metodo_pagamento: "pix" },
    ctxLow
  );
  assert.strictEqual(compraLimite.status, "recusado");
  assert.strictEqual((compraLimite as PurchaseError).erro, "LIMITE_EXCEDIDO");
  assert.strictEqual(
    (compraLimite as PurchaseError).mensagem,
    "Saldo/limite de crédito insuficiente para concluir a compra."
  );
  console.log("[OK] Erro LIMITE_EXCEDIDO");

  // 8. Erro: METODO_INVALIDO
  const intencaoMetodo = handleRegisterIntent(
    { produto_id: "prod_007", quantidade: 1 },
    ctx1
  );
  assert.ok("intencao_id" in intencaoMetodo);
  const compraMetodoInvalido = handleExecutePurchase(
    { intencao_id: intencaoMetodo.intencao_id, metodo_pagamento: "boleto" },
    ctx1
  );
  assert.strictEqual(compraMetodoInvalido.status, "recusado");
  assert.strictEqual((compraMetodoInvalido as PurchaseError).erro, "METODO_INVALIDO");
  assert.strictEqual(
    (compraMetodoInvalido as PurchaseError).mensagem,
    "Método de pagamento inválido. Aceitos apenas 'cartao' ou 'pix'."
  );
  console.log("[OK] Erro METODO_INVALIDO");

  // 9. Erro: INTENCAO_EXPIRADA
  const intencaoParaExpirar = handleRegisterIntent(
    { produto_id: "prod_007", quantidade: 1 },
    ctx1
  );
  assert.ok("intencao_id" in intencaoParaExpirar);
  const storedIntent = findIntentById(intencaoParaExpirar.intencao_id);
  assert.ok(storedIntent);
  storedIntent.expira_em = new Date(Date.now() - 60000).toISOString();

  const compraExpirada = handleExecutePurchase(
    { intencao_id: intencaoParaExpirar.intencao_id, metodo_pagamento: "pix" },
    ctx1
  );
  assert.strictEqual(compraExpirada.status, "recusado");
  assert.strictEqual((compraExpirada as PurchaseError).erro, "INTENCAO_EXPIRADA");
  assert.strictEqual(
    (compraExpirada as PurchaseError).mensagem,
    "O prazo de validade desta intenção de compra expirou."
  );
  assert.strictEqual(storedIntent.status, "expirada");
  console.log("[OK] Erro INTENCAO_EXPIRADA");

  console.log("\nTodos os testes passaram com sucesso.");
}

runTests();
