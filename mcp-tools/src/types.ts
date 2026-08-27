/**
 * Contratos de tipos e interfaces do Servidor MCP de Pagamentos
 */

export interface Product {
  id: string;
  nome: string;
  preco: number;
  moeda: string;
  estoque: number;
  categoria?: string;
}

export interface CatalogListResult {
  produtos: Product[];
}

export type IntentStatus = "pendente" | "paga" | "expirada" | "recusada";

export interface Intent {
  intencao_id: string;
  user_id?: string;
  produto_id: string;
  quantidade: number;
  valor_total: number;
  moeda: string;
  status: IntentStatus;
  expira_em: string;
  created_at: string;
}

export type PaymentMethod = "cartao" | "pix";

export type PurchaseErrorCode =
  | "INTENCAO_INVALIDA"
  | "INTENCAO_EXPIRADA"
  | "INTENCAO_JA_PAGA"
  | "LIMITE_EXCEDIDO"
  | "METODO_INVALIDO";

export interface PurchaseSuccess {
  status: "aprovado";
  transacao_id: string;
  intencao_id: string;
  valor: number;
  metodo_pagamento: PaymentMethod;
  limite_restante: number;
  data: string;
}

export interface PurchaseError {
  status: "recusado";
  erro: PurchaseErrorCode;
  mensagem: string;
}

export type PurchaseResult = PurchaseSuccess | PurchaseError;

export interface User {
  id: string;
  username: string;
  name: string;
  password: string;
  limite_total: number;
  limite_disponivel: number;
}
