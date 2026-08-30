import type { ChatStreamEvent } from '../types/chat'
import { ApiError } from '../types/api'
import { isChatStreamEvent, isRecord } from '../utils/guards'
const MAX_BUFFER = 1024 * 1024
// A mesma instância de TextDecoder preserva caracteres UTF-8 partidos na rede.
export async function consumeNdjson(
  body: ReadableStream<Uint8Array>,
  onEvent: (event: ChatStreamEvent) => void,
  signal?: AbortSignal,
  idleTimeoutMs = 30000,
) {
  const reader = body.getReader()
  const decoder = new TextDecoder('utf-8', { fatal: true })
  let buffer = ''
  let done = false
  const parseLine = (line: string) => {
    if (!line.trim() || done) return
    let event: unknown
    try {
      event = JSON.parse(line)
    } catch {
      throw new ApiError('O servidor enviou JSON inválido durante a resposta.')
    }
    if (!isChatStreamEvent(event)) {
      if (isRecord(event) && !['message', 'tool', 'done', 'error'].some((key) => key in event))
        return // Extensões futuras não quebram o chat.
      throw new ApiError('O servidor enviou um evento de streaming inválido.')
    }
    if ('error' in event) throw new ApiError(event.error)
    if ('done' in event) done = true
    onEvent(event)
  }
  const read = async () => {
    let timer: ReturnType<typeof setTimeout> | undefined
    let onAbort: (() => void) | undefined
    const interrupted = new Promise<never>((_, reject) => {
      onAbort = () => reject(new DOMException('Resposta cancelada.', 'AbortError'))
      if (signal?.aborted) onAbort()
      else signal?.addEventListener('abort', onAbort, { once: true })
      timer = setTimeout(
        () =>
          reject(new ApiError('O servidor demorou para continuar a resposta. Tente novamente.')),
        idleTimeoutMs,
      )
    })
    try {
      return await Promise.race([reader.read(), interrupted])
    } finally {
      clearTimeout(timer)
      if (onAbort) signal?.removeEventListener('abort', onAbort)
    }
  }
  try {
    while (!done) {
      if (signal?.aborted) throw new DOMException('Resposta cancelada.', 'AbortError')
      const chunk = await read()
      if (chunk.done) {
        buffer += decoder.decode()
        if (buffer.trim()) parseLine(buffer)
        if (!done)
          throw new ApiError(
            'A conexão foi interrompida antes de concluir a resposta. Confirme o estado da compra com o agente antes de tentar pagar novamente.',
          )
        break
      }
      buffer += decoder.decode(chunk.value, { stream: true })
      let newline: number
      while ((newline = buffer.indexOf('\n')) !== -1 && !done) {
        const line = buffer.slice(0, newline)
        buffer = buffer.slice(newline + 1)
        if (line.length > MAX_BUFFER)
          throw new ApiError('O evento recebido excede o tamanho permitido.')
        parseLine(line)
      }
      if (!done && buffer.length > MAX_BUFFER)
        throw new ApiError('O evento recebido excede o tamanho permitido.')
    }
  } catch (cause) {
    if (cause instanceof TypeError && !signal?.aborted)
      throw new ApiError('O stream foi interrompido ou contém caracteres inválidos.')
    throw cause
  } finally {
    // Não aguarda cancel() de uma fonte remota que pode ter parado de responder.
    void reader.cancel().catch(() => undefined)
    reader.releaseLock()
  }
}
