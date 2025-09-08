import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export interface CreateTaskDailyData {
  workDate: string
  teamId: string
  jobTypeId: string
  jobDetailId: string
  feederId?: string
  numPole?: string
  deviceCode?: string
  detail?: string
  urlsBefore: string[]
  urlsAfter: string[]
}

export interface UpdateTaskDailyData extends CreateTaskDailyData {
  id: string
}

export async function createTaskDaily(data: CreateTaskDailyData) {
  try {
    const taskDaily = await prisma.taskDaily.create({
      data: {
        workDate: new Date(data.workDate),
        teamId: BigInt(data.teamId),
        jobTypeId: BigInt(data.jobTypeId),
        jobDetailId: BigInt(data.jobDetailId),
        feederId: data.feederId ? BigInt(data.feederId) : null,
        numPole: data.numPole,
        deviceCode: data.deviceCode,
        detail: data.detail ?? null,
        urlsBefore: data.urlsBefore,
        urlsAfter: data.urlsAfter,
      },
      include: {
        team: true,
        jobType: true,
        jobDetail: true,
        feeder: {
          include: {
            station: true,
          },
        },
      },
    })

    revalidatePath('/')
    return { success: true, data: taskDaily }
  } catch (error) {
    console.error('Error creating task daily:', error)
    return { success: false, error: 'Failed to create task daily' }
  }
}

export async function getTaskDailies(filters?: {
  workDate?: string
  teamId?: string
  jobTypeId?: string
  feederId?: string
}) {
  try {
    const where: Record<string, unknown> = {}

    if (filters?.workDate) {
      where.workDate = new Date(filters.workDate)
    }
    if (filters?.teamId) {
      where.teamId = BigInt(filters.teamId)
    }
    if (filters?.jobTypeId) {
      where.jobTypeId = BigInt(filters.jobTypeId)
    }
    if (filters?.feederId) {
      where.feederId = BigInt(filters.feederId)
    }

    const taskDailies = await prisma.taskDaily.findMany({
      where,
      include: {
        team: true,
        jobType: true,
        jobDetail: true,
        feeder: {
          include: {
            station: true,
          },
        },
      },
      orderBy: { workDate: 'desc' },
    })

    return { success: true, data: taskDailies }
  } catch (error) {
    console.error('Error fetching task dailies:', error)
    return { success: false, error: 'Failed to fetch task dailies' }
  }
}

export async function getTaskDaily(id: string) {
  try {
    const taskDaily = await prisma.taskDaily.findUnique({
      where: { id: BigInt(id) },
      include: {
        team: true,
        jobType: true,
        jobDetail: true,
        feeder: {
          include: {
            station: true,
          },
        },
      },
    })

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
    const taskDaily = await prisma.taskDaily.update({
      where: { id: BigInt(data.id) },
      data: {
        workDate: new Date(data.workDate),
        teamId: BigInt(data.teamId),
        jobTypeId: BigInt(data.jobTypeId),
        jobDetailId: BigInt(data.jobDetailId),
        feederId: data.feederId ? BigInt(data.feederId) : null,
        numPole: data.numPole,
        deviceCode: data.deviceCode,
        detail: data.detail ?? null,
        urlsBefore: data.urlsBefore,
        urlsAfter: data.urlsAfter,
      },
      include: {
        team: true,
        jobType: true,
        jobDetail: true,
        feeder: {
          include: {
            station: true,
          },
        },
      },
    })

    revalidatePath('/')
    return { success: true, data: taskDaily }
  } catch (error) {
    console.error('Error updating task daily:', error)
    return { success: false, error: 'Failed to update task daily' }
  }
}

export async function deleteTaskDaily(id: string) {
  try {
    await prisma.taskDaily.delete({ where: { id: BigInt(id) } })
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error deleting task daily:', error)
    return { success: false, error: 'Failed to delete task daily' }
  }
}

export async function getTaskDailiesByTeam() {
  try {
    const taskDailies = await prisma.taskDaily.findMany({
      include: {
        team: true,
        jobType: true,
        jobDetail: true,
        feeder: {
          include: {
            station: {
              include: {
                operationCenter: true,
              },
            },
          },
        },
      },
      orderBy: [
        { team: { name: 'asc' } },
        { workDate: 'desc' },
      ],
    })

    // จัดกลุ่มตามทีม
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
