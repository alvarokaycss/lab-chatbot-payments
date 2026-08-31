import { useState } from 'react'
import { ArrowUpRight, Cpu, Gamepad2, Headphones, Keyboard, Monitor, Mouse } from 'lucide-react'
import type { Product } from '../../types/tools'
import { formatCurrency } from '../../utils/currency'

const categoryIcons = {
  jogos: Gamepad2,
  consoles: Gamepad2,
  hardware: Cpu,
  headsets: Headphones,
  moveis: Cpu,
  audio: Headphones,
  perifericos: Keyboard,
  teclados: Keyboard,
  mouses: Mouse,
  monitores: Monitor,
  cabos: Cpu,
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
  const [extIndex, setExtIndex] = useState(0)
  const [imageFailed, setImageFailed] = useState(false)
  const extensions = ['png', 'webp', 'jpg', 'svg']
  const Icon = categoryIcons[product.categoria as keyof typeof categoryIcons] ?? Cpu
  const imageSrc = `/products/${product.id}.${extensions[extIndex]}`

  const handleImageError = () => {
    if (extIndex < extensions.length - 1) {
      setExtIndex((prev) => prev + 1)
    } else {
      setImageFailed(true)
    }
  }

  return (
    <article className="product-card">
      <div className={`product-art product-art-${product.categoria ?? 'hardware'}`}>
        <span className="product-art-orbit" />
        {!imageFailed ? (
          <img
            src={imageSrc}
            alt={product.nome}
            className="product-image"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <>
            <Icon size={58} strokeWidth={1} />
            <small>IMAGEM ILUSTRATIVA</small>
          </>
        )}
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

