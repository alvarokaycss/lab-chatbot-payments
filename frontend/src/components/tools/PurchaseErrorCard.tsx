import { ShieldX } from 'lucide-react'
import type { PurchaseRejectedResult } from '../../types/tools'
import { Badge } from '../ui/Badge'
export function PurchaseErrorCard({ result }: { result: PurchaseRejectedResult }) {
  return (
    <section className="transaction-card purchase-error" role="alert">
      <div className="transaction-heading">
        <span className="transaction-icon">
          <ShieldX size={23} />
        </span>
        <div>
          <h3>COMPRA NÃO REALIZADA</h3>
          <span>A solicitação de pagamento foi recusada.</span>
        </div>
        <Badge tone="danger">RECUSADA</Badge>
      </div>
      <p className="rejection-message">{result.mensagem}</p>
      <div className="rejection-code">
        <span>CÓDIGO DO RESULTADO</span>
        <code>{result.codigo || result.erro}</code>
      </div>
      <p className="muted">Converse com o agente para saber como continuar.</p>
    </section>
  )
}
