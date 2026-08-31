import type { LoginRequest } from '../types/auth'
import { apiRequest } from './apiClient'
import { isLogin, isUser } from '../utils/guards'

export const authService = {
  async login(credentials: LoginRequest) {
    return apiRequest('/api/auth/login', { method: 'POST', body: credentials, validate: isLogin })
  },
  async me(token: string, signal?: AbortSignal) {
    return apiRequest('/api/user/me', { token, signal, validate: isUser })
  },
}

