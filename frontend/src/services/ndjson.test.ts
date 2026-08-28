import { describe, expect, it, vi } from 'vitest'
import { consumeNdjson } from './ndjson'
import type { ChatStreamEvent } from '../types/chat'
const encoder = new TextEncoder()
function stream(text: string, chunkSize = 4096) {
  const bytes = encoder.encode(text)
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (let i = 0; i < bytes.length; i += chunkSize)
        controller.enqueue(bytes.slice(i, i + chunkSize))
      controller.close()
    },
  })
}
describe('consumeNdjson', () => {
  it('preserva UTF-8 e JSON divididos byte a byte e acumula tokens', async () => {
    const events: ChatStreamEvent[] = []
    const text =
      JSON.stringify({ message: { role: 'assistant', content: 'Olá, João 🎮 ' } }) +
      '\n' +
      JSON.stringify({ message: { role: 'assistant', content: 'seu cartão!' } }) +
      '\n{"done":true}\n'
    await consumeNdjson(stream(text, 1), (event) => events.push(event))
    expect(
      events
        .filter((event) => 'message' in event)
        .map((event) => ('message' in event ? event.message.content : ''))
        .join(''),
    ).toBe('Olá, João 🎮 seu cartão!')
    expect(events).toHaveLength(3)
  })
  it('aceita CRLF, linhas vazias e último evento sem newline', async () => {
    const events: ChatStreamEvent[] = []
    await consumeNdjson(
      stream('\r\n{"message":{"role":"assistant","content":"ok"}}\r\n\n{"done":true}'),
      (event) => events.push(event),
    )
    expect(events).toHaveLength(2)
  })
  it('encerra em done sem aguardar fechamento da conexão ou eventos posteriores', async () => {
    const onEvent = vi.fn()
    const cancel = vi.fn()
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          encoder.encode('{"done":true}\n{"message":{"role":"assistant","content":"ignorar"}}\n'),
        )
      },
      cancel,
    })
    await consumeNdjson(body, onEvent)
    expect(onEvent).toHaveBeenCalledExactlyOnceWith({ done: true })
    expect(cancel).toHaveBeenCalled()
  })
  it('preserva tools desconhecidas para o fallback genérico', async () => {
    const onEvent = vi.fn()
    await consumeNdjson(
      stream('{"tool":{"name":"futura","arguments":{},"result":{"ok":true}}}\n{"done":true}\n'),
      onEvent,
    )
    expect(onEvent.mock.calls[0][0]).toEqual({
      tool: { name: 'futura', arguments: {}, result: { ok: true } },
    })
  })
  it('ignora extensões de evento desconhecidas', async () => {
    const onEvent = vi.fn()
    await consumeNdjson(stream('{"heartbeat":true}\n{"done":true}\n'), onEvent)
    expect(onEvent).toHaveBeenCalledTimes(1)
  })
  it.each([
    '{invalido}\n',
    '{"message":{"role":"assistant","content":5}}\n',
    '{"tool":{"name":"x","arguments":null}}\n',
  ])('rejeita JSON/evento inválido: %s', async (value) => {
    await expect(consumeNdjson(stream(value), vi.fn())).rejects.toThrow(/inválido/)
  })
  it('trata um erro enviado pelo backend sem substituí-lo', async () => {
    await expect(
      consumeNdjson(stream('{"error":"Falha específica do agente"}\n'), vi.fn()),
    ).rejects.toThrow('Falha específica do agente')
  })
  it('identifica término prematuro e mantém tokens já recebidos', async () => {
    const onEvent = vi.fn()
    await expect(
      consumeNdjson(stream('{"message":{"role":"assistant","content":"parcial"}}\n'), onEvent),
    ).rejects.toThrow('interrompida')
    expect(onEvent).toHaveBeenCalledTimes(1)
  })
  it('interrompe leitura pendente com AbortController', async () => {
    const controller = new AbortController()
    const body = new ReadableStream<Uint8Array>()
    const promise = consumeNdjson(body, vi.fn(), controller.signal)
    controller.abort()
    await expect(promise).rejects.toMatchObject({ name: 'AbortError' })
    expect(body.locked).toBe(false)
  })
  it('aplica timeout de inatividade sem travar a UI', async () => {
    await expect(
      consumeNdjson(new ReadableStream<Uint8Array>(), vi.fn(), undefined, 5),
    ).rejects.toThrow('demorou')
  })
  it('rejeita linhas grandes demais', async () => {
    await expect(consumeNdjson(stream('x'.repeat(1024 * 1024 + 1)), vi.fn())).rejects.toThrow(
      'tamanho',
    )
  })
  it('trata falha de rede durante leitura', async () => {
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.error(new TypeError('network'))
      },
    })
    await expect(consumeNdjson(body, vi.fn())).rejects.toThrow('interrompido')
  })
})
