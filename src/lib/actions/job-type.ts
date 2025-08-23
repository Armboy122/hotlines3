'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export interface CreateJobTypeData {
  name: string
}

export interface UpdateJobTypeData extends CreateJobTypeData {
  id: string
}

// CREATE
export async function createJobType(data: CreateJobTypeData) {
  try {
    const jobType = await prisma.jobType.create({
      data: {
        name: data.name,
      },
    })
    
    revalidatePath('/admin/job-types')
    return { success: true, data: jobType }
  } catch (error) {
    console.error('Error creating job type:', error)
    return { success: false, error: 'Failed to create job type' }
  }
}

// READ ALL
export async function getJobTypes() {
  try {
    const jobTypes = await prisma.jobType.findMany({
      include: {
        _count: {
          select: {
            details: true,
            tasks: true,
          }
        }
      },
      orderBy: {
        name: 'asc',
      },
    })
    
    return { success: true, data: jobTypes }
  } catch (error) {
    console.error('Error fetching job types:', error)
    return { success: false, error: 'Failed to fetch job types' }
  }
}

// READ ONE
export async function getJobType(id: string) {
  try {
    const jobType = await prisma.jobType.findUnique({
      where: { id: BigInt(id) },
      include: {
        details: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            name: 'asc',
          }
        },
        tasks: true,
      },
    })
    
    if (!jobType) {
      return { success: false, error: 'Job type not found' }
    }
    
    return { success: true, data: jobType }
  } catch (error) {
    console.error('Error fetching job type:', error)
    return { success: false, error: 'Failed to fetch job type' }
  }
}

// UPDATE
export async function updateJobType(data: UpdateJobTypeData) {
  try {
    const jobType = await prisma.jobType.update({
      where: { id: BigInt(data.id) },
      data: {
        name: data.name,
      },
    })
    
    revalidatePath('/admin/job-types')
    return { success: true, data: jobType }
  } catch (error) {
    console.error('Error updating job type:', error)
    return { success: false, error: 'Failed to update job type' }
  }
}

// DELETE
export async function deleteJobType(id: string) {
  try {
    await prisma.jobType.delete({
      where: { id: BigInt(id) },
    })
    
    revalidatePath('/admin/job-types')
    return { success: true }
  } catch (error) {
    console.error('Error deleting job type:', error)
    return { success: false, error: 'Failed to delete job type' }
  }
}
