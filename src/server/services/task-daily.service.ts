import { Prisma } from '@prisma/client'
import { taskDailyRepository } from '../repositories/task-daily.repository'
import type { CreateTaskDailyData, UpdateTaskDailyData } from '@/types/task-daily'

const LATITUDE_RANGE = { min: -90, max: 90 }
const LONGITUDE_RANGE = { min: -180, max: 180 }

const formatDecimal = (value: number) =>
  new Prisma.Decimal(value.toFixed(6))

type CoordinatePayload =
  | { latitude: Prisma.Decimal; longitude: Prisma.Decimal }
  | { latitude: null; longitude: null }
  | Record<string, never>

const normalizeCoordinates = (latitude?: number | null, longitude?: number | null): CoordinatePayload => {
  const latIsNull = latitude === null
  const lngIsNull = longitude === null

  if (latIsNull || lngIsNull) {
    if (latIsNull && lngIsNull) {
      return { latitude: null, longitude: null }
    }

    console.warn('[taskDailyService] Latitude/Longitude mismatch (null)', {
      latitude,
      longitude,
    })
    throw new Error('ต้องระบุทั้ง latitude และ longitude หรือเว้นว่างทั้งคู่')
  }

  const hasLat = typeof latitude === 'number' && Number.isFinite(latitude)
  const hasLng = typeof longitude === 'number' && Number.isFinite(longitude)

  if (!hasLat && !hasLng) {
    return {}
  }

  if (hasLat !== hasLng) {
    console.warn('[taskDailyService] Latitude/Longitude mismatch', {
      latitude,
      longitude,
    })
    throw new Error('ต้องระบุทั้ง latitude และ longitude ให้ครบคู่')
  }

  if (latitude === undefined || longitude === undefined) {
    console.warn('[taskDailyService] Invalid coordinate payload', {
      latitude,
      longitude,
    })
    throw new Error('พิกัดไม่ถูกต้อง')
  }

  if (latitude < LATITUDE_RANGE.min || latitude > LATITUDE_RANGE.max) {
    console.warn('[taskDailyService] Latitude out of range', { latitude })
    throw new Error('latitude ต้องอยู่ระหว่าง -90 ถึง 90')
  }

  if (longitude < LONGITUDE_RANGE.min || longitude > LONGITUDE_RANGE.max) {
    console.warn('[taskDailyService] Longitude out of range', { longitude })
    throw new Error('longitude ต้องอยู่ระหว่าง -180 ถึง 180')
  }

  return {
    latitude: formatDecimal(latitude),
    longitude: formatDecimal(longitude),
  }
}

// Export for compatibility, but prefer importing from types/task-daily
export type { CreateTaskDailyData, UpdateTaskDailyData }

export const taskDailyService = {
  create: async (data: CreateTaskDailyData) => {
    const coordinates = normalizeCoordinates(data.latitude, data.longitude)

    return taskDailyRepository.create({
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
      ...coordinates,
    })
  },

  update: async (data: UpdateTaskDailyData) => {
    const coordinates = normalizeCoordinates(data.latitude, data.longitude)

    return taskDailyRepository.update(data.id, {
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
      ...coordinates,
    })
  },

  delete: async (id: string) => {
    return taskDailyRepository.delete(id)
  },

  findById: async (id: string) => {
    return taskDailyRepository.findById(id)
  },

  findMany: async (filters?: {
    workDate?: string
    teamId?: string
    jobTypeId?: string
    feederId?: string
  }) => {
    const where: Prisma.TaskDailyWhereInput = {}

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

    return taskDailyRepository.findMany({
      where,
      orderBy: { workDate: 'desc' },
    })
  },

  findManyByFilter: async (params: {
    year: string
    month: string
    teamId?: string
  }) => {
    const yearNum = parseInt(params.year)
    const monthNum = parseInt(params.month)

    const startDate = new Date(yearNum, monthNum - 1, 1)
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59)

    const where: Prisma.TaskDailyWhereInput = {
      workDate: {
        gte: startDate,
        lte: endDate,
      },
    }

    if (params.teamId && params.teamId !== 'all') {
      where.teamId = BigInt(params.teamId)
    }

    return taskDailyRepository.findManyWithNestedRelations({
      where,
      orderBy: [
        { team: { name: 'asc' } },
        { workDate: 'desc' },
      ],
    })
  },

  findAllByTeam: async () => {
    return taskDailyRepository.findManyWithNestedRelations({
      orderBy: [
        { team: { name: 'asc' } },
        { workDate: 'desc' },
      ],
    })
  }
}
