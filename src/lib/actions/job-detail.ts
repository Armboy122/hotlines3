'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export interface CreateJobDetailData {
  jobTypeId: string
  name: string
  active?: boolean
}

export interface UpdateJobDetailData extends CreateJobDetailData {
  id: string
}

// CREATE
export async function createJobDetail(data: CreateJobDetailData) {
  try {
    const jobDetail = await prisma.jobDetail.create({
      data: {
        jobTypeId: BigInt(data.jobTypeId),
        name: data.name,
        active: data.active ?? true,
      },
    })
    
    revalidatePath('/admin/job-details')
    return { success: true, data: jobDetail }
  } catch (error) {
    console.error('Error creating job detail:', error)
    return { success: false, error: 'Failed to create job detail' }
  }
}

// READ ALL
export async function getJobDetails() {
  try {
    const jobDetails = await prisma.jobDetail.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        jobType: true,
        _count: {
          select: {
            tasks: true,
          }
        }
      },
      orderBy: [
        { jobType: { name: 'asc' } },
        { name: 'asc' },
      ],
    })
    
    return { success: true, data: jobDetails }
  } catch (error) {
    console.error('Error fetching job details:', error)
    return { success: false, error: 'Failed to fetch job details' }
  }
}

// READ ONE
export async function getJobDetail(id: string) {
  try {
    const jobDetail = await prisma.jobDetail.findUnique({
      where: { id: BigInt(id) },
      include: {
        jobType: true,
        tasks: true,
      },
    })
    
    if (!jobDetail || jobDetail.deletedAt) {
      return { success: false, error: 'Job detail not found' }
    }
    
    return { success: true, data: jobDetail }
  } catch (error) {
    console.error('Error fetching job detail:', error)
    return { success: false, error: 'Failed to fetch job detail' }
  }
}

// UPDATE
export async function updateJobDetail(data: UpdateJobDetailData) {
  try {
    const jobDetail = await prisma.jobDetail.update({
      where: { id: BigInt(data.id) },
      data: {
        jobTypeId: BigInt(data.jobTypeId),
        name: data.name,
        active: data.active ?? true,
      },
    })
    
    revalidatePath('/admin/job-details')
    return { success: true, data: jobDetail }
  } catch (error) {
    console.error('Error updating job detail:', error)
    return { success: false, error: 'Failed to update job detail' }
  }
}

// SOFT DELETE
export async function deleteJobDetail(id: string) {
  try {
    await prisma.jobDetail.update({
      where: { id: BigInt(id) },
      data: {
        deletedAt: new Date(),
      },
    })
    
    revalidatePath('/admin/job-details')
    return { success: true }
  } catch (error) {
    console.error('Error deleting job detail:', error)
    return { success: false, error: 'Failed to delete job detail' }
  }
}

// RESTORE
export async function restoreJobDetail(id: string) {
  try {
    await prisma.jobDetail.update({
      where: { id: BigInt(id) },
      data: {
        deletedAt: null,
      },
    })
    
    revalidatePath('/admin/job-details')
    return { success: true }
  } catch (error) {
    console.error('Error restoring job detail:', error)
    return { success: false, error: 'Failed to restore job detail' }
  }
}
