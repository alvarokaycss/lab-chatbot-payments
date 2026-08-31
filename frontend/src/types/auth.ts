export interface UserProfile {
  id: string
  username: string
  name: string
  limite_total: number
  limite_disponivel: number
}
export interface LoginRequest {
  username: string
  password: string
}
export interface LoginResponse {
  token: string
  user: UserProfile
  expiresIn: string
}
export interface DemoProfile {
  name: string
  label: string
  limit: number
  username: string
  password: string
}
