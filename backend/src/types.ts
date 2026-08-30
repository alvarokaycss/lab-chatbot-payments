/**
 * Contratos de tipos e interfaces do modulo de Autenticacao e Usuarios
 */

export interface User {
  id: string;
  username: string;
  name: string;
  passwordHash: string;
  limite_total: number;
  limite_disponivel: number;
}

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  limite_total: number;
  limite_disponivel: number;
}

export interface JwtUserPayload {
  id: string;
  username: string;
  name: string;
}

export interface LoginResponse {
  token: string;
  user: UserProfile;
  expiresIn: string;
}
