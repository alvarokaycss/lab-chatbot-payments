import { brand } from '../../config/brand'
import { Sparkles } from 'lucide-react'
import { ToolEventCard } from '../tools/ToolEventCard'
import { Avatar } from '../ui/Avatar'
import { useAuth } from '../../hooks/useAuth'
import type { ChatMessage } from '../../types/chat'
export function MessageBubble({
  message,
  onAsk,
  busy,
}: {
  message: ChatMessage
  onAsk: (text: string) => void
  busy: boolean
}) {
  const { user } = useAuth()
  if (message.role === 'tool' && message.tool)
    return (
      <div className="tool-message animate-in">
        <ToolEventCard event={message.tool} onAsk={onAsk} busy={busy} />
      </div>
    )
  if (!message.content) return null
  const isUser = message.role === 'user'
  return (
    <article
      className={`message ${isUser ? 'message-user' : 'message-assistant'} animate-in`}
      aria-label={isUser ? 'Sua mensagem' : `Resposta da ${brand.displayName}`}
    >
      {isUser ? (
        <Avatar name={user?.name ?? ''} />
      ) : (
        <div className="message-bot-avatar">
          <Sparkles size={17} />
        </div>
      )}
      <div className="message-body">
        <div className="message-label">
          {isUser ? 'Você' : brand.name}
          {!isUser && <span>ASSISTENTE IA</span>}
        </div>
        <div className="message-content">{message.content}</div>
        {message.interrupted && (
          <small className="interrupted-label">
            Resposta interrompida. O resultado de uma compra deve ser confirmado com o agente.
          </small>
        )}
      </div>
    </article>
  )
}
