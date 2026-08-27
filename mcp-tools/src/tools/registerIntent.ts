import { z } from "zod";
import type { Intent } from "../types.js";
import { findProductById } from "../db/catalog.js";
import { registerNewIntent } from "../db/intents.js";

export const registerIntentSchema = z.object({
  produto_id: z
    .string()
    .describe("ID do produto existente no catálogo (ex: 'prod_003')"),
  quantidade: z
    .number()
    .int()
    .positive()
    .describe("Quantidade desejada do produto (inteiro >= 1)")
});

export function handleRegisterIntent(
  args: z.infer<typeof registerIntentSchema>,
  userId?: string
): Intent | { error: string; mensagem: string } {
  const product = findProductById(args.produto_id);
  if (!product) {
    return {
      error: "PRODUTO_NAO_ENCONTRADO",
      mensagem: `O produto '${args.produto_id}' não foi encontrado no catálogo.`
    };
  }

  if (product.estoque < args.quantidade) {
    return {
      error: "ESTOQUE_INSUFICIENTE",
      mensagem: `Estoque insuficiente para o produto '${product.nome}'. Disponível: ${product.estoque}, Solicitado: ${args.quantidade}.`
    };
  }

  const valor_total = Number((product.preco * args.quantidade).toFixed(2));

  return registerNewIntent({
    produto_id: product.id,
    quantidade: args.quantidade,
    valor_total,
    user_id: userId,
    moeda: product.moeda
  });
}
