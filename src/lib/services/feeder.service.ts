import { apiClient } from '@/lib/api-client'
import type { FeederWithStation } from '@/types/query-types'

export interface CreateFeederData {
  code: string
  stationId: string
}

export interface UpdateFeederData extends CreateFeederData {
  id: string
}

export const feederService = {
  async getAll(): Promise<FeederWithStation[]> {
    return apiClient.get<FeederWithStation[]>('/v1/feeders')
  },

  async getById(id: string) {
    return apiClient.get(`/v1/feeders/${id}`)
  },

  async create(data: CreateFeederData) {
    return apiClient.post('/v1/feeders', data)
  },

  async update(data: UpdateFeederData) {
    return apiClient.put(`/v1/feeders/${data.id}`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/v1/feeders/${id}`)
  },
}
