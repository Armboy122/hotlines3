'use server'

import { taskDailyService } from '@/server/services/task-daily.service'
import type { CreateTaskDailyData, UpdateTaskDailyData, TaskDailyFiltered } from '@/types/task-daily'

export async function createTaskDaily(data: CreateTaskDailyData) {
  try {
    const taskDaily = await taskDailyService.create(data)
    return { success: true, data: taskDaily }
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
    const taskDailies = await taskDailyService.findMany(filters)
    return { success: true, data: taskDailies }
  } catch (error) {
    console.error('Error fetching task dailies:', error)
    return { success: false, error: 'Failed to fetch task dailies' }
  }
}

export async function getTaskDaily(id: string) {
  try {
    const taskDaily = await taskDailyService.findById(id)
    if (!taskDaily) {
      return { success: false, error: 'Task daily not found' }
    }
    return { success: true, data: taskDaily }
  } catch (error) {
    console.error('Error fetching task daily:', error)
    return { success: false, error: 'Failed to fetch task daily' }
  }
}

export async function updateTaskDaily(data: UpdateTaskDailyData) {
  try {
    const taskDaily = await taskDailyService.update(data)
    return { success: true, data: taskDaily }
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
    await taskDailyService.delete(id)
    return { success: true }
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
    const taskDailies = await taskDailyService.findManyByFilter(params)

    // Transform and Group
    const groupedByTeam = taskDailies.reduce((acc, task) => {
      const teamName = task.team.name
      if (!acc[teamName]) {
        acc[teamName] = {
          team: {
            id: task.team.id.toString(),
            name: task.team.name,
          },
          tasks: [],
        }
      }
      acc[teamName].tasks.push({
        id: task.id.toString(),
        workDate: task.workDate.toISOString(),
        teamId: task.teamId.toString(),
        jobTypeId: task.jobTypeId.toString(),
        jobDetailId: task.jobDetailId.toString(),
        feederId: task.feederId?.toString() || null,
        numPole: task.numPole,
        deviceCode: task.deviceCode,
        detail: task.detail,
        urlsBefore: task.urlsBefore,
        urlsAfter: task.urlsAfter,
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
        feeder: task.feeder ? {
          id: task.feeder.id.toString(),
          code: task.feeder.code,
          station: {
            name: task.feeder.station.name,
            operationCenter: {
              name: task.feeder.station.operationCenter.name,
            },
          },
        } : undefined,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      })
      return acc
    }, {} as Record<string, { team: { id: string; name: string }; tasks: TaskDailyFiltered[] }>)

    return { success: true, data: groupedByTeam }
  } catch (error) {
    console.error('Error fetching task dailies by filter:', error)
    return { success: false, error: 'Failed to fetch task dailies' }
  }
}

export async function getTaskDailiesByTeam() {
  try {
    const taskDailies = await taskDailyService.findAllByTeam()

    // Transform and Group
    const groupedByTeam = taskDailies.reduce((acc, task) => {
      const teamName = task.team.name
      if (!acc[teamName]) {
        acc[teamName] = {
          team: {
            id: task.team.id.toString(),
            name: task.team.name,
          },
          tasks: [],
        }
      }
      
      acc[teamName].tasks.push({
        ...task,
        id: task.id.toString(),
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
          createdAt: task.jobDetail.createdAt.toISOString(),
          updatedAt: task.jobDetail.updatedAt.toISOString(),
          deletedAt: task.jobDetail.deletedAt?.toISOString() || null,
        },
        feeder: task.feeder ? {
          id: task.feeder.id.toString(),
          code: task.feeder.code,
          station: {
            name: task.feeder.station.name,
            operationCenter: {
              name: task.feeder.station.operationCenter.name,
            },
          },
        } : undefined,
        workDate: task.workDate.toISOString(),
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
        deletedAt: task.deletedAt?.toISOString() || null,
      })
      return acc
    }, {} as Record<string, { team: { id: string; name: string }; tasks: unknown[] }>)

    return { success: true, data: groupedByTeam }
  } catch (error) {
    console.error('Error fetching task dailies by team:', error)
    return { success: false, error: 'Failed to fetch task dailies by team' }
  }
}
