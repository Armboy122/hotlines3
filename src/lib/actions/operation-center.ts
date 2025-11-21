'use server'

import { apiClient } from '@/lib/api-client'
import { revalidatePath } from 'next/cache'

export interface CreateOperationCenterData {
  name: string
}

export interface UpdateOperationCenterData extends CreateOperationCenterData {
  id: string
}

type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
}

// CREATE
export async function createOperationCenter(data: CreateOperationCenterData) {
  try {
    const res = await apiClient<ApiResponse<{ id: string; name: string }>>('/operation-centers', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (res.success) {
      revalidatePath('/admin/operation-centers')
    }
    return res
  } catch (error) {
    console.error('Error creating operation center:', error)
    return { success: false, error: 'Failed to create operation center' }
  }
}

// READ ALL
export async function getOperationCenters() {
  try {
    const res = await apiClient<ApiResponse<unknown[]>>('/operation-centers')
    return res
  } catch (error) {
    console.error('Error fetching operation centers:', error)
    return { success: false, error: 'Failed to fetch operation centers' }
  }
}

// READ ONE
export async function getOperationCenter(id: string) {
  try {
    const res = await apiClient<ApiResponse<{ id: string; name: string }>>(`/operation-centers/${id}`)
    return res
  } catch (error) {
    console.error('Error fetching operation center:', error)
    return { success: false, error: 'Failed to fetch operation center' }
  }
}

// UPDATE
export async function updateOperationCenter(data: UpdateOperationCenterData) {
  try {
    const res = await apiClient<ApiResponse<{ id: string; name: string }>>(`/operation-centers/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })

    if (res.success) {
      revalidatePath('/admin/operation-centers')
    }
    return res
  } catch (error) {
    console.error('Error updating operation center:', error)
    return { success: false, error: 'Failed to update operation center' }
  }
}

// DELETE
export async function deleteOperationCenter(id: string) {
  try {
    const res = await apiClient<ApiResponse<void>>(`/operation-centers/${id}`, {
      method: 'DELETE',
    })

    if (res.success) {
      revalidatePath('/admin/operation-centers')
    }
    return res
  } catch (error) {
    console.error('Error deleting operation center:', error)
    return { success: false, error: 'Failed to delete operation center' }
  }
}
