import { createContext } from 'react'
import type { LoginRequest, UserProfile } from '../types/auth'
export interface AuthState {
  user: UserProfile | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  mode: 'demo' | 'api'
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}
export const AuthContext = createContext<AuthState | null>(null)
