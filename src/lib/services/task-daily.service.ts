import { apiClient } from '@/lib/api-client'
import type { CreateTaskDailyData, UpdateTaskDailyData, TaskDailyFiltered, TeamTaskGroups } from '@/types/task-daily'

export const taskDailyService = {
  async getAll(filters?: {
    workDate?: string
    teamId?: string
    jobTypeId?: string
    feederId?: string
  }): Promise<TaskDailyFiltered[]> {
    return apiClient.get<TaskDailyFiltered[]>('/v1/tasks', { params: filters })
  },

  async getById(id: string): Promise<TaskDailyFiltered> {
    return apiClient.get<TaskDailyFiltered>(`/v1/tasks/${id}`)
  },

  async create(data: CreateTaskDailyData): Promise<TaskDailyFiltered> {
    return apiClient.post<TaskDailyFiltered>('/v1/tasks', data)
  },

  async update(data: UpdateTaskDailyData): Promise<TaskDailyFiltered> {
    return apiClient.put<TaskDailyFiltered>(`/v1/tasks/${data.id}`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/v1/tasks/${id}`)
  },

  async getByTeam(): Promise<TeamTaskGroups> {
    return apiClient.get<TeamTaskGroups>('/v1/tasks/by-team')
  },

  async getByFilter(params: { year: string; month: string; teamId?: string }): Promise<TeamTaskGroups> {
    return apiClient.get<TeamTaskGroups>('/v1/tasks/by-filter', { params })
  },
}
