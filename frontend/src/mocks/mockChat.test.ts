import { describe, expect, it } from 'vitest'
import { mockChatEvents } from './mockChat'
import { mockUsers } from './mockUsers'
import { mockApi } from '../services/mockApi'
import { consumeNdjson } from '../services/ndjson'
import type { ChatStreamEvent, RequestMessage } from '../types/chat'
const history = (...contents: string[]): RequestMessage[] =>
  contents.map((content) => ({ role: 'user', content }))
const results = (events: ChatStreamEvent[]) =>
  events.flatMap((event) => ('tool' in event && event.tool.result ? [event.tool.result] : []))
describe('roteiros de demonstração', () => {
  it('login válido e credenciais inválidas', async () => {
    const response = await mockApi.login({ username: 'cliente_padrao', password: '123' })
    expect(response.user.username).toBe('cliente_padrao')
    expect(response).not.toHaveProperty('password')
    await expect(
      mockApi.login({ username: 'cliente_padrao', password: 'errada' }),
    ).rejects.toMatchObject({ status: 401 })
  })
  it('rejeita sessão expirada ou token de produção', async () => {
    await expect(mockApi.me('nexus-demo:cliente_padrao:1')).rejects.toMatchObject({ status: 401 })
    await expect(mockApi.me('jwt-real')).rejects.toMatchObject({ status: 401 })
  })
  it('catálogo e intenção do produto 3', () => {
    expect(
      results(mockChatEvents(history('O que vocês têm à venda?'), mockUsers[1]))[0],
    ).toHaveProperty('produtos')
    expect(
      results(mockChatEvents(history('Quero comprar o produto 3'), mockUsers[1]))[0],
    ).toMatchObject({ produto_id: 'prod_003', valor_total: 249.9, status: 'pendente' })
  })
  it.each(['pix', 'cartão'])('aprova fixture de %s', (method) => {
    const result = results(
      mockChatEvents(history('Quero comprar o produto 3', `Pode pagar no ${method}`), mockUsers[1]),
    )[0]
    expect(result).toMatchObject({ status: 'aprovado', limite_restante: 1750.1 })
  })
  it('retorna limite excedido para Carlos', () => {
    expect(
      results(
        mockChatEvents(history('Quero comprar o produto 3', 'Pode pagar no pix'), mockUsers[2]),
      )[0],
    ).toMatchObject({ codigo: 'LIMITE_EXCEDIDO' })
  })
  it.each([
    ['Pode pagar a int_falsa no pix', 'INTENCAO_INVALIDA'],
    ['intenção expirada', 'INTENCAO_EXPIRADA'],
    ['intenção já paga', 'INTENCAO_JA_PAGA'],
    ['boleto', 'METODO_INVALIDO'],
  ])('retorna %s', (text, code) => {
    expect(results(mockChatEvents(history(text), mockUsers[1]))[0]).toMatchObject({ codigo: code })
  })
  it('exige intenção e recusa segundo pagamento na mesma intenção', () => {
    expect(results(mockChatEvents(history('Pode pagar no pix'), mockUsers[1]))[0]).toMatchObject({
      codigo: 'INTENCAO_INVALIDA',
    })
    expect(
      results(
        mockChatEvents(
          history('Quero comprar o produto 3', 'Pode pagar no pix', 'Pode pagar no pix'),
          mockUsers[1],
        ),
      )[0],
    ).toMatchObject({ codigo: 'INTENCAO_JA_PAGA' })
  })
  it('stream mock passa pelo parser real e me retorna o limite recebido', async () => {
    const { token } = await mockApi.login({ username: 'cliente_padrao', password: '123' })
    const response = await mockApi.chat(
      history('Quero comprar o produto 3', 'Pode pagar no pix'),
      token,
    )
    const received: ChatStreamEvent[] = []
    await consumeNdjson(response.body!, (event) => received.push(event))
    expect(results(received)[0]).toMatchObject({ status: 'aprovado' })
    expect((await mockApi.me(token)).limite_disponivel).toBe(1750.1)
  })
})
