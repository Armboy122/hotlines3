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
    return apiClient.get<Pea[]>('/v1/peas')
  },

  async getById(id: string) {
    return apiClient.get(`/v1/peas/${id}`)
  },

  async create(data: CreatePeaData) {
    return apiClient.post('/v1/peas', data)
  },

  async update(data: UpdatePeaData) {
    return apiClient.put(`/v1/peas/${data.id}`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/v1/peas/${id}`)
  },

  async createMultiple(data: CreatePeaData[]) {
    return apiClient.post('/v1/peas/bulk', data)
  },
}
