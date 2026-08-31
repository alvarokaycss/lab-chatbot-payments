import { useCallback, useEffect, useRef, useState, type UIEvent } from 'react'
import type { ChatMessage } from '../types/chat'
import type { ToolEvent } from '../types/tools'
import { sendChatMessage } from '../services/chatService'
import { useAuth } from './useAuth'
import { useToast } from '../context/toast'
import { createMessageId } from '../utils/id'
import { isApproved } from '../utils/guards'
import { ApiError } from '../types/api'
const toolActivity: Record<string, string> = {
  listar_catalogo: 'Consultando catálogo',
  registrar_intencao: 'Registrando intenção de compra',
  realizar_compra: 'Processando pagamento',
}
export function useChat() {
  const { token, refreshUser, logout } = useAuth()
  const { notify } = useToast()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [toolEvents, setToolEvents] = useState<ToolEvent[]>([])
  const [isStreaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingTool, setPendingTool] = useState<string | null>(null)
  const [hasNewContent, setHasNewContent] = useState(false)
  const messageRef = useRef<ChatMessage[]>([])
  const streamRef = useRef<AbortController | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const pinned = useRef(true)
  const updateMessages = useCallback((next: ChatMessage[]) => {
    messageRef.current = next
    setMessages(next)
  }, [])
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    pinned.current = true
    setHasNewContent(false)
  }, [])
  useEffect(() => {
    if (pinned.current) scrollToBottom()
    else setHasNewContent(true)
  }, [messages, isStreaming, scrollToBottom])
  useEffect(
    () => () => {
      streamRef.current?.abort()
      streamRef.current = null
    },
    [],
  )
  const onScroll = (event: UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget
    pinned.current = element.scrollHeight - element.scrollTop - element.clientHeight < 100
    if (pinned.current) setHasNewContent(false)
  }
  const sendMessage = useCallback(
    async (text: string) => {
      if (!token || !text.trim() || streamRef.current) return
      const controller = new AbortController()
      streamRef.current = controller
      pinned.current = true
      const assistantId = createMessageId()
      const userMessage: ChatMessage = {
        id: createMessageId(),
        role: 'user',
        content: text.trim(),
        createdAt: new Date().toISOString(),
      }
      const history = [...messageRef.current, userMessage]
      updateMessages([
        ...history,
        { id: assistantId, role: 'assistant', content: '', createdAt: new Date().toISOString() },
      ])
      setError(null)
      setStreaming(true)
      setPendingTool(null)
      const current = () => streamRef.current === controller
      try {
        await sendChatMessage({
          messages: history
            .filter(
              (message) =>
                ['user', 'assistant'].includes(message.role) &&
                message.content &&
                !message.interrupted,
            )
            .map(({ role, content }) => ({ role, content })),
          token,
          signal: controller.signal,
          onEvent: (event) => {
            if (!current()) return
            if ('message' in event)
              updateMessages(
                messageRef.current.map((message) =>
                  message.id === assistantId
                    ? { ...message, content: message.content + event.message.content }
                    : message,
                ),
              )
            if ('tool' in event) {
              if (event.tool.result === undefined) {
                setPendingTool(toolActivity[event.tool.name] ?? 'Executando ação do agente')
                return
              }
              setPendingTool(null)
              setToolEvents((events) => [...events, event.tool])
              updateMessages([
                ...messageRef.current,
                {
                  id: createMessageId(),
                  role: 'tool',
                  content: '',
                  tool: event.tool,
                  createdAt: new Date().toISOString(),
                },
              ])
              if (event.tool.name === 'realizar_compra' && isApproved(event.tool.result))
                void refreshUser().catch(() =>
                  notify(
                    'Compra aprovada, mas não foi possível atualizar seu limite. Tente atualizar o perfil.',
                    'error',
                  ),
                )
            }
            if ('done' in event) setPendingTool(null)
          },
        })
      } catch (cause) {
        if (!current()) return
        updateMessages(
          messageRef.current.map((message) =>
            message.id === assistantId ? { ...message, interrupted: true } : message,
          ),
        )
        if (controller.signal.aborted)
          notify(
            'Resposta interrompida. Cancelar a leitura não desfaz ações já recebidas pelo backend.',
            'info',
          )
        else if (cause instanceof ApiError && cause.status === 401) logout()
        else {
          const message =
            cause instanceof Error ? cause.message : 'Não foi possível concluir a resposta.'
          setError(message)
          notify(message, 'error')
        }
      } finally {
        if (current()) {
          streamRef.current = null
          setStreaming(false)
          setPendingTool(null)
        }
      }
    },
    [token, refreshUser, logout, notify, updateMessages],
  )
  const cancelStream = useCallback(() => streamRef.current?.abort(), [])
  const clearChat = useCallback(() => {
    streamRef.current?.abort()
    streamRef.current = null
    updateMessages([])
    setToolEvents([])
    setError(null)
    setPendingTool(null)
    setStreaming(false)
    setHasNewContent(false)
    pinned.current = true
  }, [updateMessages])
  return {
    messages,
    toolEvents,
    isStreaming,
    error,
    pendingTool,
    hasNewContent,
    scrollRef,
    onScroll,
    scrollToBottom,
    sendMessage,
    cancelStream,
    clearChat,
    dismissError: () => setError(null),
  }
}
