import type { ReactNode } from 'react'
export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'orange' | 'yellow' | 'success' | 'danger'
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}
