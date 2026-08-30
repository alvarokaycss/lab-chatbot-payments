export interface Product {
  id: string
  nome: string
  preco: number
  moeda: string
  estoque: number
  categoria?: string
}
export type PaymentMethod = 'pix' | 'cartao'
export interface CatalogResult {
  produtos: Product[]
}
export interface PurchaseIntentResult {
  intencao_id: string
  produto_id: string
  quantidade: number
  valor_total: number
  moeda: string
  status: 'pendente'
  expira_em: string
}
export interface PurchaseApprovedResult {
  status: 'aprovado'
  transacao_id: string
  intencao_id: string
  valor: number
  metodo_pagamento: PaymentMethod
  limite_restante: number
  data: string
}
export interface PurchaseRejectedResult {
  status: 'recusado'
  codigo: string
  mensagem: string
}
export interface ToolEvent {
  name: string
  arguments: Record<string, unknown>
  result?: unknown
}
