import { brand } from '../../config/brand'
import { useEffect, useRef, type KeyboardEvent } from 'react'
import { ArrowUp, CornerDownLeft, ShieldCheck, Sparkles, Square } from 'lucide-react'
export function ChatComposer({
  onSend,
  isStreaming,
  onCancel,
  draft,
  onDraftChange,
}: {
  onSend: (text: string) => void
  isStreaming: boolean
  onCancel: () => void
  draft: string
  onDraftChange: (text: string) => void
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = `${Math.min(ref.current.scrollHeight, 132)}px`
    }
  }, [draft])
  const send = () => {
    if (!draft.trim() || isStreaming) return
    onSend(draft.trim())
    onDraftChange('')
  }
  const keydown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      send()
    }
  }
  return (
    <>
      <form
        className={`chat-composer ${isStreaming ? 'streaming' : ''}`}
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
      >
        <label className="sr-only" htmlFor="chat-message">
          Mensagem para a {brand.displayName}
        </label>
        <Sparkles className="composer-sparkle" size={19} />
        <textarea
          ref={ref}
          rows={1}
          id="chat-message"
          placeholder="Qual vai ser o seu próximo upgrade?"
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={keydown}
          disabled={isStreaming}
          maxLength={12000}
        />
        {isStreaming ? (
          <button
            type="button"
            className="send-button cancel-button"
            onClick={onCancel}
            aria-label="Parar resposta"
          >
            <Square size={15} fill="currentColor" />
          </button>
        ) : (
          <button
            type="submit"
            className="send-button"
            disabled={!draft.trim()}
            aria-label="Enviar mensagem"
          >
            <ArrowUp size={21} />
          </button>
        )}
      </form>
      <div className="composer-footer">
        <span>
          <ShieldCheck size={11} /> Compras feitas com você no controle.
        </span>
        <span>
          <CornerDownLeft size={11} /> Enter para enviar{' '}
          <span className="composer-shift">· Shift + Enter para nova linha</span>
        </span>
      </div>
    </>
  )
}
