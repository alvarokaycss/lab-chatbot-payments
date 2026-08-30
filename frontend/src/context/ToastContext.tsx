import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { ToastContext, type Toast } from './toast'
import { createMessageId } from '../utils/id'
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const dismiss = useCallback(
    (id: string) => setToasts((current) => current.filter((toast) => toast.id !== id)),
    [],
  )
  const notify = useCallback(
    (message: string, type: Toast['type'] = 'info') => {
      const id = createMessageId()
      setToasts((current) => [...current.slice(-3), { id, message, type }])
      timers.current.push(setTimeout(() => dismiss(id), 6000))
    },
    [dismiss],
  )
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  return (
    <ToastContext.Provider value={{ toasts, notify, dismiss }}>{children}</ToastContext.Provider>
  )
}
