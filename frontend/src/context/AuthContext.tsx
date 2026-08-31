import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { AuthContext } from './auth'
import { authService } from '../services/authService'
import { useToast } from './toast'
import { AUTH_EXPIRED_EVENT, ApiError } from '../types/api'
import type { LoginRequest, UserProfile } from '../types/auth'
const TOKEN_KEY = 'nexus_auth_token'
const USER_KEY = 'nexus_auth_user'
function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(readToken)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { notify } = useToast()
  const version = useRef(0)
  const clearSession = useCallback(() => {
    version.current++
    setToken(null)
    setUser(null)
    setError(null)
    setIsLoading(false)
    try {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    } catch {
      /* Memória continua utilizável. */
    }
  }, [])
  const saveUser = useCallback((profile: UserProfile) => {
    setUser(profile)
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(profile))
    } catch {
      /* Perfil permanece em memória. */
    }
  }, [])
  const refreshUser = useCallback(async () => {
    if (!token) return
    const current = version.current
    try {
      const profile = await authService.me(token)
      if (version.current !== current) return
      saveUser(profile)
      setError(null)
    } catch (cause) {
      if (version.current !== current) return
      if (cause instanceof ApiError && cause.status === 401) clearSession()
      else {
        const message =
          cause instanceof Error ? cause.message : 'Não foi possível atualizar o perfil.'
        setError(message)
        throw cause
      }
    }
  }, [token, clearSession, saveUser])
  useEffect(() => {
    let active = true
    const controller = new AbortController()
    if (!token) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    authService
      .me(token, controller.signal)
      .then((profile) => {
        if (active) {
          saveUser(profile)
          setError(null)
        }
      })
      .catch((cause: unknown) => {
        if (!active) return
        if (cause instanceof ApiError && cause.status === 401) {
          clearSession()
          notify('Sua sessão expirou. Entre novamente.', 'info')
        } else {
          const message = cause instanceof Error ? cause.message : 'Erro ao verificar sessão.'
          setError(message)
          notify(message, 'error')
        }
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
      controller.abort()
    }
  }, [token, clearSession, saveUser, notify])
  useEffect(() => {
    const expired = () => {
      clearSession()
      notify('Sua sessão expirou. Entre novamente.', 'info')
    }
    const sync = (event: StorageEvent) => {
      if (event.key === TOKEN_KEY) {
        version.current++
        setUser(null)
        setToken(event.newValue)
      }
    }
    window.addEventListener(AUTH_EXPIRED_EVENT, expired)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, expired)
      window.removeEventListener('storage', sync)
    }
  }, [clearSession, notify])
  const login = async (credentials: LoginRequest) => {
    const response = await authService.login(credentials)
    version.current++
    try {
      localStorage.setItem(TOKEN_KEY, response.token)
    } catch {
      notify('O navegador não permitiu salvar a sessão. Ela será mantida apenas nesta aba.', 'info')
    }
    setToken(response.token)
    saveUser(response.user)
    setError(null)
    notify(
      `Bem-vindo, ${response.user.name.split(' ')[0]}! Seu próximo nível começa aqui.`,
      'success',
    )
  }
  const logout = () => {
    clearSession()
    notify('Você saiu da sua conta.', 'info')
  }
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
