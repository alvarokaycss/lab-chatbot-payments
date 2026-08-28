import type { UserProfile, LoginResponse } from '../types/auth'
import type {
  CatalogResult,
  Product,
  PurchaseIntentResult,
  PurchaseApprovedResult,
  PurchaseRejectedResult,
  ToolEvent,
} from '../types/tools'
import type { ChatStreamEvent } from '../types/chat'
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)
const strings = (value: Record<string, unknown>, fields: string[]) =>
  fields.every((field) => typeof value[field] === 'string')
export function isUser(value: unknown): value is UserProfile {
  return (
    isRecord(value) &&
    strings(value, ['id', 'username', 'name']) &&
    isNumber(value.limite_total) &&
    isNumber(value.limite_disponivel)
  )
}
export function isLogin(value: unknown): value is LoginResponse {
  return (
    isRecord(value) &&
    typeof value.token === 'string' &&
    !!value.token &&
    typeof value.expiresIn === 'string' &&
    isUser(value.user)
  )
}
export function isProduct(value: unknown): value is Product {
  return (
    isRecord(value) &&
    strings(value, ['id', 'nome', 'moeda']) &&
    isNumber(value.preco) &&
    isNumber(value.estoque) &&
    (value.categoria === undefined || typeof value.categoria === 'string')
  )
}
export function isCatalog(value: unknown): value is CatalogResult {
  return isRecord(value) && Array.isArray(value.produtos) && value.produtos.every(isProduct)
}
export function isIntent(value: unknown): value is PurchaseIntentResult {
  return (
    isRecord(value) &&
    value.status === 'pendente' &&
    strings(value, ['intencao_id', 'produto_id', 'moeda', 'expira_em']) &&
    isNumber(value.quantidade) &&
    isNumber(value.valor_total)
  )
}
export function isApproved(value: unknown): value is PurchaseApprovedResult {
  return (
    isRecord(value) &&
    value.status === 'aprovado' &&
    strings(value, ['transacao_id', 'intencao_id', 'data']) &&
    ['pix', 'cartao'].includes(String(value.metodo_pagamento)) &&
    isNumber(value.valor) &&
    isNumber(value.limite_restante)
  )
}
export function isRejected(value: unknown): value is PurchaseRejectedResult {
  return isRecord(value) && value.status === 'recusado' && strings(value, ['codigo', 'mensagem'])
}
export function isToolEvent(value: unknown): value is ToolEvent {
  return isRecord(value) && typeof value.name === 'string' && isRecord(value.arguments)
}
export function isChatStreamEvent(value: unknown): value is ChatStreamEvent {
  if (!isRecord(value)) return false
  if (value.done === true) return true
  if (typeof value.error === 'string') return true
  if (isToolEvent(value.tool)) return true
  return (
    isRecord(value.message) &&
    value.message.role === 'assistant' &&
    typeof value.message.content === 'string'
  )
}
