'use server'

import { apiClient } from '@/lib/api-client'
import { revalidatePath } from 'next/cache'

export interface CreateJobDetailData {
  name: string
}

export interface UpdateJobDetailData extends CreateJobDetailData {
  id: string
}

type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
}

// CREATE
export async function createJobDetail(data: CreateJobDetailData) {
  try {
    const res = await apiClient<ApiResponse<{ id: string; name: string }>>('/job-details', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (res.success) {
      revalidatePath('/admin/job-details')
    }
    return res
  } catch (error) {
    console.error('Error creating job detail:', error)
    return { success: false, error: 'Failed to create job detail' }
  }
}

// READ ALL
export async function getJobDetails() {
  try {
    const res = await apiClient<ApiResponse<unknown[]>>('/job-details')
    return res
  } catch (error) {
    console.error('Error fetching job details:', error)
    return { success: false, error: 'Failed to fetch job details' }
  }
}

// READ ONE
export async function getJobDetail(id: string) {
  try {
    const res = await apiClient<ApiResponse<{ id: string; name: string }>>(`/job-details/${id}`)
    return res
  } catch (error) {
    console.error('Error fetching job detail:', error)
    return { success: false, error: 'Failed to fetch job detail' }
  }
}

// UPDATE
export async function updateJobDetail(data: UpdateJobDetailData) {
  try {
    const res = await apiClient<ApiResponse<{ id: string; name: string }>>(`/job-details/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })

    if (res.success) {
      revalidatePath('/admin/job-details')
    }
    return res
  } catch (error) {
    console.error('Error updating job detail:', error)
    return { success: false, error: 'Failed to update job detail' }
  }
}

// SOFT DELETE
export async function deleteJobDetail(id: string) {
  try {
    const res = await apiClient<ApiResponse<void>>(`/job-details/${id}`, {
      method: 'DELETE',
    })

    if (res.success) {
      revalidatePath('/admin/job-details')
    }
    return res
  } catch (error) {
    console.error('Error deleting job detail:', error)
    return { success: false, error: 'Failed to delete job detail' }
  }
}

// RESTORE
export async function restoreJobDetail(id: string) {
  try {
    const res = await apiClient<ApiResponse<void>>(`/job-details/${id}/restore`, {
      method: 'POST',
    })

    if (res.success) {
      revalidatePath('/admin/job-details')
    }
    return res
  } catch (error) {
    console.error('Error restoring job detail:', error)
    return { success: false, error: 'Failed to restore job detail' }
  }
}
