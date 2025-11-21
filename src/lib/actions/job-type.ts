'use server'

import { apiClient } from '@/lib/api-client'
import { revalidatePath } from 'next/cache'

export interface CreateJobTypeData {
  name: string
}

export interface UpdateJobTypeData extends CreateJobTypeData {
  id: string
}

type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
}

// CREATE
export async function createJobType(data: CreateJobTypeData) {
  try {
    const res = await apiClient<ApiResponse<any>>('/job-types', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (res.success) {
      revalidatePath('/admin/job-types')
    }
    return res
  } catch (error) {
    console.error('Error creating job type:', error)
    return { success: false, error: 'Failed to create job type' }
  }
}

// READ ALL
export async function getJobTypes() {
  try {
    const res = await apiClient<ApiResponse<any>>('/job-types')
    return res
  } catch (error) {
    console.error('Error fetching job types:', error)
    return { success: false, error: 'Failed to fetch job types' }
  }
}

// READ ONE
export async function getJobType(id: string) {
  try {
    const res = await apiClient<ApiResponse<any>>(`/job-types/${id}`)
    return res
  } catch (error) {
    console.error('Error fetching job type:', error)
    return { success: false, error: 'Failed to fetch job type' }
  }
}

// UPDATE
export async function updateJobType(data: UpdateJobTypeData) {
  try {
    const res = await apiClient<ApiResponse<any>>(`/job-types/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })

    if (res.success) {
      revalidatePath('/admin/job-types')
    }
    return res
  } catch (error) {
    console.error('Error updating job type:', error)
    return { success: false, error: 'Failed to update job type' }
  }
}

// DELETE
export async function deleteJobType(id: string) {
  try {
    const res = await apiClient<ApiResponse<void>>(`/job-types/${id}`, {
      method: 'DELETE',
    })

    if (res.success) {
      revalidatePath('/admin/job-types')
    }
    return res
  } catch (error) {
    console.error('Error deleting job type:', error)
    return { success: false, error: 'Failed to delete job type' }
  }
}
