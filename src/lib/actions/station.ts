'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { isExternalMode } from '@/lib/api-config'
import { apiClient } from '@/lib/axios-client'

export interface CreateStationData {
  name: string
  codeName: string
  operationId: string
}

export interface UpdateStationData extends CreateStationData {
  id: string
}

// CREATE
export async function createStation(data: CreateStationData) {
  try {
    if (isExternalMode()) {
      // External API mode
      const response = await apiClient.post<any, any>('/api/v1/station', data)
      revalidatePath('/admin/stations')
      return { success: true, data: response }
    } else {
      // Local Prisma mode
      const station = await prisma.station.create({
        data: {
          name: data.name,
          codeName: data.codeName,
          operationId: BigInt(data.operationId),
        },
      })

      revalidatePath('/admin/stations')
      return { success: true, data: station }
    }
  } catch (error) {
    console.error('Error creating station:', error)
    return { success: false, error: 'Failed to create station' }
  }
}

// READ ALL
export async function getStations() {
  try {
    if (isExternalMode()) {
      // External API mode
      const response = await apiClient.get<any, any[]>('/api/v1/station')
      return { success: true, data: response }
    } else {
      // Local Prisma mode
      const stations = await prisma.station.findMany({
        include: {
          operationCenter: true,
          _count: {
            select: {
              feeders: true,

            }
          }
        },
        orderBy: {
          codeName: 'asc',
        },
      })

      return { success: true, data: stations }
    }
  } catch (error) {
    console.error('Error fetching stations:', error)
    return { success: false, error: 'Failed to fetch stations' }
  }
}

// READ ONE
export async function getStation(id: string) {
  try {
    if (isExternalMode()) {
      // External API mode
      const response = await apiClient.get<any, any>(`/api/v1/station/${id}`)
      return { success: true, data: response }
    } else {
      // Local Prisma mode
      const station = await prisma.station.findUnique({
        where: { id: BigInt(id) },
        include: {
          operationCenter: true,
          feeders: true,
        },
      })

      if (!station) {
        return { success: false, error: 'Station not found' }
      }

      return { success: true, data: station }
    }
  } catch (error) {
    console.error('Error fetching station:', error)
    return { success: false, error: 'Failed to fetch station' }
  }
}

// UPDATE
export async function updateStation(data: UpdateStationData) {
  try {
    if (isExternalMode()) {
      // External API mode
      const response = await apiClient.put<any, any>(`/api/v1/station/${data.id}`, data)
      revalidatePath('/admin/stations')
      return { success: true, data: response }
    } else {
      // Local Prisma mode
      const station = await prisma.station.update({
        where: { id: BigInt(data.id) },
        data: {
          name: data.name,
          codeName: data.codeName,
          operationId: BigInt(data.operationId),
        },
      })

      revalidatePath('/admin/stations')
      return { success: true, data: station }
    }
  } catch (error) {
    console.error('Error updating station:', error)
    return { success: false, error: 'Failed to update station' }
  }
}

// DELETE
export async function deleteStation(id: string) {
  try {
    if (isExternalMode()) {
      // External API mode
      await apiClient.delete(`/api/v1/station/${id}`)
      revalidatePath('/admin/stations')
      return { success: true }
    } else {
      // Local Prisma mode
      await prisma.station.delete({
        where: { id: BigInt(id) },
      })

      revalidatePath('/admin/stations')
      return { success: true }
    }
  } catch (error) {
    console.error('Error deleting station:', error)
    return { success: false, error: 'Failed to delete station' }
  }
}
