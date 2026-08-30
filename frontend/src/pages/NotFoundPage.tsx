import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
export function NotFoundPage() {
  return (
    <main className="not-found">
      <span className="eyebrow">FORA DO MAPA</span>
      <h1>404</h1>
      <h2>Este nível ainda não existe.</h2>
      <Link className="button button-primary" to="/">
        <ArrowLeft size={18} /> Voltar ao início
      </Link>
    </main>
  )
}
