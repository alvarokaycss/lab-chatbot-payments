import type { UserProfile } from '../types/auth'
export const mockUsers: UserProfile[] = [
  {
    id: 'usr_vip_01',
    username: 'cliente_vip',
    name: 'Maria Silva',
    limite_total: 15000,
    limite_disponivel: 15000,
  },
  {
    id: 'usr_std_02',
    username: 'cliente_padrao',
    name: 'João Souza',
    limite_total: 2000,
    limite_disponivel: 2000,
  },
  {
    id: 'usr_low_03',
    username: 'cliente_sem_saldo',
    name: 'Carlos Lima',
    limite_total: 100,
    limite_disponivel: 100,
  },
]
