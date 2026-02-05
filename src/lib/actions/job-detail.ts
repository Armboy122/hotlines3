'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { isExternalMode } from '@/lib/api-config'
import { apiClient } from '@/lib/axios-client'

export interface CreateJobDetailData {
  name: string
}

export interface UpdateJobDetailData extends CreateJobDetailData {
  id: string
}

// CREATE
export async function createJobDetail(data: CreateJobDetailData) {
  try {
    if (isExternalMode()) {
      // External API mode
      const response = await apiClient.post<any, any>('/api/v1/job-detail', data)
      revalidatePath('/admin/job-details')
      return { success: true, data: response }
    } else {
      // Local Prisma mode
      const jobDetail = await prisma.jobDetail.create({
        data: {
          name: data.name,
        },
      })

      revalidatePath('/admin/job-details')
      return { success: true, data: jobDetail }
    }
  } catch (error) {
    console.error('Error creating job detail:', error)
    return { success: false, error: 'Failed to create job detail' }
  }
}

// READ ALL
export async function getJobDetails() {
  try {
    if (isExternalMode()) {
      // External API mode
      const response = await apiClient.get<any, any[]>('/api/v1/job-detail')
      return { success: true, data: response }
    } else {
      // Local Prisma mode
      const jobDetails = await prisma.jobDetail.findMany({
        where: {
          deletedAt: null,
        },
        include: {
          _count: {
            select: {
              tasks: true,
            }
          }
        },
        orderBy: {
          name: 'asc',
        },
      })

      return { success: true, data: jobDetails }
    }
  } catch (error) {
    console.error('Error fetching job details:', error)
    return { success: false, error: 'Failed to fetch job details' }
  }
}

// READ ONE
export async function getJobDetail(id: string) {
  try {
    if (isExternalMode()) {
      // External API mode
      const response = await apiClient.get<any, any>(`/api/v1/job-detail/${id}`)
      return { success: true, data: response }
    } else {
      // Local Prisma mode
      const jobDetail = await prisma.jobDetail.findUnique({
        where: { id: BigInt(id) },
        include: {
          tasks: true,
        },
      })

      if (!jobDetail || jobDetail.deletedAt) {
        return { success: false, error: 'Job detail not found' }
      }

      return { success: true, data: jobDetail }
    }
  } catch (error) {
    console.error('Error fetching job detail:', error)
    return { success: false, error: 'Failed to fetch job detail' }
  }
}

// UPDATE
export async function updateJobDetail(data: UpdateJobDetailData) {
  try {
    if (isExternalMode()) {
      // External API mode
      const response = await apiClient.put<any, any>(`/api/v1/job-detail/${data.id}`, data)
      revalidatePath('/admin/job-details')
      return { success: true, data: response }
    } else {
      // Local Prisma mode
      const jobDetail = await prisma.jobDetail.update({
        where: { id: BigInt(data.id) },
        data: {
          name: data.name,
        },
      })

      revalidatePath('/admin/job-details')
      return { success: true, data: jobDetail }
    }
  } catch (error) {
    console.error('Error updating job detail:', error)
    return { success: false, error: 'Failed to update job detail' }
  }
}

// SOFT DELETE
export async function deleteJobDetail(id: string) {
  try {
    if (isExternalMode()) {
      // External API mode
      await apiClient.delete(`/api/v1/job-detail/${id}`)
      revalidatePath('/admin/job-details')
      return { success: true }
    } else {
      // Local Prisma mode
      await prisma.jobDetail.update({
        where: { id: BigInt(id) },
        data: {
          deletedAt: new Date(),
        },
      })

      revalidatePath('/admin/job-details')
      return { success: true }
    }
  } catch (error) {
    console.error('Error deleting job detail:', error)
    return { success: false, error: 'Failed to delete job detail' }
  }
}

// RESTORE
export async function restoreJobDetail(id: string) {
  try {
    if (isExternalMode()) {
      // External API mode
      await apiClient.post(`/api/v1/job-detail/${id}/restore`)
      revalidatePath('/admin/job-details')
      return { success: true }
    } else {
      // Local Prisma mode
      await prisma.jobDetail.update({
        where: { id: BigInt(id) },
        data: {
          deletedAt: null,
        },
      })

      revalidatePath('/admin/job-details')
      return { success: true }
    }
  } catch (error) {
    console.error('Error restoring job detail:', error)
    return { success: false, error: 'Failed to restore job detail' }
  }
}
