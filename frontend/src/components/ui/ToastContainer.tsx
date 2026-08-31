import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'
import { useToast } from '../../context/toast'
export function ToastContainer() {
  const { toasts, dismiss } = useToast()
  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          role={toast.type === 'error' ? 'alert' : 'status'}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 size={18} />
          ) : toast.type === 'error' ? (
            <TriangleAlert size={18} />
          ) : (
            <Info size={18} />
          )}
          <span>{toast.message}</span>
          <button
            type="button"
            className="icon-button"
            aria-label="Dispensar notificação"
            onClick={() => dismiss(toast.id)}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
