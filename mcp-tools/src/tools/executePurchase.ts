import { z } from "zod";
import { randomUUID } from "node:crypto";
import type { ToolContext, PurchaseResult, PaymentMethod } from "../types.js";
import { findProductById, decrementStock } from "../db/catalog.js";
import { hasSufficientLimit, deductUserLimit } from "../db/users.js";
import {
  findIntentById,
  isIntentExpired,
  updateIntentStatus
} from "../db/intents.js";

export const executePurchaseSchema = z.object({
  intencao_id: z
    .string()
    .describe("Identificador da intenção previamente gerada por registrar_intencao (ex: 'int_a1b2c3')"),
  metodo_pagamento: z
    .string()
    .describe("Método de pagamento escolhido pelo usuário ('cartao' ou 'pix')")
});

export function generateTransactionId(): string {
  const hash = randomUUID().replace(/-/g, "").substring(0, 8);
  return `tx_${hash}`;
}

export function handleExecutePurchase(
  args: z.infer<typeof executePurchaseSchema>,
  context: ToolContext = { userId: "usr_std_02", conversationId: "default_conv" }
): PurchaseResult {
  const intent = findIntentById(args.intencao_id);
  if (!intent) {
    return {
      status: "recusado",
      erro: "INTENCAO_INVALIDA",
      mensagem: "Intenção de compra não encontrada ou inexistente."
    };
  }

  if (
    intent.user_id !== context.userId ||
    intent.conversation_id !== context.conversationId
  ) {
    return {
      status: "recusado",
      erro: "INTENCAO_INVALIDA",
      mensagem: "Intenção de compra não pertence à sessão atual do usuário."
    };
  }

  if (intent.status === "paga") {
    return {
      status: "recusado",
      erro: "INTENCAO_JA_PAGA",
      mensagem: "Esta intenção de compra já foi paga e concluída anteriormente."
    };
  }

  if (isIntentExpired(intent) || intent.status === "expirada") {
    updateIntentStatus(intent.intencao_id, "expirada");
    return {
      status: "recusado",
      erro: "INTENCAO_EXPIRADA",
      mensagem: "O prazo de validade desta intenção de compra expirou."
    };
  }

  if (args.metodo_pagamento !== "cartao" && args.metodo_pagamento !== "pix") {
    return {
      status: "recusado",
      erro: "METODO_INVALIDO",
      mensagem: "Método de pagamento inválido. Aceitos apenas 'cartao' ou 'pix'."
    };
  }

  const product = findProductById(intent.produto_id);
  if (!product || product.estoque < intent.quantidade) {
    return {
      status: "recusado",
      erro: "INTENCAO_INVALIDA",
      mensagem: "Estoque insuficiente para liquidar esta compra no momento."
    };
  }

  if (!hasSufficientLimit(context.userId, intent.valor_total)) {
    return {
      status: "recusado",
      erro: "LIMITE_EXCEDIDO",
      mensagem: "Saldo/limite de crédito insuficiente para concluir a compra."
    };
  }

  decrementStock(intent.produto_id, intent.quantidade);
  const limite_restante = deductUserLimit(context.userId, intent.valor_total);
  updateIntentStatus(intent.intencao_id, "paga");

  return {
    status: "aprovado",
    transacao_id: generateTransactionId(),
    intencao_id: intent.intencao_id,
    valor: intent.valor_total,
    metodo_pagamento: args.metodo_pagamento as PaymentMethod,
    limite_restante: limite_restante as number,
    data: new Date().toISOString()
  };
}
