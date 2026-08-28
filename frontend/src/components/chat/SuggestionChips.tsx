import { ArrowUpRight, Gamepad2, Headphones, ShoppingBag, Wallet } from 'lucide-react'
const suggestions = [
  'O que vocês têm à venda?',
  'Quero ver os jogos disponíveis',
  'Tem algum headset gamer?',
  'Quero comprar um PlayStation 5',
  'Quais produtos cabem no meu limite?',
]
const icons = [ShoppingBag, Gamepad2, Headphones, Wallet]
export function SuggestionChips({
  onSend,
  disabled,
}: {
  onSend: (message: string) => void
  disabled?: boolean
}) {
  return (
    <div className="suggestion-grid">
      {[0, 1, 2, 4].map((index, position) => {
        const Icon = icons[position]
        return (
          <button
            type="button"
            className="suggestion-card"
            key={index}
            onClick={() => onSend(suggestions[index])}
            disabled={disabled}
          >
            <Icon size={17} />
            <span>{suggestions[index]}</span>
            <ArrowUpRight size={14} />
          </button>
        )
      })}
      <button
        className="console-suggestion"
        type="button"
        disabled={disabled}
        onClick={() => onSend(suggestions[3])}
      >
        Ou comece com: <strong>“Quero comprar um PlayStation 5”</strong>
        <ArrowUpRight size={12} />
      </button>
    </div>
  )
}
