'use server'

import type { Prisma } from '@prisma/client'
import { taskDailyService } from '@/server/services/task-daily.service'
import type { CreateTaskDailyData, UpdateTaskDailyData, TaskDailyFiltered } from '@/types/task-daily'
import { isExternalMode } from '@/lib/api-config'
import { apiClient } from '@/lib/axios-client'

type TaskDailyWithRelations = Prisma.TaskDailyGetPayload<{
  include: {
    team: true
    jobType: true
    jobDetail: true
    feeder: {
      include: {
        station: {
          include: {
            operationCenter: true
          }
        }
      }
    }
  }
}>

const decimalToNumber = (value: Prisma.Decimal | null | undefined) =>
  value === null || value === undefined ? null : value.toNumber()

const serializeTaskDaily = (task: TaskDailyWithRelations): TaskDailyFiltered => {
  const feeder = task.feeder
    ? {
        id: task.feeder.id.toString(),
        code: task.feeder.code,
        station: {
          name: task.feeder.station.name,
          operationCenter: {
            name: task.feeder.station.operationCenter?.name ?? 'ไม่ระบุ',
          },
        },
      }
    : undefined

  return {
    id: task.id.toString(),
    workDate: task.workDate.toISOString(),
    teamId: task.teamId.toString(),
    jobTypeId: task.jobTypeId.toString(),
    jobDetailId: task.jobDetailId.toString(),
    feederId: task.feederId ? task.feederId.toString() : null,
    numPole: task.numPole ?? null,
    deviceCode: task.deviceCode ?? null,
    detail: task.detail ?? null,
    urlsBefore: [...task.urlsBefore],
    urlsAfter: [...task.urlsAfter],
    latitude: decimalToNumber(task.latitude),
    longitude: decimalToNumber(task.longitude),
    team: {
      id: task.team.id.toString(),
      name: task.team.name,
    },
    jobType: {
      id: task.jobType.id.toString(),
      name: task.jobType.name,
    },
    jobDetail: {
      id: task.jobDetail.id.toString(),
      name: task.jobDetail.name,
    },
    feeder,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    deletedAt: task.deletedAt?.toISOString() ?? null,
  }
}

const groupTasksByTeam = (tasks: TaskDailyFiltered[]) =>
  tasks.reduce((acc, task) => {
    const teamName = task.team.name
    if (!acc[teamName]) {
      acc[teamName] = {
        team: { ...task.team },
        tasks: [],
      }
    }
    acc[teamName].tasks.push(task)
    return acc
  }, {} as Record<string, { team: TaskDailyFiltered['team']; tasks: TaskDailyFiltered[] }>)

export async function createTaskDaily(data: CreateTaskDailyData) {
  try {
    if (isExternalMode()) {
      // External API mode
      const response = await apiClient.post<any, TaskDailyFiltered>('/api/v1/task-daily', data)
      return { success: true, data: response }
    } else {
      // Local Prisma mode
      const taskDaily = await taskDailyService.create(data)
      return { success: true, data: serializeTaskDaily(taskDaily) }
    }
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
    if (isExternalMode()) {
      // External API mode
      const response = await apiClient.get<any, TaskDailyFiltered[]>('/api/v1/task-daily', { params: filters })
      return { success: true, data: response }
    } else {
      // Local Prisma mode
      const taskDailies = await taskDailyService.findMany(filters)
      return { success: true, data: taskDailies.map(serializeTaskDaily) }
    }
  } catch (error) {
    console.error('Error fetching task dailies:', error)
    return { success: false, error: 'Failed to fetch task dailies' }
  }
}

export async function getTaskDaily(id: string) {
  try {
    if (isExternalMode()) {
      // External API mode
      const response = await apiClient.get<any, TaskDailyFiltered>(`/api/v1/task-daily/${id}`)
      return { success: true, data: response }
    } else {
      // Local Prisma mode
      const taskDaily = await taskDailyService.findById(id)
      if (!taskDaily) {
        return { success: false, error: 'Task daily not found' }
      }
      return { success: true, data: serializeTaskDaily(taskDaily) }
    }
  } catch (error) {
    console.error('Error fetching task daily:', error)
    return { success: false, error: 'Failed to fetch task daily' }
  }
}

export async function updateTaskDaily(data: UpdateTaskDailyData) {
  try {
    if (isExternalMode()) {
      // External API mode
      const response = await apiClient.put<any, TaskDailyFiltered>(`/api/v1/task-daily/${data.id}`, data)
      return { success: true, data: response }
    } else {
      // Local Prisma mode
      const taskDaily = await taskDailyService.update(data)
      return { success: true, data: serializeTaskDaily(taskDaily) }
    }
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
    if (isExternalMode()) {
      // External API mode
      await apiClient.delete(`/api/v1/task-daily/${id}`)
      return { success: true }
    } else {
      // Local Prisma mode
      await taskDailyService.delete(id)
      return { success: true }
    }
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
    if (isExternalMode()) {
      // External API mode
      const response = await apiClient.get('/api/v1/task-daily/by-filter', { params })
      return { success: true, data: response }
    } else {
      // Local Prisma mode
      const taskDailies = await taskDailyService.findManyByFilter(params)
      const groupedByTeam = groupTasksByTeam(taskDailies.map(serializeTaskDaily))
      return { success: true, data: groupedByTeam }
    }
  } catch (error) {
    console.error('Error fetching task dailies by filter:', error)
    return { success: false, error: 'Failed to fetch task dailies' }
  }
}

export async function getTaskDailiesByTeam() {
  try {
    if (isExternalMode()) {
      // External API mode
      const response = await apiClient.get('/api/v1/task-daily/by-team')
      return { success: true, data: response }
    } else {
      // Local Prisma mode
      const taskDailies = await taskDailyService.findAllByTeam()
      const groupedByTeam = groupTasksByTeam(taskDailies.map(serializeTaskDaily))
      return { success: true, data: groupedByTeam }
    }
  } catch (error) {
    console.error('Error fetching task dailies by team:', error)
    return { success: false, error: 'Failed to fetch task dailies by team' }
  }
}
