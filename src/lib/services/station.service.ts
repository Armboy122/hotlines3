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
    return apiClient.get<Station[]>('/v1/stations')
  },

  async getById(id: string) {
    return apiClient.get(`/v1/stations/${id}`)
  },

  async create(data: CreateStationData) {
    return apiClient.post('/v1/stations', data)
  },

  async update(data: UpdateStationData) {
    return apiClient.put(`/v1/stations/${data.id}`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/v1/stations/${id}`)
  },
}
