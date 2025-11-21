'use server'

import { apiClient } from '@/lib/api-client'
import type { CreateTaskDailyData, UpdateTaskDailyData, TaskDailyFiltered } from '@/types/task-daily'

type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
}

export async function createTaskDaily(data: CreateTaskDailyData) {
  try {
    const res = await apiClient<ApiResponse<TaskDailyFiltered>>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return res
  } catch (error) {
    console.error('Error creating task daily:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create task daily',
    }
  }
}

export async function getTaskDailies(filters?: {
  workDate?: string
  teamId?: string
  jobTypeId?: string
  feederId?: string
}) {
  try {
    const params = new URLSearchParams()
    if (filters?.workDate) params.append('workDate', filters.workDate)
    if (filters?.teamId) params.append('teamId', filters.teamId)
    if (filters?.jobTypeId) params.append('jobTypeId', filters.jobTypeId)
    if (filters?.feederId) params.append('feederId', filters.feederId)

    const res = await apiClient<ApiResponse<TaskDailyFiltered[]>>(`/tasks?${params.toString()}`)
    return res
  } catch (error) {
    console.error('Error fetching task dailies:', error)
    return { success: false, error: 'Failed to fetch task dailies' }
  }
}

export async function getTaskDaily(id: string) {
  try {
    const res = await apiClient<ApiResponse<TaskDailyFiltered>>(`/tasks/${id}`)
    return res
  } catch (error) {
    console.error('Error fetching task daily:', error)
    return { success: false, error: 'Failed to fetch task daily' }
  }
}

export async function updateTaskDaily(data: UpdateTaskDailyData) {
  try {
    const res = await apiClient<ApiResponse<TaskDailyFiltered>>(`/tasks/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return res
  } catch (error) {
    console.error('Error updating task daily:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update task daily',
    }
  }
}

export async function deleteTaskDaily(id: string) {
  try {
    const res = await apiClient<ApiResponse<void>>(`/tasks/${id}`, {
      method: 'DELETE',
    })
    return res
  } catch (error) {
    console.error('Error deleting task daily:', error)
    return { success: false, error: 'Failed to delete task daily' }
  }
}

export async function getTaskDailiesByFilter(params: {
  year: string
  month: string
  teamId?: string
}) {
  try {
    const queryParams = new URLSearchParams()
    queryParams.append('year', params.year)
    queryParams.append('month', params.month)
    if (params.teamId) queryParams.append('teamId', params.teamId)

    const res = await apiClient<ApiResponse<any>>(`/tasks/filter?${queryParams.toString()}`)
    return res
  } catch (error) {
    console.error('Error fetching task dailies by filter:', error)
    return { success: false, error: 'Failed to fetch task dailies' }
  }
}

export async function getTaskDailiesByTeam() {
  try {
    const res = await apiClient<ApiResponse<any>>('/tasks/by-team')
    return res
  } catch (error) {
    console.error('Error fetching task dailies by team:', error)
    return { success: false, error: 'Failed to fetch task dailies by team' }
  }
}
