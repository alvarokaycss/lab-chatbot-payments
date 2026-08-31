import { env } from '../config/env'
import type { SendChatOptions } from '../types/chat'
import { ApiError, OFFLINE_MESSAGE } from '../types/api'
import { checkResponse, requestSignal } from './apiClient'
import { consumeNdjson } from './ndjson'

export async function sendChatMessage({
  messages,
  token,
  onEvent,
  signal,
}: SendChatOptions): Promise<void> {
  let response: Response
  try {
    response = await fetch(`${env.apiUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/x-ndjson',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ messages }),
      signal: requestSignal(signal, 180000),
    })
  } catch (cause) {
    if (signal?.aborted || cause instanceof ApiError) throw cause
    throw new ApiError(OFFLINE_MESSAGE)
  }
  await checkResponse(response, true)
  if (!response.body)
    throw new ApiError('O servidor retornou uma resposta sem conteúdo de streaming.')
  if (!response.headers.get('Content-Type')?.includes('application/x-ndjson'))
    throw new ApiError('O backend deve responder com Content-Type application/x-ndjson.')
  await consumeNdjson(response.body, onEvent, signal)
}

