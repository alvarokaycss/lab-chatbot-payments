import type { User, UserProfile } from "../types.js";
import { hashPassword, verifyPassword } from "./password.js";

/**
 * Base de dados em memoria com os perfis de teste definidos no desafio.
 * Senhas sao hasheadas com scrypt na inicializacao.
 */
const initialUsers: User[] = [
  {
    id: "usr_vip_01",
    username: "cliente_vip",
    name: "Maria Silva",
    passwordHash: hashPassword("123"),
    limite_total: 15000.0,
    limite_disponivel: 15000.0
  },
  {
    id: "usr_std_02",
    username: "cliente_padrao",
    name: "João Souza",
    passwordHash: hashPassword("123"),
    limite_total: 2000.0,
    limite_disponivel: 2000.0
  },
  {
    id: "usr_low_03",
    username: "cliente_sem_saldo",
    name: "Carlos Lima",
    passwordHash: hashPassword("123"),
    limite_total: 100.0,
    limite_disponivel: 100.0
  }
];

const usersStore = new Map<string, User>(
  initialUsers.map((user) => [user.username, { ...user }])
);

export function findUserByUsername(username: string): User | undefined {
  return usersStore.get(username.trim().toLowerCase());
}

export function findUserById(id: string): User | undefined {
  for (const user of usersStore.values()) {
    if (user.id === id) {
      return user;
    }
  }
  return undefined;
}

export function authenticateUser(
  username: string,
  password: string
): UserProfile | null {
  const user = findUserByUsername(username);
  if (!user) {
    return null;
  }
  if (!verifyPassword(password, user.passwordHash)) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    limite_total: user.limite_total,
    limite_disponivel: user.limite_disponivel
  };
}

export function getUserProfile(userId: string): UserProfile | null {
  const user = findUserById(userId);
  if (!user) {
    return null;
  }
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    limite_total: user.limite_total,
    limite_disponivel: user.limite_disponivel
  };
}

export function deductUserBalance(
  userId: string,
  amount: number
): number | false {
  const user = findUserById(userId);
  if (!user || user.limite_disponivel < amount) {
    return false;
  }
  user.limite_disponivel = Number(
    (user.limite_disponivel - amount).toFixed(2)
  );
  return user.limite_disponivel;
}

export function resetUsersStore(): void {
  usersStore.clear();
  initialUsers.forEach((u) => usersStore.set(u.username, { ...u }));
}
