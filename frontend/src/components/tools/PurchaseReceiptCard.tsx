import { brand } from '../../config/brand'
import { Check, CheckCircle2, ShieldCheck } from 'lucide-react'
import type { PurchaseApprovedResult } from '../../types/tools'
import { formatCurrency } from '../../utils/currency'
import { formatDateTime } from '../../utils/date'
import { Badge } from '../ui/Badge'
export function PurchaseReceiptCard({ result }: { result: PurchaseApprovedResult }) {
  return (
    <section className="transaction-card receipt-card">
      <div className="transaction-heading">
        <span className="transaction-icon">
          <CheckCircle2 size={22} />
        </span>
        <div>
          <h3>COMPRA APROVADA</h3>
          <span>Upgrade confirmado. Agora é dar play.</span>
        </div>
        <Badge tone="success">
          <Check size={10} /> APROVADO
        </Badge>
      </div>
      <div className="receipt-amount">
        <span>Valor da compra</span>
        <strong>{formatCurrency(result.valor)}</strong>
        <span className="receipt-method">
          {result.metodo_pagamento === 'pix' ? '◇ PIX' : 'CARTÃO'}
        </span>
      </div>
      <dl className="transaction-details">
        <div>
          <dt>Transaction ID</dt>
          <dd>
            <code>{result.transacao_id}</code>
          </dd>
        </div>
        <div>
          <dt>Intent ID</dt>
          <dd>
            <code>{result.intencao_id}</code>
          </dd>
        </div>
        <div>
          <dt>Data / hora</dt>
          <dd>{formatDateTime(result.data)}</dd>
        </div>
        <div>
          <dt>Limite restante informado</dt>
          <dd>{formatCurrency(result.limite_restante)}</dd>
        </div>
      </dl>
      <div className="receipt-footer">
        <ShieldCheck size={14} />
        <span>Comprovante do resultado recebido pelo agente</span>
        <span>{brand.name}</span>
      </div>
    </section>
  )
}
