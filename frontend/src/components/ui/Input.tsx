import type { InputHTMLAttributes, ReactNode } from 'react'
interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon?: ReactNode
  suffix?: ReactNode
}
export function Input({ label, id, icon, suffix, ...props }: Props) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap">
        {icon}
        <input id={id} {...props} />
        {suffix}
      </div>
    </div>
  )
}
