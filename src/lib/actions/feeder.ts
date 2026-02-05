'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { isExternalMode } from '@/lib/api-config'
import { apiClient } from '@/lib/axios-client'

export interface CreateFeederData {
  code: string
  stationId: string
}

export interface UpdateFeederData extends CreateFeederData {
  id: string
}

// CREATE
export async function createFeeder(data: CreateFeederData) {
  try {
    if (isExternalMode()) {
      // External API mode
      const response = await apiClient.post<any, any>('/api/v1/feeder', data)
      revalidatePath('/admin/feeders')
      return { success: true, data: response }
    } else {
      // Local Prisma mode
      const feeder = await prisma.feeder.create({
        data: {
          code: data.code,
          stationId: BigInt(data.stationId),
        },
      })

      revalidatePath('/admin/feeders')
      return { success: true, data: feeder }
    }
  } catch (error) {
    console.error('Error creating feeder:', error)
    return { success: false, error: 'Failed to create feeder' }
  }
}

// READ ALL
export async function getFeeders() {
  try {
    if (isExternalMode()) {
      // External API mode
      const response = await apiClient.get<any, any[]>('/api/v1/feeder')
      return { success: true, data: response }
    } else {
      // Local Prisma mode
      const feeders = await prisma.feeder.findMany({
        include: {
          station: {
            include: {
              operationCenter: true,
            }
          },
          _count: {
            select: {
              tasks: true,
            }
          }
        },
        orderBy: {
          code: 'asc',
        },
      })

      return { success: true, data: feeders }
    }
  } catch (error) {
    console.error('Error fetching feeders:', error)
    return { success: false, error: 'Failed to fetch feeders' }
  }
}

// READ ONE
export async function getFeeder(id: string) {
  try {
    if (isExternalMode()) {
      // External API mode
      const response = await apiClient.get<any, any>(`/api/v1/feeder/${id}`)
      return { success: true, data: response }
    } else {
      // Local Prisma mode
      const feeder = await prisma.feeder.findUnique({
        where: { id: BigInt(id) },
        include: {
          station: {
            include: {
              operationCenter: true,
            }
          },
          tasks: true,
        },
      })

      if (!feeder) {
        return { success: false, error: 'Feeder not found' }
      }

      return { success: true, data: feeder }
    }
  } catch (error) {
    console.error('Error fetching feeder:', error)
    return { success: false, error: 'Failed to fetch feeder' }
  }
}

// UPDATE
export async function updateFeeder(data: UpdateFeederData) {
  try {
    if (isExternalMode()) {
      // External API mode
      const response = await apiClient.put<any, any>(`/api/v1/feeder/${data.id}`, data)
      revalidatePath('/admin/feeders')
      return { success: true, data: response }
    } else {
      // Local Prisma mode
      const feeder = await prisma.feeder.update({
        where: { id: BigInt(data.id) },
        data: {
          code: data.code,
          stationId: BigInt(data.stationId),
        },
      })

      revalidatePath('/admin/feeders')
      return { success: true, data: feeder }
    }
  } catch (error) {
    console.error('Error updating feeder:', error)
    return { success: false, error: 'Failed to update feeder' }
  }
}

// DELETE
export async function deleteFeeder(id: string) {
  try {
    if (isExternalMode()) {
      // External API mode
      await apiClient.delete(`/api/v1/feeder/${id}`)
      revalidatePath('/admin/feeders')
      return { success: true }
    } else {
      // Local Prisma mode
      await prisma.feeder.delete({
        where: { id: BigInt(id) },
      })

      revalidatePath('/admin/feeders')
      return { success: true }
    }
  } catch (error) {
    console.error('Error deleting feeder:', error)
    return { success: false, error: 'Failed to delete feeder' }
  }
}
