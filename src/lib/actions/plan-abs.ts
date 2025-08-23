'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export interface CreatePlanAbsData {
  year: number
  deviceLabel: string
  isDone?: boolean
  doneOn?: Date | null
  isCancelled?: boolean
}

export interface UpdatePlanAbsData extends CreatePlanAbsData {
  id: string
}

// CREATE
export async function createPlanAbs(data: CreatePlanAbsData) {
  try {
    const planAbs = await prisma.planAbsItem.create({
      data: {
        year: data.year,
        deviceLabel: data.deviceLabel,
        isDone: data.isDone ?? false,
        doneOn: data.doneOn,
        isCancelled: data.isCancelled ?? false,
      },
    })
    
    revalidatePath('/admin/plan-abs')
    return { success: true, data: planAbs }
  } catch (error) {
    console.error('Error creating plan abs:', error)
    return { success: false, error: 'Failed to create plan abs' }
  }
}

// READ ALL
export async function getPlanAbsItems(year?: number) {
  try {
    const planAbsItems = await prisma.planAbsItem.findMany({
      where: {
        deletedAt: null,
        ...(year && { year }),
      },
      include: {
        _count: {
          select: {
            tasks: true,
          }
        }
      },
      orderBy: [
        { year: 'desc' },
        { deviceLabel: 'asc' },
      ],
    })
    
    return { success: true, data: planAbsItems }
  } catch (error) {
    console.error('Error fetching plan abs items:', error)
    return { success: false, error: 'Failed to fetch plan abs items' }
  }
}

// READ ONE
export async function getPlanAbs(id: string) {
  try {
    const planAbs = await prisma.planAbsItem.findUnique({
      where: { id: BigInt(id) },
      include: {
        tasks: true,
      },
    })
    
    if (!planAbs || planAbs.deletedAt) {
      return { success: false, error: 'Plan abs not found' }
    }
    
    return { success: true, data: planAbs }
  } catch (error) {
    console.error('Error fetching plan abs:', error)
    return { success: false, error: 'Failed to fetch plan abs' }
  }
}

// UPDATE
export async function updatePlanAbs(data: UpdatePlanAbsData) {
  try {
    const planAbs = await prisma.planAbsItem.update({
      where: { id: BigInt(data.id) },
      data: {
        year: data.year,
        deviceLabel: data.deviceLabel,
        isDone: data.isDone ?? false,
        doneOn: data.doneOn,
        isCancelled: data.isCancelled ?? false,
      },
    })
    
    revalidatePath('/admin/plan-abs')
    return { success: true, data: planAbs }
  } catch (error) {
    console.error('Error updating plan abs:', error)
    return { success: false, error: 'Failed to update plan abs' }
  }
}

// SOFT DELETE
export async function deletePlanAbs(id: string) {
  try {
    await prisma.planAbsItem.update({
      where: { id: BigInt(id) },
      data: {
        deletedAt: new Date(),
      },
    })
    
    revalidatePath('/admin/plan-abs')
    return { success: true }
  } catch (error) {
    console.error('Error deleting plan abs:', error)
    return { success: false, error: 'Failed to delete plan abs' }
  }
}

// MARK AS DONE
export async function markPlanAbsDone(id: string, doneOn: Date = new Date()) {
  try {
    await prisma.planAbsItem.update({
      where: { id: BigInt(id) },
      data: {
        isDone: true,
        doneOn: doneOn,
      },
    })
    
    revalidatePath('/admin/plan-abs')
    return { success: true }
  } catch (error) {
    console.error('Error marking plan abs as done:', error)
    return { success: false, error: 'Failed to mark plan abs as done' }
  }
}

// CANCEL PLAN
export async function cancelPlanAbs(id: string) {
  try {
    await prisma.planAbsItem.update({
      where: { id: BigInt(id) },
      data: {
        isCancelled: true,
      },
    })
    
    revalidatePath('/admin/plan-abs')
    return { success: true }
  } catch (error) {
    console.error('Error cancelling plan abs:', error)
    return { success: false, error: 'Failed to cancel plan abs' }
  }
}
