import { ArrowUpRight, Cpu, Gamepad2, Headphones, Keyboard, Monitor, Mouse } from 'lucide-react'
import type { Product } from '../../types/tools'
import { formatCurrency } from '../../utils/currency'
const categoryIcons = {
  jogos: Gamepad2,
  consoles: Gamepad2,
  hardware: Cpu,
  headsets: Headphones,
  teclados: Keyboard,
  mouses: Mouse,
  monitores: Monitor,
  acessorios: Headphones,
}
export function ProductCard({
  product,
  onAsk,
  busy,
}: {
  product: Product
  onAsk: (text: string) => void
  busy?: boolean
}) {
  const Icon = categoryIcons[product.categoria as keyof typeof categoryIcons] ?? Cpu
  return (
    <article className="product-card">
      <div className={`product-art product-art-${product.categoria ?? 'hardware'}`}>
        <span className="product-art-orbit" />
        <Icon size={58} strokeWidth={1} />
        <small>IMAGEM ILUSTRATIVA</small>
        <span className="product-stock">
          {product.estoque > 0 ? `${product.estoque} em estoque` : 'Sem estoque'}
        </span>
      </div>
      <div className="product-info">
        <span className="product-category">{product.categoria ?? 'Tecnologia'}</span>
        <h3>{product.nome}</h3>
        <strong className="product-price">{formatCurrency(product.preco, product.moeda)}</strong>
        <small className="product-id">{product.id}</small>
        <button
          type="button"
          disabled={busy}
          onClick={() => onAsk(`Quero comprar o ${product.nome}`)}
        >
          Perguntar sobre este item <ArrowUpRight size={13} />
        </button>
      </div>
    </article>
  )
}
