import type { ToolEvent } from './tools'
export type Role = 'user' | 'assistant' | 'system' | 'tool'
export interface ChatMessage {
  id: string
  role: Role
  content: string
  createdAt?: string
  tool?: ToolEvent
  interrupted?: boolean
}
export interface RequestMessage {
  role: Role
  content: string
}
export type ChatStreamEvent =
  | { message: { role: 'assistant'; content: string } }
  | { tool: ToolEvent }
  | { done: true }
  | { error: string }
export interface SendChatOptions {
  messages: RequestMessage[]
  token: string
  onEvent: (event: ChatStreamEvent) => void
  signal?: AbortSignal
}
