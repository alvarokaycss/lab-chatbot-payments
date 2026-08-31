import { AlertCircle, LogOut, ShieldCheck, Wallet } from 'lucide-react'
import { Brand } from '../ui/Brand'
import { Avatar } from '../ui/Avatar'
import { useAuth } from '../../hooks/useAuth'
import { formatCurrency } from '../../utils/currency'

export function Header({
  onProfile,
  profileOpen,
}: {
  onProfile: () => void
  profileOpen: boolean
}) {
  const { user, logout, error } = useAuth()
  const limit = user ? formatCurrency(user.limite_disponivel) : '—'

  return (
    <header className="app-header">
      <div className="header-brand">
        <Brand compact />
      </div>
      <div className="header-center">
        <span className="header-separator" />
      </div>
      <div className="header-actions">
        <span className="header-shield">
          <ShieldCheck size={15} />
          Sessão autenticada
        </span>
        <div className="header-user">
          <Avatar name={user?.name ?? ''} />
          <span>{user?.name}</span>
        </div>
        <button
          type="button"
          className={`header-balance ${error ? 'header-balance-warning' : ''}`}
          onClick={onProfile}
          aria-label={`${error ? 'Limite pode estar desatualizado. ' : ''}Limite disponível: ${limit}. Abrir detalhes da conta`}
          aria-haspopup="dialog"
          aria-expanded={profileOpen}
          title={
            error
              ? 'Limite pode estar desatualizado. Clique para atualizar na sua conta.'
              : 'Ver limite e detalhes da conta'
          }
        >
          <Wallet size={19} aria-hidden="true" />
          <span>
            <span className="header-balance-label">Limite disponível</span>
            <strong>{limit}</strong>
          </span>
          {error && <AlertCircle size={14} aria-hidden="true" />}
        </button>
        <button
          type="button"
          className="icon-button logout-button"
          onClick={logout}
          aria-label="Sair da conta"
          title="Sair da conta"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  )
}
