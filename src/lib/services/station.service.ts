import { apiClient } from '@/lib/api-client'
import type { Station } from '@/types/api'

export interface CreateStationData {
  name: string
  codeName: string
  operationId: string
}

export interface UpdateStationData extends CreateStationData {
  id: string
}

export const stationService = {
  async getAll(): Promise<Station[]> {
    return apiClient.get<Station[]>('/api/v1/station')
  },

  async getById(id: string) {
    return apiClient.get(`/api/v1/station/${id}`)
  },

  async create(data: CreateStationData) {
    return apiClient.post('/api/v1/station', data)
  },

  async update(data: UpdateStationData) {
    return apiClient.put(`/api/v1/station/${data.id}`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/api/v1/station/${id}`)
  },
}
