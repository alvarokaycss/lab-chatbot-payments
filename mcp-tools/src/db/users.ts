import type { User } from "../types.js";

/**
 * Perfis de usuários de teste para cenários de avaliação.
 */
export const initialUsers: User[] = [
  {
    id: "usr_vip_01",
    username: "cliente_vip",
    name: "Maria Silva",
    password: "123",
    limite_total: 15000.00,
    limite_disponivel: 15000.00
  },
  {
    id: "usr_std_02",
    username: "cliente_padrao",
    name: "João Souza",
    password: "123",
    limite_total: 2000.00,
    limite_disponivel: 2000.00
  },
  {
    id: "usr_low_03",
    username: "cliente_sem_saldo",
    name: "Carlos Lima",
    password: "123",
    limite_total: 100.00,
    limite_disponivel: 100.00
  }
];

const usersStore = new Map<string, User>(
  initialUsers.map((u) => [u.id, { ...u }])
);

export function findUserById(id: string): User | undefined {
  return usersStore.get(id);
}

export function findUserByUsername(username: string): User | undefined {
  const cleanUsername = username.trim().toLowerCase();
  for (const user of usersStore.values()) {
    if (user.username.toLowerCase() === cleanUsername) {
      return user;
    }
  }
  return undefined;
}

export function hasSufficientLimit(userId: string, amount: number): boolean {
  const user = usersStore.get(userId);
  if (!user) return false;
  return user.limite_disponivel >= amount;
}

export function deductUserLimit(userId: string, amount: number): number | false {
  const user = usersStore.get(userId);
  if (!user || user.limite_disponivel < amount) {
    return false;
  }
  user.limite_disponivel = Number((user.limite_disponivel - amount).toFixed(2));
  return user.limite_disponivel;
}

export function listAllUsers(): User[] {
  return Array.from(usersStore.values());
}

export function resetUsersStore(): void {
  usersStore.clear();
  initialUsers.forEach((u) => usersStore.set(u.id, { ...u }));
}
