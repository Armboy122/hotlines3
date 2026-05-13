import { apiClient } from '@/lib/api-client'
import type { CreateUserRequest, ResetPasswordRequest, UpdateUserRequest, User } from '@/types/auth'

export interface UserListParams {
  page?: number
  limit?: number
}

export interface UpdateUserData extends UpdateUserRequest {
  id: number
}

export interface ResetUserPasswordData extends ResetPasswordRequest {
  id: number
}

export const userService = {
  async getAll(params: UserListParams = {}): Promise<User[]> {
    return apiClient.get<User[]>('/v1/users', { params })
  },

  async getById(id: number): Promise<User> {
    return apiClient.get<User>(`/v1/users/${id}`)
  },

  async create(data: CreateUserRequest): Promise<User> {
    return apiClient.post<User>('/v1/users', data)
  },

  async update({ id, ...data }: UpdateUserData): Promise<User> {
    return apiClient.put<User>(`/v1/users/${id}`, data)
  },

  async resetPassword({ id, ...data }: ResetUserPasswordData): Promise<void> {
    return apiClient.put(`/v1/users/${id}/reset-password`, data)
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete(`/v1/users/${id}`)
  },
}
