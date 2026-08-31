import { Clock3, CreditCard, FileCheck2 } from 'lucide-react'
import type { PurchaseIntentResult } from '../../types/tools'
import { formatCurrency } from '../../utils/currency'
import { formatDateTime } from '../../utils/date'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
export function PurchaseIntentCard({
  result,
  onAsk,
  busy,
}: {
  result: PurchaseIntentResult
  onAsk: (text: string) => void
  busy?: boolean
}) {
  return (
    <section className="transaction-card intent-card">
      <div className="transaction-heading">
        <span className="transaction-icon">
          <FileCheck2 size={21} />
        </span>
        <div>
          <h3>INTENÇÃO DE COMPRA</h3>
          <span>Confira os dados da intenção recebida.</span>
        </div>
        <Badge tone="yellow">PENDENTE</Badge>
      </div>
      <div className="intent-status">
        <Clock3 size={13} /> Aguardando pagamento
      </div>
      <dl className="transaction-details">
        <div>
          <dt>Produto ID</dt>
          <dd>{result.produto_id}</dd>
        </div>
        <div>
          <dt>Quantidade</dt>
          <dd>{result.quantidade}</dd>
        </div>
        <div>
          <dt>Valor total</dt>
          <dd className="detail-amount">{formatCurrency(result.valor_total, result.moeda)}</dd>
        </div>
        <div>
          <dt>Expira em</dt>
          <dd>{formatDateTime(result.expira_em)}</dd>
        </div>
      </dl>
      <div className="payment-options">
        <Button variant="secondary" disabled={busy} onClick={() => onAsk('Pode pagar no pix')}>
          <span className="pix-mark" aria-hidden="true">
            ◇
          </span>{' '}
          Pagar com PIX
        </Button>
        <Button variant="secondary" disabled={busy} onClick={() => onAsk('Pode pagar no cartão')}>
          <CreditCard size={15} /> Pagar com cartão
        </Button>
      </div>
      <p className="payment-note">
        Os botões preenchem uma mensagem. Envie para solicitar ao agente.
      </p>
      <div className="transaction-reference">
        INTENT ID <code>{result.intencao_id}</code>
      </div>
    </section>
  )
}
