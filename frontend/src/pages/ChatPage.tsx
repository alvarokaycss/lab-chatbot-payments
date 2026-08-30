import { useState } from 'react'
import { AlertCircle, ArrowDown, Plus } from 'lucide-react'
import { AppShell } from '../components/layout/AppShell'
import { ChatWindow } from '../components/chat/ChatWindow'
import { ChatComposer } from '../components/chat/ChatComposer'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { useChat } from '../hooks/useChat'
export function ChatPage() {
  const chat = useChat()
  const [confirmClear, setConfirmClear] = useState(false)
  const [draft, setDraft] = useState('')
  const ask = (message: string) => {
    setDraft(message)
    requestAnimationFrame(() => document.getElementById('chat-message')?.focus())
  }
  const newChat = () => {
    if (chat.messages.length) setConfirmClear(true)
  }
  return (
    <AppShell toolEvents={chat.toolEvents}>
      <div className="conversation-topline">
        <span>
          <span className="status-dot" /> SEU ASSISTENTE DE COMPRAS
        </span>
        <Button
          variant="secondary"
          className="conversation-new-chat"
          onClick={newChat}
          disabled={chat.messages.length === 0}
        >
          <Plus size={15} aria-hidden="true" /> Nova conversa
        </Button>
      </div>
      <ChatWindow
        messages={chat.messages}
        isStreaming={chat.isStreaming}
        pendingTool={chat.pendingTool}
        onSend={chat.sendMessage}
        onAsk={ask}
        scrollRef={chat.scrollRef}
        onScroll={chat.onScroll}
      />
      {chat.hasNewContent && (
        <button type="button" className="scroll-to-bottom" onClick={chat.scrollToBottom}>
          <ArrowDown size={13} /> Novas mensagens
        </button>
      )}
      <div className="composer-area">
        {chat.error && (
          <div className="inline-error chat-error" role="alert">
            <AlertCircle size={16} />
            <span>{chat.error}</span>
            <button
              className="icon-button"
              type="button"
              onClick={chat.dismissError}
              aria-label="Dispensar erro"
            >
              ×
            </button>
          </div>
        )}
        <ChatComposer
          onSend={chat.sendMessage}
          isStreaming={chat.isStreaming}
          onCancel={chat.cancelStream}
          draft={draft}
          onDraftChange={setDraft}
        />
      </div>
      <Modal
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="Começar uma nova conversa?"
      >
        <p>
          O histórico desta conversa será limpo. Essa ação não desfaz compras nem cancela intenções
          registradas no backend.
        </p>
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => setConfirmClear(false)}>
            Continuar aqui
          </Button>
          <Button
            onClick={() => {
              chat.clearChat()
              setDraft('')
              setConfirmClear(false)
            }}
          >
            Nova conversa
          </Button>
        </div>
      </Modal>
    </AppShell>
  )
}
