export interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'user'
  teamId?: string
  teamName?: string
  isActive: boolean
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface RefreshResponse {
  accessToken: string
  refreshToken: string
}
