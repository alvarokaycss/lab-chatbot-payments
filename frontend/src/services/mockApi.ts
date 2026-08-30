import { mockUsers } from '../mocks/mockUsers'
import { mockChatEvents } from '../mocks/mockChat'
import type { LoginRequest, LoginResponse, UserProfile } from '../types/auth'
import type { RequestMessage } from '../types/chat'
import { ApiError } from '../types/api'
import { isApproved } from '../utils/guards'
const profiles = new Map<string, UserProfile>()
function pause(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Cancelado', 'AbortError'))
      return
    }
    const abort = () => {
      clearTimeout(timer)
      reject(new DOMException('Cancelado', 'AbortError'))
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', abort)
      resolve()
    }, ms)
    signal?.addEventListener('abort', abort, { once: true })
  })
}
function profileFromToken(token: string): UserProfile {
  const [prefix, username, expiry] = token.split(':')
  const fixture = mockUsers.find((user) => user.username === username)
  if (
    prefix !== 'nexus-demo' ||
    !fixture ||
    !Number.isFinite(Number(expiry)) ||
    Number(expiry) <= Date.now()
  )
    throw new ApiError('Sua sessão de demonstração expirou. Entre novamente.', 401)
  return { ...(profiles.get(token) ?? fixture) }
}
export const mockApi = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    await pause(450)
    const user = mockUsers.find((profile) => profile.username === credentials.username)
    if (!user || credentials.password !== '123')
      throw new ApiError('Credenciais inválidas. Verifique seu usuário e senha.', 401)
    const token = `nexus-demo:${user.username}:${Date.now() + 3600000}`
    profiles.set(token, { ...user })
    return { token, user: { ...user }, expiresIn: '1h' }
  },
  async me(token: string, signal?: AbortSignal) {
    await pause(100, signal)
    return profileFromToken(token)
  },
  async chat(messages: RequestMessage[], token: string, signal?: AbortSignal) {
    const profile = profileFromToken(token)
    const events = mockChatEvents(messages, profile)
    const encoder = new TextEncoder()
    let canceled = false
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for (const event of events) {
            await pause('tool' in event ? 350 : 40, signal)
            if (canceled) return
            if ('tool' in event && isApproved(event.tool.result))
              profiles.set(token, {
                ...profile,
                limite_disponivel: event.tool.result.limite_restante,
              })
            const bytes = encoder.encode(JSON.stringify(event) + '\n')
            // Divisão deliberada: testa o parser real inclusive no meio de UTF-8.
            const split = Math.max(1, Math.floor(bytes.length / 2))
            controller.enqueue(bytes.slice(0, split))
            controller.enqueue(bytes.slice(split))
          }
          if (!canceled) controller.close()
        } catch (cause) {
          if (!canceled) controller.error(cause)
        }
      },
      cancel() {
        canceled = true
      },
    })
    return new Response(stream, { headers: { 'Content-Type': 'application/x-ndjson' } })
  },
}
