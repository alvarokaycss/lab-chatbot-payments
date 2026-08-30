import type { DemoProfile } from '../types/auth'
// Atalhos públicos de demonstração, nunca limites de autorização.
export const demoProfiles: DemoProfile[] = [
  { name: 'Maria Silva', label: 'VIP', limit: 15000, username: 'cliente_vip', password: '123' },
  { name: 'João Souza', label: 'Padrão', limit: 2000, username: 'cliente_padrao', password: '123' },
  {
    name: 'Carlos Lima',
    label: 'Limite reduzido',
    limit: 100,
    username: 'cliente_sem_saldo',
    password: '123',
  },
]
