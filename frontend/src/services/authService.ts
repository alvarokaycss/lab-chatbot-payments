import { env } from '../config/env'
import type { LoginRequest } from '../types/auth'
import { apiRequest } from './apiClient'
import { isLogin, isUser } from '../utils/guards'
export const authService = {
  mode: (env.useMocks ? 'demo' : 'api') as 'demo' | 'api',
  async login(credentials: LoginRequest) {
    if (env.useMocks) return (await import('./mockApi')).mockApi.login(credentials)
    return apiRequest('/api/auth/login', { method: 'POST', body: credentials, validate: isLogin })
  },
  async me(token: string, signal?: AbortSignal) {
    if (env.useMocks) return (await import('./mockApi')).mockApi.me(token, signal)
    return apiRequest('/api/user/me', { token, signal, validate: isUser })
  },
}
