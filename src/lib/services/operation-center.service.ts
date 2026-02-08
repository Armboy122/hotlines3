import { apiClient } from '@/lib/api-client'
import type { OperationCenter } from '@/types/api'

export interface CreateOperationCenterData {
  name: string
}

export interface UpdateOperationCenterData extends CreateOperationCenterData {
  id: string
}

export const operationCenterService = {
  async getAll(): Promise<OperationCenter[]> {
    return apiClient.get<OperationCenter[]>('/api/v1/operation-center')
  },

  async getById(id: string) {
    return apiClient.get(`/api/v1/operation-center/${id}`)
  },

  async create(data: CreateOperationCenterData) {
    return apiClient.post('/api/v1/operation-center', data)
  },

  async update(data: UpdateOperationCenterData) {
    return apiClient.put(`/api/v1/operation-center/${data.id}`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/api/v1/operation-center/${id}`)
  },
}
