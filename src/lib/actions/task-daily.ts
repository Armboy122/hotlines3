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
    const where: any = {}

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
