import { apiClient } from '@/lib/api-client'
import type { CreateTaskDailyData, UpdateTaskDailyData, TaskDailyFiltered, TeamTaskGroups } from '@/types/task-daily'

export const taskDailyService = {
  async getAll(filters?: {
    workDate?: string
    teamId?: string
    jobTypeId?: string
    feederId?: string
  }): Promise<TaskDailyFiltered[]> {
    return apiClient.get<TaskDailyFiltered[]>('/api/v1/task-daily', { params: filters })
  },

  async getById(id: string): Promise<TaskDailyFiltered> {
    return apiClient.get<TaskDailyFiltered>(`/api/v1/task-daily/${id}`)
  },

  async create(data: CreateTaskDailyData): Promise<TaskDailyFiltered> {
    return apiClient.post<TaskDailyFiltered>('/api/v1/task-daily', data)
  },

  async update(data: UpdateTaskDailyData): Promise<TaskDailyFiltered> {
    return apiClient.put<TaskDailyFiltered>(`/api/v1/task-daily/${data.id}`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/api/v1/task-daily/${id}`)
  },

  async getByTeam(): Promise<TeamTaskGroups> {
    return apiClient.get<TeamTaskGroups>('/api/v1/task-daily/by-team')
  },

  async getByFilter(params: { year: string; month: string; teamId?: string }): Promise<TeamTaskGroups> {
    return apiClient.get<TeamTaskGroups>('/api/v1/task-daily/by-filter', { params })
  },
}
