import type { ButtonHTMLAttributes } from 'react'
import { Spinner } from './Spinner'
type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
  loading?: boolean
}
export function Button({
  children,
  variant = 'primary',
  loading,
  className = '',
  disabled,
  type = 'button',
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={`button button-${variant} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
}
