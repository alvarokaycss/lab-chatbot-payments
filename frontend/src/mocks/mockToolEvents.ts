import type {
  PaymentMethod,
  Product,
  PurchaseApprovedResult,
  PurchaseIntentResult,
  PurchaseRejectedResult,
  ToolEvent,
} from '../types/tools'
export const mockErrors: Record<string, PurchaseRejectedResult> = {
  INTENCAO_INVALIDA: {
    status: 'recusado',
    codigo: 'INTENCAO_INVALIDA',
    mensagem:
      'Não foi encontrada uma intenção de compra válida. Solicite uma nova intenção antes de pagar.',
  },
  INTENCAO_EXPIRADA: {
    status: 'recusado',
    codigo: 'INTENCAO_EXPIRADA',
    mensagem: 'Esta intenção de compra expirou. Solicite uma nova intenção ao agente.',
  },
  INTENCAO_JA_PAGA: {
    status: 'recusado',
    codigo: 'INTENCAO_JA_PAGA',
    mensagem:
      'Esta intenção de compra já foi paga. Não é possível realizar um novo pagamento para ela.',
  },
  LIMITE_EXCEDIDO: {
    status: 'recusado',
    codigo: 'LIMITE_EXCEDIDO',
    mensagem:
      'Limite insuficiente. O valor desta compra excede o limite disponível para este perfil.',
  },
  METODO_INVALIDO: {
    status: 'recusado',
    codigo: 'METODO_INVALIDO',
    mensagem: 'O método de pagamento informado não é aceito. Escolha PIX ou cartão.',
  },
}
// Respostas financeiras fixas de cenários visuais; não constituem um motor financeiro.
const remainingFixtures: Record<string, number[]> = {
  cliente_vip: [
    11000.1, 14770.1, 14750.1, 14800.1, 14650.1, 14550.1, 14910.1, 13700.1, 14600.1, 14850.1,
    14700.1, 14750.1,
  ],
  cliente_padrao: [
    0, 1770.1, 1750.1, 1800.1, 1650.1, 1550.1, 1910.1, 700.1, 1600.1, 1850.1, 1700.1, 1750.1,
  ],
  cliente_sem_saldo: [0, 0, 0, 0, 0, 0, 10.1, 0, 0, 0, 0, 0],
}
export function intentFixture(product: Product): PurchaseIntentResult {
  return {
    intencao_id: `int_demo_${product.id}`,
    produto_id: product.id,
    quantidade: 1,
    valor_total: product.preco,
    moeda: product.moeda,
    status: 'pendente',
    expira_em: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  }
}
export function receiptFixture(
  product: Product,
  username: string,
  method: PaymentMethod,
): PurchaseApprovedResult {
  const index = Number(product.id.slice(-3)) - 1
  return {
    status: 'aprovado',
    transacao_id: `tx_demo_${method}_${product.id}`,
    intencao_id: `int_demo_${product.id}`,
    valor: product.preco,
    metodo_pagamento: method,
    limite_restante: remainingFixtures[username]?.[index] ?? 0,
    data: new Date().toISOString(),
  }
}
export const toolFixture = (
  name: string,
  result: unknown,
  args: Record<string, unknown> = {},
): ToolEvent => ({ name, arguments: args, result })
