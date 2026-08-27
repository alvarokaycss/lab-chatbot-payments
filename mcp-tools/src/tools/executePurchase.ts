import { z } from "zod";
import { randomUUID } from "node:crypto";
import type { PurchaseResult } from "../types.js";
import { decrementStock } from "../db/catalog.js";
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
    .enum(["cartao", "pix"])
    .describe("Método de pagamento escolhido pelo usuário ('cartao' ou 'pix')")
});

export function handleExecutePurchase(
  args: z.infer<typeof executePurchaseSchema>,
  userId?: string
): PurchaseResult {
  const intent = findIntentById(args.intencao_id);
  if (!intent) {
    return {
      status: "recusado",
      erro: "INTENCAO_INVALIDA",
      mensagem: "A intenção de compra informada é inválida ou inexistente."
    };
  }

  if (userId && intent.user_id && intent.user_id !== userId) {
    return {
      status: "recusado",
      erro: "INTENCAO_INVALIDA",
      mensagem: "A intenção de compra não pertence ao usuário autenticado."
    };
  }

  if (intent.status === "paga") {
    return {
      status: "recusado",
      erro: "INTENCAO_JA_PAGA",
      mensagem: "Esta intenção de compra já foi paga anteriormente."
    };
  }

  if (isIntentExpired(intent)) {
    updateIntentStatus(intent.intencao_id, "expirada");
    return {
      status: "recusado",
      erro: "INTENCAO_EXPIRADA",
      mensagem: "Esta intenção de compra expirou. Por favor, solicite um novo registro de intenção."
    };
  }

  if (args.metodo_pagamento !== "cartao" && args.metodo_pagamento !== "pix") {
    return {
      status: "recusado",
      erro: "METODO_INVALIDO",
      mensagem: "Método de pagamento inválido. Aceitamos apenas 'cartao' ou 'pix'."
    };
  }

  const effectiveUserId = userId || intent.user_id || "usr_std_02";
  if (!hasSufficientLimit(effectiveUserId, intent.valor_total)) {
    return {
      status: "recusado",
      erro: "LIMITE_EXCEDIDO",
      mensagem: `Não foi possível realizar a compra. O valor total de R$ ${intent.valor_total.toFixed(2)} excede o limite disponível.`
    };
  }

  const limiteRestante = deductUserLimit(effectiveUserId, intent.valor_total);
  if (limiteRestante === false) {
    return {
      status: "recusado",
      erro: "LIMITE_EXCEDIDO",
      mensagem: "Falha ao debitar limite do usuário."
    };
  }

  decrementStock(intent.produto_id, intent.quantidade);
  updateIntentStatus(intent.intencao_id, "paga");

  const transacao_id = `tx_${randomUUID().replace(/-/g, "").substring(0, 8)}`;

  return {
    status: "aprovado",
    transacao_id,
    intencao_id: intent.intencao_id,
    valor: intent.valor_total,
    metodo_pagamento: args.metodo_pagamento,
    limite_restante: limiteRestante,
    data: new Date().toISOString()
  };
}
