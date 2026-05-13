export type UserRole = 'super_admin' | 'admin' | 'team_lead' | 'user' | 'viewer'

export interface UserTeam {
  id: number
  name: string
}

export interface User {
  id: number
  username: string
  role: UserRole
  teamId: number | null
  team?: UserTeam | null
  displayName?: string | null
  position?: string | null
  phoneNumber?: string | null
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
  role: UserRole
  teamId?: number | null
  isActive?: boolean
}

export interface CreateUserRequest {
  username: string
  password: string
  role: UserRole
  teamId?: number | null
  isActive?: boolean
}

export interface UpdateUserRequest {
  username?: string
  role?: UserRole
  teamId?: number | null
  isActive?: boolean
}

export interface ResetPasswordRequest {
  newPassword: string
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}
