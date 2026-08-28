import { Sparkles } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { SuggestionChips } from './SuggestionChips'
export function EmptyChat({ onSend }: { onSend: (message: string) => void }) {
  const { user } = useAuth()
  return (
    <div className="empty-chat animate-in">
      <div className="empty-intro">
        <div className="assistant-emblem">
          <Sparkles size={27} />
          <span />
        </div>
        <h1>
          Olá, {user?.name.split(' ')[0]}.<br />O que vamos comprar hoje?
        </h1>
        <p>Converse comigo para encontrar jogos, consoles e acessórios.</p>
      </div>
      <div className="suggestions-title">
        UM PONTO DE PARTIDA <span />
      </div>
      <SuggestionChips onSend={onSend} />
    </div>
  )
}
