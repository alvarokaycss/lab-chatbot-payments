import { brand } from '../../config/brand'
export function TypingIndicator({
  label = `${brand.displayName} está pensando`,
}: {
  label?: string
}) {
  return (
    <div className="typing-indicator" role="status">
      <span />
      <span />
      <span />
      <small>{label}...</small>
    </div>
  )
}
