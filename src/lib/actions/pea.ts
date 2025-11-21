'use server'

import { apiClient } from '@/lib/api-client'
import { revalidatePath } from 'next/cache'

export interface CreatePeaData {
  shortname: string
  fullname: string
  operationId: string
}

export interface UpdatePeaData extends CreatePeaData {
  id: string
}

type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
}

// CREATE
export async function createPea(data: CreatePeaData) {
  try {
    const res = await apiClient<ApiResponse<{ id: string; shortname: string; fullname: string; operationId: string }>>('/peas', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (res.success) {
      revalidatePath('/admin/peas')
    }
    return res
  } catch (error) {
    console.error('Error creating pea:', error)
    return { success: false, error: 'Failed to create pea' }
  }
}

// READ ALL
export async function getPeas() {
  try {
    const res = await apiClient<ApiResponse<unknown[]>>('/peas')
    return res
  } catch (error) {
    console.error('Error fetching peas:', error)
    return { success: false, error: 'Failed to fetch peas' }
  }
}

// READ ONE
export async function getPea(id: string) {
  try {
    const res = await apiClient<ApiResponse<{ id: string; shortname: string; fullname: string; operationId: string }>>(`/peas/${id}`)
    return res
  } catch (error) {
    console.error('Error fetching pea:', error)
    return { success: false, error: 'Failed to fetch pea' }
  }
}

// UPDATE
export async function updatePea(data: UpdatePeaData) {
  try {
    const res = await apiClient<ApiResponse<{ id: string; shortname: string; fullname: string; operationId: string }>>(`/peas/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })

    if (res.success) {
      revalidatePath('/admin/peas')
    }
    return res
  } catch (error) {
    console.error('Error updating pea:', error)
    return { success: false, error: 'Failed to update pea' }
  }
}

// DELETE
export async function deletePea(id: string) {
  try {
    const res = await apiClient<ApiResponse<void>>(`/peas/${id}`, {
      method: 'DELETE',
    })

    if (res.success) {
      revalidatePath('/admin/peas')
    }
    return res
  } catch (error) {
    console.error('Error deleting pea:', error)
    return { success: false, error: 'Failed to delete pea' }
  }
}

// CREATE MULTIPLE
export async function createMultiplePeas(peasData: CreatePeaData[]) {
  try {
    const res = await apiClient<ApiResponse<unknown[]>>('/peas/multiple', {
      method: 'POST',
      body: JSON.stringify(peasData),
    })

    if (res.success) {
      revalidatePath('/admin/peas')
    }
    return res
  } catch (error) {
    console.error('Error creating multiple peas:', error)
    return { success: false, error: 'Failed to create multiple peas' }
  }
}
