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
    return apiClient.get<FeederWithStation[]>('/api/v1/feeder')
  },

  async getById(id: string) {
    return apiClient.get(`/api/v1/feeder/${id}`)
  },

  async create(data: CreateFeederData) {
    return apiClient.post('/api/v1/feeder', data)
  },

  async update(data: UpdateFeederData) {
    return apiClient.put(`/api/v1/feeder/${data.id}`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/api/v1/feeder/${id}`)
  },
}
