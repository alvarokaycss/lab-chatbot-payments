import { LoaderCircle } from 'lucide-react'
export function Spinner({ label = 'Carregando' }: { label?: string }) {
  return (
    <span className="spinner" role="status">
      <LoaderCircle size={18} />
      <span className="sr-only">{label}</span>
    </span>
  )
}
