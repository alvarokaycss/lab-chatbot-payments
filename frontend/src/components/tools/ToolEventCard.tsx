import type { ToolEvent } from '../../types/tools'
import { isApproved, isCatalog, isIntent, isRejected } from '../../utils/guards'
import { CatalogToolCard } from './CatalogToolCard'
import { PurchaseIntentCard } from './PurchaseIntentCard'
import { PurchaseReceiptCard } from './PurchaseReceiptCard'
import { PurchaseErrorCard } from './PurchaseErrorCard'
import { GenericToolCard } from './GenericToolCard'
export function ToolEventCard({
  event,
  onAsk,
  busy,
}: {
  event: ToolEvent
  onAsk: (text: string) => void
  busy?: boolean
}) {
  switch (event.name) {
    case 'listar_catalogo':
      if (isCatalog(event.result))
        return <CatalogToolCard result={event.result} onAsk={onAsk} busy={busy} />
      break
    case 'registrar_intencao':
      if (isIntent(event.result))
        return <PurchaseIntentCard result={event.result} onAsk={onAsk} busy={busy} />
      break
    case 'realizar_compra':
      if (isApproved(event.result)) return <PurchaseReceiptCard result={event.result} />
      if (isRejected(event.result)) return <PurchaseErrorCard result={event.result} />
      break
  }
  return <GenericToolCard event={event} />
}
