import { brand } from '../../config/brand'
import { ShoppingBag } from 'lucide-react'
import type { CatalogResult } from '../../types/tools'
import { ProductGrid } from '../products/ProductGrid'
export function CatalogToolCard({
  result,
  onAsk,
  busy,
}: {
  result: CatalogResult
  onAsk: (text: string) => void
  busy?: boolean
}) {
  return (
    <section className="catalog-tool">
      <div className="tool-section-heading">
        <span>
          <ShoppingBag size={14} /> CATÁLOGO {brand.name}
        </span>
        <small>{result.produtos.length} produtos encontrados</small>
      </div>
      {result.produtos.length ? (
        <ProductGrid products={result.produtos} onAsk={onAsk} busy={busy} />
      ) : (
        <p className="muted">Nenhum produto retornado pelo catálogo.</p>
      )}
    </section>
  )
}
