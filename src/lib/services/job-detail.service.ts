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
    return apiClient.get<JobDetailWithCount[]>('/api/v1/job-detail')
  },

  async getById(id: string) {
    return apiClient.get(`/api/v1/job-detail/${id}`)
  },

  async create(data: CreateJobDetailData) {
    return apiClient.post('/api/v1/job-detail', data)
  },

  async update(data: UpdateJobDetailData) {
    return apiClient.put(`/api/v1/job-detail/${data.id}`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/api/v1/job-detail/${id}`)
  },

  async restore(id: string): Promise<void> {
    return apiClient.post(`/api/v1/job-detail/${id}/restore`)
  },
}
