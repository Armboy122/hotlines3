import { apiClient } from '@/lib/api-client'
import type { Pea } from '@/types/api'

export interface CreatePeaData {
  shortname: string
  fullname: string
  operationId: string
}

export interface UpdatePeaData extends CreatePeaData {
  id: string
}

export const peaService = {
  async getAll(): Promise<Pea[]> {
    return apiClient.get<Pea[]>('/api/v1/pea')
  },

  async getById(id: string) {
    return apiClient.get(`/api/v1/pea/${id}`)
  },

  async create(data: CreatePeaData) {
    return apiClient.post('/api/v1/pea', data)
  },

  async update(data: UpdatePeaData) {
    return apiClient.put(`/api/v1/pea/${data.id}`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/api/v1/pea/${id}`)
  },

  async createMultiple(data: CreatePeaData[]) {
    return apiClient.post('/api/v1/pea/batch', { data })
  },
}
