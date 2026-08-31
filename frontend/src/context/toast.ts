import { createContext, useContext } from 'react'
export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}
export const ToastContext = createContext<{
  toasts: Toast[]
  notify: (message: string, type?: Toast['type']) => void
  dismiss: (id: string) => void
} | null>(null)
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('ToastProvider ausente')
  return context
}
