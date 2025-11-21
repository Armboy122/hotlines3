'use server'

import { apiClient } from '@/lib/api-client'
import { revalidatePath } from 'next/cache'

export interface CreateFeederData {
  code: string
  stationId: string
}

export interface UpdateFeederData extends CreateFeederData {
  id: string
}

type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
}

// CREATE
export async function createFeeder(data: CreateFeederData) {
  try {
    const res = await apiClient<ApiResponse<{ id: string; code: string; stationId: string }>>('/feeders', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (res.success) {
      revalidatePath('/admin/feeders')
    }
    return res
  } catch (error) {
    console.error('Error creating feeder:', error)
    return { success: false, error: 'Failed to create feeder' }
  }
}

// READ ALL
export async function getFeeders() {
  try {
    const res = await apiClient<ApiResponse<unknown[]>>('/feeders')
    return res
  } catch (error) {
    console.error('Error fetching feeders:', error)
    return { success: false, error: 'Failed to fetch feeders' }
  }
}

// READ ONE
export async function getFeeder(id: string) {
  try {
    const res = await apiClient<ApiResponse<{ id: string; code: string; stationId: string }>>(`/feeders/${id}`)
    return res
  } catch (error) {
    console.error('Error fetching feeder:', error)
    return { success: false, error: 'Failed to fetch feeder' }
  }
}

// UPDATE
export async function updateFeeder(data: UpdateFeederData) {
  try {
    const res = await apiClient<ApiResponse<{ id: string; code: string; stationId: string }>>(`/feeders/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })

    if (res.success) {
      revalidatePath('/admin/feeders')
    }
    return res
  } catch (error) {
    console.error('Error updating feeder:', error)
    return { success: false, error: 'Failed to update feeder' }
  }
}

// DELETE
export async function deleteFeeder(id: string) {
  try {
    const res = await apiClient<ApiResponse<void>>(`/feeders/${id}`, {
      method: 'DELETE',
    })

    if (res.success) {
      revalidatePath('/admin/feeders')
    }
    return res
  } catch (error) {
    console.error('Error deleting feeder:', error)
    return { success: false, error: 'Failed to delete feeder' }
  }
}
