import { useState, type ReactNode } from 'react'
import { Header } from './Header'
import { UserPanel } from '../user/UserPanel'
import { Modal } from '../ui/Modal'
import { useConnection } from '../../hooks/useConnection'
import type { ToolEvent } from '../../types/tools'
export function AppShell({
  children,
  toolEvents,
}: {
  children: ReactNode
  toolEvents: ToolEvent[]
}) {
  const [profileOpen, setProfileOpen] = useState(false)
  const { connection, check } = useConnection()
  return (
    <div className="app-shell">
      <a href="#chat-message" className="skip-link">
        Ir para a mensagem
      </a>
      <Header onProfile={() => setProfileOpen(true)} profileOpen={profileOpen} />
      <div className="workspace">
        <main className="chat-main" id="main-content">
          {children}
        </main>
      </div>
      <Modal open={profileOpen} onClose={() => setProfileOpen(false)} title="Sua conta">
        <UserPanel connection={connection} toolEvents={toolEvents} onReconnect={check} />
      </Modal>
    </div>
  )
}
