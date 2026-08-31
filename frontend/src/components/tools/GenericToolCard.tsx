import { Braces } from 'lucide-react'
import type { ToolEvent } from '../../types/tools'
export function GenericToolCard({ event }: { event: ToolEvent }) {
  return (
    <details className="generic-tool">
      <summary>
        <Braces size={15} />
        <span>{event.name}</span>
        <small>Ver dados recebidos</small>
      </summary>
      <pre>{JSON.stringify(event.result ?? event.arguments, null, 2)}</pre>
    </details>
  )
}
