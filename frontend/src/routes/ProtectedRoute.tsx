import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Spinner } from '../components/ui/Spinner'
import { Button } from '../components/ui/Button'
export function ProtectedRoute() {
  const { isAuthenticated, isLoading, error, token, refreshUser, logout } = useAuth()
  if (isLoading)
    return (
      <div className="full-loading">
        <Spinner label="Verificando sua sessão" />
        <p>Preparando seu próximo nível...</p>
      </div>
    )
  if (token && error && !isAuthenticated)
    return (
      <div className="full-loading">
        <p role="alert">{error}</p>
        <Button onClick={() => void refreshUser().catch(() => undefined)}>Tentar novamente</Button>
        <Button variant="ghost" onClick={logout}>
          Voltar ao login
        </Button>
      </div>
    )
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
