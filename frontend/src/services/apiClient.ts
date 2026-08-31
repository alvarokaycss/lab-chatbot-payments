import { env } from '../config/env'
import { ApiError, AUTH_EXPIRED_EVENT, OFFLINE_MESSAGE } from '../types/api'
import { isRecord } from '../utils/guards'
export async function checkResponse(response: Response, authenticated = false) {
  if (response.ok) return
  let message =
    response.status === 401
      ? 'Sua sessão expirou. Entre novamente.'
      : response.status === 400
        ? 'O servidor não aceitou a solicitação.'
        : response.status >= 500
          ? 'O servidor encontrou um erro. Tente novamente em instantes.'
          : `Falha na solicitação (HTTP ${response.status}).`
  try {
    const body: unknown = await response.json()
    if (isRecord(body) && typeof body.error === 'string') message = body.error
  } catch {
    /* A resposta de erro pode não conter JSON. */
  }
  if (response.status === 401 && authenticated) window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
  throw new ApiError(message, response.status)
}
export function requestSignal(signal?: AbortSignal, timeout = 15000) {
  const deadline = AbortSignal.timeout(timeout)
  return signal ? AbortSignal.any([signal, deadline]) : deadline
}
export async function apiRequest<T>(
  path: string,
  options: {
    method?: string
    body?: unknown
    token?: string
    signal?: AbortSignal
    validate: (value: unknown) => value is T
  },
): Promise<T> {
  try {
    const response = await fetch(`${env.apiUrl}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: requestSignal(options.signal),
    })
    await checkResponse(response, !!options.token)
    const data: unknown = await response.json()
    if (!options.validate(data))
      throw new ApiError('O servidor retornou dados em um formato inesperado.', response.status)
    return data
  } catch (cause) {
    if (cause instanceof ApiError || options.signal?.aborted) throw cause
    if (cause instanceof SyntaxError) throw new ApiError('O servidor retornou um JSON inválido.')
    throw new ApiError(OFFLINE_MESSAGE)
  }
}
