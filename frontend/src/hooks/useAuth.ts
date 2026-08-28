import { useContext } from 'react'
import { AuthContext } from '../context/auth'
export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('AuthProvider ausente')
  return value
}
