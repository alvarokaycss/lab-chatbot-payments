export type ConnectionStatus = 'checking' | 'online' | 'offline'
export interface HealthStatus {
  status: ConnectionStatus
  label: string
}
export class ApiError extends Error {
  readonly status: number
  constructor(message: string, status = 0) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}
export const OFFLINE_MESSAGE =
  'Não foi possível conectar ao servidor. Verifique se o backend está em execução.'
export const AUTH_EXPIRED_EVENT = 'nexus:auth-expired'
