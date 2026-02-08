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
    return apiClient.get<JobTypeWithCount[]>('/api/v1/job-type')
  },

  async getById(id: string) {
    return apiClient.get(`/api/v1/job-type/${id}`)
  },

  async create(data: CreateJobTypeData) {
    return apiClient.post('/api/v1/job-type', data)
  },

  async update(data: UpdateJobTypeData) {
    return apiClient.put(`/api/v1/job-type/${data.id}`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/api/v1/job-type/${id}`)
  },
}
