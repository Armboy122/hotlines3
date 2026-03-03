export interface User {
  id: number
  username: string
  role: 'admin' | 'user' | 'viewer'
  teamId: number | null
  isActive: boolean
  lastLogin: string | null
  createdAt: string
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

export interface RefreshRequest {
  refreshToken: string
}

export interface RefreshResponse {
  accessToken: string
  refreshToken: string
}

export interface RegisterRequest {
  username: string
  password: string
  role: 'admin' | 'user' | 'viewer'
  teamId?: number | null
  isActive?: boolean
}

export interface CreateUserRequest {
  username: string
  password: string
  role: 'admin' | 'user' | 'viewer'
  teamId?: number | null
  isActive?: boolean
}

export interface UpdateUserRequest {
  username?: string
  role?: 'admin' | 'user' | 'viewer'
  teamId?: number | null
  isActive?: boolean
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}
