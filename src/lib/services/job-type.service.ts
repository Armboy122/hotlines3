import { apiClient } from '@/lib/api-client'
import type { JobTypeWithCount } from '@/types/query-types'

export interface CreateJobTypeData {
  name: string
}

export interface UpdateJobTypeData extends CreateJobTypeData {
  id: string
}

export const jobTypeService = {
  async getAll(): Promise<JobTypeWithCount[]> {
    return apiClient.get<JobTypeWithCount[]>('/v1/job-types')
  },

  async getById(id: string) {
    return apiClient.get(`/v1/job-types/${id}`)
  },

  async create(data: CreateJobTypeData) {
    return apiClient.post('/v1/job-types', data)
  },

  async update(data: UpdateJobTypeData) {
    return apiClient.put(`/v1/job-types/${data.id}`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/v1/job-types/${id}`)
  },
}
