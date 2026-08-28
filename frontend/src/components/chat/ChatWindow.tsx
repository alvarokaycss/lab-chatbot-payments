import { brand } from '../../config/brand'
import type { RefObject, UIEventHandler } from 'react'
import type { ChatMessage } from '../../types/chat'
import { EmptyChat } from './EmptyChat'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
export function ChatWindow({
  messages,
  isStreaming,
  pendingTool,
  onSend,
  onAsk,
  scrollRef,
  onScroll,
}: {
  messages: ChatMessage[]
  isStreaming: boolean
  pendingTool: string | null
  onSend: (text: string) => void
  onAsk: (text: string) => void
  scrollRef: RefObject<HTMLDivElement | null>
  onScroll: UIEventHandler<HTMLDivElement>
}) {
  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      className={`chat-window ${messages.length === 0 ? 'chat-window--empty' : ''}`}
      role="log"
      aria-label={`Conversa com a ${brand.displayName}`}
      aria-live="polite"
      aria-relevant="additions text"
    >
      {messages.length === 0 ? (
        <EmptyChat onSend={onSend} />
      ) : (
        <div className="message-list">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} onAsk={onAsk} busy={isStreaming} />
          ))}
          {isStreaming && (
            <TypingIndicator label={pendingTool ?? `${brand.displayName} está respondendo`} />
          )}
        </div>
      )}
    </div>
  )
}
