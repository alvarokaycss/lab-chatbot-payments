import type { ChatStreamEvent, RequestMessage } from '../types/chat'
import type { Product, ToolEvent } from '../types/tools'
import type { UserProfile } from '../types/auth'
import { mockProducts } from './mockProducts'
import { intentFixture, mockErrors, receiptFixture, toolFixture } from './mockToolEvents'
const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
const textEvents = (text: string): ChatStreamEvent[] =>
  (text.match(/.{1,20}(?:\s|$)|.{1,20}/g) ?? [text]).map((content) => ({
    message: { role: 'assistant', content },
  }))
function withTool(text: string, tool: ToolEvent): ChatStreamEvent[] {
  return [
    ...textEvents(text),
    { tool: { name: tool.name, arguments: tool.arguments } },
    { tool },
    { done: true },
  ]
}
function findProduct(text: string): Product | undefined {
  const normalized = normalize(text)
  const number = normalized.match(/produto\s*0*(\d+)/)?.[1]
  return number
    ? mockProducts[Number(number) - 1]
    : (mockProducts.find((product) => normalized.includes(normalize(product.nome))) ??
        (normalized.includes('ps5') ? mockProducts[0] : undefined))
}
export function mockChatEvents(messages: RequestMessage[], user: UserProfile): ChatStreamEvent[] {
  const userMessages = messages.filter((message) => message.role === 'user')
  const last = normalize(userMessages[userMessages.length - 1]?.content ?? '')
  const reject = (code: string) =>
    withTool(
      'Recebi o resultado da solicitação de pagamento.',
      toolFixture('realizar_compra', mockErrors[code]),
    )
  if (last.includes('int_falsa') || last.includes('intencao invalida'))
    return reject('INTENCAO_INVALIDA')
  if (last.includes('intencao expirada')) return reject('INTENCAO_EXPIRADA')
  if (last.includes('intencao ja paga')) return reject('INTENCAO_JA_PAGA')
  if (last.includes('boleto') || last.includes('metodo invalido')) return reject('METODO_INVALIDO')
  if (/pagar|pagamento|pague|pode.*pix|pode.*cartao/.test(last)) {
    const buyIndex = userMessages.reduce(
      (found, message, index) =>
        /comprar|quero o|quero a/.test(normalize(message.content)) && !!findProduct(message.content)
          ? index
          : found,
      -1,
    )
    if (buyIndex === -1) return reject('INTENCAO_INVALIDA')
    const product = findProduct(userMessages[buyIndex].content)!
    if (user.username === 'cliente_sem_saldo' && product.id !== 'prod_007')
      return reject('LIMITE_EXCEDIDO')
    if (user.username === 'cliente_padrao' && product.id === 'prod_001')
      return reject('LIMITE_EXCEDIDO')
    const paidBefore = userMessages
      .slice(buyIndex + 1, -1)
      .some(
        (message) =>
          /pagar|pague/.test(normalize(message.content)) &&
          /pix|cartao/.test(normalize(message.content)) &&
          !/int_falsa|expirada|ja paga/.test(normalize(message.content)),
      )
    if (paidBefore) return reject('INTENCAO_JA_PAGA')
    if (!/pix|cartao/.test(last))
      return [
        ...textEvents(
          'Como você prefere pagar? Envie “Pode pagar no pix” ou “Pode pagar no cartão”.',
        ),
        { done: true },
      ]
    const method = last.includes('pix') ? 'pix' : 'cartao'
    return withTool(
      'Confira abaixo o resultado do seu pagamento de demonstração.',
      toolFixture('realizar_compra', receiptFixture(product, user.username, method), {
        intencao_id: `int_demo_${product.id}`,
        metodo_pagamento: method,
      }),
    )
  }
  const product = findProduct(last)
  if (product && /comprar|quero o|quero a/.test(last))
    return withTool(
      `Vamos de ${product.nome}! Confira a intenção abaixo e me diga se prefere PIX ou cartão.`,
      toolFixture('registrar_intencao', intentFixture(product), {
        produto_id: product.id,
        quantidade: 1,
      }),
    )
  let products = mockProducts
  if (last.includes('limite'))
    products = mockProducts.filter((item) => item.preco <= user.limite_disponivel)
  else if (last.includes('headset'))
    products = products.filter((item) => item.categoria === 'headsets')
  else if (last.includes('jogos') || last.includes('jogo'))
    products = products.filter((item) => item.categoria === 'jogos')
  else if (last.includes('hardware') || last.includes('consoles'))
    products = products.filter((item) => ['consoles', 'monitores'].includes(item.categoria ?? ''))
  else if (last.includes('acessorios'))
    products = products.filter((item) =>
      ['headsets', 'teclados', 'mouses', 'acessorios'].includes(item.categoria ?? ''),
    )
  else if (product) products = [product]
  else if (!/venda|catalogo|produtos|disponiv|opcoes|comprar|ver|ola|oi/.test(last))
    return [
      ...textEvents(
        'Posso ajudar você a explorar jogos e tecnologia. Experimente “O que vocês têm à venda?” ou “Quero comprar o produto 3”. Este é um roteiro de demonstração, sem IA ou cobranças reais.',
      ),
      { done: true },
    ]
  return withTool(
    'Claro! Separei estas opções para você. Me conte qual combina com o seu próximo upgrade.',
    toolFixture('listar_catalogo', { produtos: products }),
  )
}
