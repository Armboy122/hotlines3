'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export interface CreatePlanConductorData {
  year: number
  peaId: string
  description?: string
  isDone?: boolean
  doneOn?: Date | null
  isCancelled?: boolean
}

export interface UpdatePlanConductorData extends CreatePlanConductorData {
  id: string
}

// CREATE
export async function createPlanConductor(data: CreatePlanConductorData) {
  try {
    const planConductor = await prisma.planConductorItem.create({
      data: {
        year: data.year,
        peaId: BigInt(data.peaId),
        description: data.description,
        isDone: data.isDone ?? false,
        doneOn: data.doneOn,
        isCancelled: data.isCancelled ?? false,
      },
    })
    
    revalidatePath('/admin/plan-conductors')
    return { success: true, data: planConductor }
  } catch (error) {
    console.error('Error creating plan conductor:', error)
    return { success: false, error: 'Failed to create plan conductor' }
  }
}

// READ ALL
export async function getPlanConductors(year?: number) {
  try {
    const planConductors = await prisma.planConductorItem.findMany({
      where: {
        deletedAt: null,
        ...(year && { year }),
      },
      include: {
        pea: {
          include: {
            operationCenter: true,
          }
        },
      },
      orderBy: [
        { year: 'desc' },
        { pea: { shortname: 'asc' } },
      ],
    })
    
    return { success: true, data: planConductors }
  } catch (error) {
    console.error('Error fetching plan conductors:', error)
    return { success: false, error: 'Failed to fetch plan conductors' }
  }
}

// READ ONE
export async function getPlanConductor(id: string) {
  try {
    const planConductor = await prisma.planConductorItem.findUnique({
      where: { id: BigInt(id) },
      include: {
        pea: {
          include: {
            operationCenter: true,
          }
        },
      },
    })
    
    if (!planConductor || planConductor.deletedAt) {
      return { success: false, error: 'Plan conductor not found' }
    }
    
    return { success: true, data: planConductor }
  } catch (error) {
    console.error('Error fetching plan conductor:', error)
    return { success: false, error: 'Failed to fetch plan conductor' }
  }
}

// UPDATE
export async function updatePlanConductor(data: UpdatePlanConductorData) {
  try {
    const planConductor = await prisma.planConductorItem.update({
      where: { id: BigInt(data.id) },
      data: {
        year: data.year,
        peaId: BigInt(data.peaId),
        description: data.description,
        isDone: data.isDone ?? false,
        doneOn: data.doneOn,
        isCancelled: data.isCancelled ?? false,
      },
    })
    
    revalidatePath('/admin/plan-conductors')
    return { success: true, data: planConductor }
  } catch (error) {
    console.error('Error updating plan conductor:', error)
    return { success: false, error: 'Failed to update plan conductor' }
  }
}

// SOFT DELETE
export async function deletePlanConductor(id: string) {
  try {
    await prisma.planConductorItem.update({
      where: { id: BigInt(id) },
      data: {
        deletedAt: new Date(),
      },
    })
    
    revalidatePath('/admin/plan-conductors')
    return { success: true }
  } catch (error) {
    console.error('Error deleting plan conductor:', error)
    return { success: false, error: 'Failed to delete plan conductor' }
  }
}

// MARK AS DONE
export async function markPlanConductorDone(id: string, doneOn: Date = new Date()) {
  try {
    await prisma.planConductorItem.update({
      where: { id: BigInt(id) },
      data: {
        isDone: true,
        doneOn: doneOn,
      },
    })
    
    revalidatePath('/admin/plan-conductors')
    return { success: true }
  } catch (error) {
    console.error('Error marking plan conductor as done:', error)
    return { success: false, error: 'Failed to mark plan conductor as done' }
  }
}

// CANCEL PLAN
export async function cancelPlanConductor(id: string) {
  try {
    await prisma.planConductorItem.update({
      where: { id: BigInt(id) },
      data: {
        isCancelled: true,
      },
    })
    
    revalidatePath('/admin/plan-conductors')
    return { success: true }
  } catch (error) {
    console.error('Error cancelling plan conductor:', error)
    return { success: false, error: 'Failed to cancel plan conductor' }
  }
}

// GET PLAN OVERVIEW (สำหรับ Dashboard)
export async function getPlanConductorsOverview(year?: number) {
  try {
    const result = await prisma.planConductorItem.groupBy({
      by: ['isDone', 'isCancelled'],
      where: {
        deletedAt: null,
        ...(year && { year }),
      },
      _count: {
        id: true,
      },
    })
    
    const total = result.reduce((sum, item) => sum + item._count.id, 0)
    const completed = result.filter(item => item.isDone && !item.isCancelled).reduce((sum, item) => sum + item._count.id, 0)
    const cancelled = result.filter(item => item.isCancelled).reduce((sum, item) => sum + item._count.id, 0)
    const pending = total - completed - cancelled
    
    return { 
      success: true, 
      data: { 
        total, 
        completed, 
        pending,
        cancelled,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      } 
    }
  } catch (error) {
    console.error('Error fetching plan conductors overview:', error)
    return { success: false, error: 'Failed to fetch plan conductors overview' }
  }
}
