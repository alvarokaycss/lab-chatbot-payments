import { brand } from '../../config/brand'
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand">
      <span className="brand-symbol" aria-hidden="true">
        {brand.name[0]}
        <span />
      </span>
      <span>
        <span className="brand-name">
          {brand.name}
          <span>{compact ? '' : ` ${brand.suffix}`}</span>
        </span>
        <span className="brand-subtitle">{compact ? 'Loja de Games' : brand.subtitle}</span>
      </span>
    </span>
  )
}
