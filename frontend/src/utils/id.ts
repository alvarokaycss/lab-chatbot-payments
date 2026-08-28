export function createMessageId() {
  return (
    globalThis.crypto?.randomUUID?.() ?? `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`
  )
}
