import { useCallback, useEffect, useRef, useState } from 'react'
import type { HealthStatus } from '../types/api'
import { checkHealth } from '../services/healthService'
import { useToast } from '../context/toast'
import { OFFLINE_MESSAGE } from '../types/api'
export function useConnection() {
  const [connection, setConnection] = useState<HealthStatus>({
    status: 'checking',
    label: 'Verificando conexão',
  })
  const controller = useRef<AbortController | null>(null)
  const { notify } = useToast()
  const check = useCallback(async () => {
    controller.current?.abort()
    const current = new AbortController()
    controller.current = current
    setConnection({ status: 'checking', label: 'Verificando conexão' })
    const status = await checkHealth(current.signal)
    if (current.signal.aborted) return
    setConnection(status)
    if (status.status === 'offline') notify(OFFLINE_MESSAGE, 'error')
  }, [notify])
  useEffect(() => {
    void check()
    return () => controller.current?.abort()
  }, [check])
  return { connection, check }
}
