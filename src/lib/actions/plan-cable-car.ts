'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { CableCarEfficiency } from '@prisma/client'

export interface CreatePlanCableCarData {
  year: number
  peaId: string
  description?: string
  efficiencyStatus?: CableCarEfficiency | null
  isDone?: boolean
  doneOn?: Date | null
  isCancelled?: boolean
}

export interface UpdatePlanCableCarData extends CreatePlanCableCarData {
  id: string
}

// CREATE
export async function createPlanCableCar(data: CreatePlanCableCarData) {
  try {
    const planCableCar = await prisma.planCableCarItem.create({
      data: {
        year: data.year,
        peaId: BigInt(data.peaId),
        description: data.description,
        efficiencyStatus: data.efficiencyStatus,
        isDone: data.isDone ?? false,
        doneOn: data.doneOn,
        isCancelled: data.isCancelled ?? false,
      },
    })
    
    revalidatePath('/admin/plan-cable-cars')
    return { success: true, data: planCableCar }
  } catch (error) {
    console.error('Error creating plan cable car:', error)
    return { success: false, error: 'Failed to create plan cable car' }
  }
}

// READ ALL
export async function getPlanCableCars(year?: number) {
  try {
    const planCableCars = await prisma.planCableCarItem.findMany({
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
    
    return { success: true, data: planCableCars }
  } catch (error) {
    console.error('Error fetching plan cable cars:', error)
    return { success: false, error: 'Failed to fetch plan cable cars' }
  }
}

// READ ONE
export async function getPlanCableCar(id: string) {
  try {
    const planCableCar = await prisma.planCableCarItem.findUnique({
      where: { id: BigInt(id) },
      include: {
        pea: {
          include: {
            operationCenter: true,
          }
        },
      },
    })
    
    if (!planCableCar || planCableCar.deletedAt) {
      return { success: false, error: 'Plan cable car not found' }
    }
    
    return { success: true, data: planCableCar }
  } catch (error) {
    console.error('Error fetching plan cable car:', error)
    return { success: false, error: 'Failed to fetch plan cable car' }
  }
}

// UPDATE
export async function updatePlanCableCar(data: UpdatePlanCableCarData) {
  try {
    const planCableCar = await prisma.planCableCarItem.update({
      where: { id: BigInt(data.id) },
      data: {
        year: data.year,
        peaId: BigInt(data.peaId),
        description: data.description,
        efficiencyStatus: data.efficiencyStatus,
        isDone: data.isDone ?? false,
        doneOn: data.doneOn,
        isCancelled: data.isCancelled ?? false,
      },
    })
    
    revalidatePath('/admin/plan-cable-cars')
    return { success: true, data: planCableCar }
  } catch (error) {
    console.error('Error updating plan cable car:', error)
    return { success: false, error: 'Failed to update plan cable car' }
  }
}

// SOFT DELETE
export async function deletePlanCableCar(id: string) {
  try {
    await prisma.planCableCarItem.update({
      where: { id: BigInt(id) },
      data: {
        deletedAt: new Date(),
      },
    })
    
    revalidatePath('/admin/plan-cable-cars')
    return { success: true }
  } catch (error) {
    console.error('Error deleting plan cable car:', error)
    return { success: false, error: 'Failed to delete plan cable car' }
  }
}

// MARK AS DONE
export async function markPlanCableCarDone(id: string, doneOn: Date = new Date()) {
  try {
    await prisma.planCableCarItem.update({
      where: { id: BigInt(id) },
      data: {
        isDone: true,
        doneOn: doneOn,
      },
    })
    
    revalidatePath('/admin/plan-cable-cars')
    return { success: true }
  } catch (error) {
    console.error('Error marking plan cable car as done:', error)
    return { success: false, error: 'Failed to mark plan cable car as done' }
  }
}

// CANCEL PLAN
export async function cancelPlanCableCar(id: string) {
  try {
    await prisma.planCableCarItem.update({
      where: { id: BigInt(id) },
      data: {
        isCancelled: true,
      },
    })
    
    revalidatePath('/admin/plan-cable-cars')
    return { success: true }
  } catch (error) {
    console.error('Error cancelling plan cable car:', error)
    return { success: false, error: 'Failed to cancel plan cable car' }
  }
}

// GET PLAN OVERVIEW (สำหรับ Dashboard)
export async function getPlanCableCarsOverview(year?: number) {
  try {
    const result = await prisma.planCableCarItem.groupBy({
      by: ['isDone', 'isCancelled', 'efficiencyStatus'],
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
    
    const passed = result.filter(item => item.efficiencyStatus === 'PASSED').reduce((sum, item) => sum + item._count.id, 0)
    const failed = result.filter(item => item.efficiencyStatus === 'FAILED').reduce((sum, item) => sum + item._count.id, 0)
    const needsMaintenance = result.filter(item => item.efficiencyStatus === 'NEEDS_MAINTENANCE').reduce((sum, item) => sum + item._count.id, 0)
    
    return { 
      success: true, 
      data: { 
        total, 
        completed, 
        pending,
        cancelled,
        passed,
        failed,
        needsMaintenance,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        passRate: completed > 0 ? Math.round((passed / completed) * 100) : 0
      } 
    }
  } catch (error) {
    console.error('Error fetching plan cable cars overview:', error)
    return { success: false, error: 'Failed to fetch plan cable cars overview' }
  }
}
