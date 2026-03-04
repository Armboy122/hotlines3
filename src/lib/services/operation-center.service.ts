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
    return apiClient.get<OperationCenter[]>('/v1/operation-centers')
  },

  async getById(id: string) {
    return apiClient.get(`/v1/operation-centers/${id}`)
  },

  async create(data: CreateOperationCenterData) {
    return apiClient.post('/v1/operation-centers', data)
  },

  async update(data: UpdateOperationCenterData) {
    return apiClient.put(`/v1/operation-centers/${data.id}`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/v1/operation-centers/${id}`)
  },
}
