'use server'

import { apiClient } from '@/lib/api-client'
import { revalidatePath } from 'next/cache'

export interface CreateStationData {
  name: string
  codeName: string
  operationId: string
}

export interface UpdateStationData extends CreateStationData {
  id: string
}

type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
}

// CREATE
export async function createStation(data: CreateStationData) {
  try {
    const res = await apiClient<ApiResponse<any>>('/stations', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (res.success) {
      revalidatePath('/admin/stations')
    }
    return res
  } catch (error) {
    console.error('Error creating station:', error)
    return { success: false, error: 'Failed to create station' }
  }
}

// READ ALL
export async function getStations() {
  try {
    const res = await apiClient<ApiResponse<any>>('/stations')
    return res
  } catch (error) {
    console.error('Error fetching stations:', error)
    return { success: false, error: 'Failed to fetch stations' }
  }
}

// READ ONE
export async function getStation(id: string) {
  try {
    const res = await apiClient<ApiResponse<any>>(`/stations/${id}`)
    return res
  } catch (error) {
    console.error('Error fetching station:', error)
    return { success: false, error: 'Failed to fetch station' }
  }
}

// UPDATE
export async function updateStation(data: UpdateStationData) {
  try {
    const res = await apiClient<ApiResponse<any>>(`/stations/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })

    if (res.success) {
      revalidatePath('/admin/stations')
    }
    return res
  } catch (error) {
    console.error('Error updating station:', error)
    return { success: false, error: 'Failed to update station' }
  }
}

// DELETE
export async function deleteStation(id: string) {
  try {
    const res = await apiClient<ApiResponse<void>>(`/stations/${id}`, {
      method: 'DELETE',
    })

    if (res.success) {
      revalidatePath('/admin/stations')
    }
    return res
  } catch (error) {
    console.error('Error deleting station:', error)
    return { success: false, error: 'Failed to delete station' }
  }
}
