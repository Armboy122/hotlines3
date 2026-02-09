import { apiClient } from '@/lib/api-client'
import type { JobDetailWithCount } from '@/types/query-types'

export interface CreateJobDetailData {
  name: string
}

export interface UpdateJobDetailData extends CreateJobDetailData {
  id: string
}

export const jobDetailService = {
  async getAll(): Promise<JobDetailWithCount[]> {
    return apiClient.get<JobDetailWithCount[]>('/v1/job-details')
  },

  async getById(id: string) {
    return apiClient.get(`/v1/job-details/${id}`)
  },

  async create(data: CreateJobDetailData) {
    return apiClient.post('/v1/job-details', data)
  },

  async update(data: UpdateJobDetailData) {
    return apiClient.put(`/v1/job-details/${data.id}`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/v1/job-details/${id}`)
  },

  async restore(id: string): Promise<void> {
    return apiClient.post(`/v1/job-details/${id}/restore`)
  },
}
