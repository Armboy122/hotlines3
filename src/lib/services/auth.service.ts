import { apiClient } from '@/lib/api-client'
import type { LoginRequest, LoginResponse, User, RefreshResponse } from '@/types/auth'

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    return apiClient.post('/v1/auth/login', data)
  },

  async refresh(refreshToken: string): Promise<RefreshResponse> {
    return apiClient.post('/v1/auth/refresh', { refreshToken })
  },

  async logout(): Promise<void> {
    return apiClient.post('/v1/auth/logout')
  },

  async getMe(): Promise<User> {
    return apiClient.get('/v1/auth/me')
  },
}
