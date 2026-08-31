import type { Product } from '../../types/tools'
import { ProductCard } from './ProductCard'
export function ProductGrid({
  products,
  onAsk,
  busy,
}: {
  products: Product[]
  onAsk: (text: string) => void
  busy?: boolean
}) {
  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAsk={onAsk} busy={busy} />
      ))}
    </div>
  )
}
