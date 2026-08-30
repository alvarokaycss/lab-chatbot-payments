import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { sendChatMessage } from './chatService'
import { authService } from './authService'
import { env } from '../config/env'
import { AUTH_EXPIRED_EVENT, OFFLINE_MESSAGE } from '../types/api'
const options = {
  messages: [{ role: 'user' as const, content: 'O que vocês têm à venda?' }],
  token: 'backend-token',
  onEvent: vi.fn(),
}
const fetchMock = vi.fn()
beforeEach(() => {
  env.useMocks = false
  vi.stubGlobal('fetch', fetchMock)
  vi.stubGlobal('window', new EventTarget())
})
afterEach(() => {
  env.useMocks = true
  vi.unstubAllGlobals()
  vi.resetAllMocks()
})
describe('HTTP real sem fallback', () => {
  it('envia histórico e Bearer no POST /api/chat', async () => {
    fetchMock.mockResolvedValue(
      new Response('{"done":true}\n', { headers: { 'Content-Type': 'application/x-ndjson' } }),
    )
    await sendChatMessage(options)
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/chat',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer backend-token' }),
        body: JSON.stringify({ messages: options.messages }),
      }),
    )
  })
  it.each([400, 401, 500])('trata HTTP %s preservando a mensagem do backend', async (status) => {
    fetchMock.mockResolvedValue(new Response('{"error":"Mensagem do backend"}', { status }))
    await expect(sendChatMessage(options)).rejects.toMatchObject({
      status,
      message: 'Mensagem do backend',
    })
  })
  it('notifica expiração quando uma chamada autenticada retorna 401', async () => {
    const expired = vi.fn()
    window.addEventListener(AUTH_EXPIRED_EVENT, expired)
    fetchMock.mockResolvedValue(new Response('{}', { status: 401 }))
    await expect(authService.me('expired')).rejects.toMatchObject({ status: 401 })
    expect(expired).toHaveBeenCalledOnce()
  })
  it('reporta backend offline sem recorrer aos mocks', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    await expect(sendChatMessage(options)).rejects.toThrow(OFFLINE_MESSAGE)
    await expect(
      authService.login({ username: 'cliente_padrao', password: '123' }),
    ).rejects.toThrow(OFFLINE_MESSAGE)
  })
  it('trata resposta sem body', async () => {
    fetchMock.mockResolvedValue(
      new Response(null, { headers: { 'Content-Type': 'application/x-ndjson' } }),
    )
    await expect(sendChatMessage(options)).rejects.toThrow('sem conteúdo')
  })
  it('rejeita Content-Type incorreto', async () => {
    fetchMock.mockResolvedValue(
      new Response('{"done":true}', { headers: { 'Content-Type': 'application/json' } }),
    )
    await expect(sendChatMessage(options)).rejects.toThrow('application/x-ndjson')
  })
  it('valida perfil recebido para não exibir limite inválido', async () => {
    fetchMock.mockResolvedValue(new Response('{"name":"João","limite_disponivel":"2000"}'))
    await expect(authService.me('backend-token')).rejects.toThrow('formato inesperado')
  })
  it('envia contrato exato de login sem Bearer', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          token: 't',
          user: {
            id: 'u',
            username: 'cliente_padrao',
            name: 'João',
            limite_total: 2000,
            limite_disponivel: 1750.1,
          },
          expiresIn: '1h',
        }),
      ),
    )
    await authService.login({ username: 'cliente_padrao', password: '123' })
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        body: '{"username":"cliente_padrao","password":"123"}',
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  })
})
