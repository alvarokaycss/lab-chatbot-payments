import { env } from '../config/env'
import type { HealthStatus } from '../types/api'
import { requestSignal } from './apiClient'

export async function checkHealth(signal?: AbortSignal): Promise<HealthStatus> {
  try {
    const response = await fetch(`${env.apiUrl}/health`, { signal: requestSignal(signal, 7000) })
    return response.ok
      ? { status: 'online', label: 'Backend disponível' }
      : { status: 'offline', label: 'Backend indisponível' }
  } catch {
    return { status: 'offline', label: 'Backend indisponível' }
  }
}

