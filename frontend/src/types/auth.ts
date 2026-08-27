export interface User {
  id: string;
  username: string;
  name: string;
  limite_total: number;
  limite_disponivel: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}