import {
  Activity,
  ArrowUpRight,
  Check,
  ChevronRight,
  CreditCard,
  Fingerprint,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { formatCurrency } from '../../utils/currency'
import { Badge } from '../ui/Badge'
import type { HealthStatus } from '../../types/api'
import type { ToolEvent } from '../../types/tools'
const toolLabels: Record<string, string> = {
  listar_catalogo: 'Catálogo consultado',
  registrar_intencao: 'Intenção recebida',
  realizar_compra: 'Resultado do pagamento',
}
export function UserPanel({
  connection,
  toolEvents,
  onReconnect,
}: {
  connection: HealthStatus
  toolEvents: ToolEvent[]
  onReconnect: () => void
}) {
  const { user, error, refreshUser } = useAuth()
  if (!user) return null
  const percentage =
    user.limite_total > 0
      ? Math.min(100, Math.max(0, (user.limite_disponivel / user.limite_total) * 100))
      : 0
  return (
    <div className="user-panel">
      <div className="panel-title">
        <span>SUA CONTA</span>
        <Fingerprint size={16} />
      </div>
      <div className="user-greeting">
        <span>
          Olá, {user.name.split(' ')[0]} <span className="wave">✦</span>
        </span>
        <p>Pronto para o próximo upgrade?</p>
      </div>
      <div className="wallet-card">
        <div className="wallet-card-top">
          <span>
            <Wallet size={14} /> Seu limite disponível
          </span>
          <ArrowUpRight size={15} />
        </div>
        <strong className="limit-amount">{formatCurrency(user.limite_disponivel)}</strong>
        <div
          className="limit-progress"
          role="progressbar"
          aria-label="Percentual de limite disponível"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(percentage)}
        >
          <span style={{ width: `${percentage}%` }} />
        </div>
        <div className="limit-total">
          <span>Limite total</span>
          <strong>{formatCurrency(user.limite_total)}</strong>
        </div>
        <div className="wallet-footnote">
          <ShieldCheck size={11} />
          Informado pelo backend
        </div>
      </div>
      {error && (
        <div className="profile-warning" role="alert">
          Não foi possível atualizar o limite. O valor exibido pode estar desatualizado.
          <button type="button" onClick={() => void refreshUser().catch(() => undefined)}>
            <RefreshCw size={12} /> Atualizar perfil
          </button>
        </div>
      )}
      <div className="panel-info-title">DA DESCOBERTA AO SEU SETUP</div>
      <ol className="shopping-steps">
        <li>
          <span>01</span>
          <div>
            <strong>Encontre seu upgrade</strong>
            <p>Pergunte sobre jogos e tecnologia.</p>
          </div>
        </li>
        <li>
          <span>02</span>
          <div>
            <strong>Escolha pela conversa</strong>
            <p>O agente registra sua intenção.</p>
          </div>
        </li>
        <li>
          <span>03</span>
          <div>
            <strong>Confirme o pagamento</strong>
            <p>Escolha PIX ou cartão no chat.</p>
          </div>
        </li>
      </ol>
      <div className="payment-methods">
        <span>
          <span className="pix-mark">◇</span> PIX
        </span>
        <span>
          <CreditCard size={14} /> CARTÃO
        </span>
        <ShieldCheck size={15} />
      </div>
      <div className="activity-panel">
        <div className="panel-title">
          <span>ATIVIDADE DO AGENTE</span>
          <Activity size={14} />
        </div>
        {toolEvents.length ? (
          <ul>
            {toolEvents.slice(-3).map((tool, index) => (
              <li key={index}>
                <Check size={12} />
                <span>{toolLabels[tool.name] ?? tool.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="activity-empty">
            <Sparkles size={16} />
            <p>
              As ações do agente
              <br />
              aparecerão por aqui.
            </p>
          </div>
        )}
      </div>
      <div className="connection-card">
        <span>
          <span className={`status-dot ${connection.status === 'offline' ? 'offline-dot' : ''}`} />
          {connection.label}
        </span>
        <Badge tone="neutral">
          HTTP
        </Badge>
        <p>
          O frontend se comunica somente com o backend.
        </p>
        {connection.status === 'offline' && (
          <button type="button" onClick={onReconnect}>
            Verificar conexão <ChevronRight size={12} />
          </button>
        )}
      </div>
      <div className="panel-footer">
        <ShieldCheck size={13} />
        <span>
          Você conversa.
          <br />O agente cuida do resto.
        </span>
      </div>
    </div>
  )
}
