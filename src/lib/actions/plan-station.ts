'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export interface CreatePlanStationData {
  year: number
  stationId: string
  isDone?: boolean
  doneOn?: Date | null
}

export interface UpdatePlanStationData extends CreatePlanStationData {
  id: string
}

// CREATE
export async function createPlanStation(data: CreatePlanStationData) {
  try {
    const planStation = await prisma.planStationItem.create({
      data: {
        year: data.year,
        stationId: BigInt(data.stationId),
        isDone: data.isDone ?? false,
        doneOn: data.doneOn,
      },
    })
    
    revalidatePath('/admin/plan-stations')
    return { success: true, data: planStation }
  } catch (error) {
    console.error('Error creating plan station:', error)
    return { success: false, error: 'Failed to create plan station' }
  }
}

// READ ALL
export async function getPlanStations(year?: number) {
  try {
    const planStations = await prisma.planStationItem.findMany({
      where: {
        deletedAt: null,
        ...(year && { year }),
      },
      include: {
        station: {
          include: {
            operationCenter: true,
          }
        },
      },
      orderBy: [
        { year: 'desc' },
        { station: { codeName: 'asc' } },
      ],
    })
    
    return { success: true, data: planStations }
  } catch (error) {
    console.error('Error fetching plan stations:', error)
    return { success: false, error: 'Failed to fetch plan stations' }
  }
}

// READ ONE
export async function getPlanStation(id: string) {
  try {
    const planStation = await prisma.planStationItem.findUnique({
      where: { id: BigInt(id) },
      include: {
        station: {
          include: {
            operationCenter: true,
          }
        },
      },
    })
    
    if (!planStation || planStation.deletedAt) {
      return { success: false, error: 'Plan station not found' }
    }
    
    return { success: true, data: planStation }
  } catch (error) {
    console.error('Error fetching plan station:', error)
    return { success: false, error: 'Failed to fetch plan station' }
  }
}

// UPDATE
export async function updatePlanStation(data: UpdatePlanStationData) {
  try {
    const planStation = await prisma.planStationItem.update({
      where: { id: BigInt(data.id) },
      data: {
        year: data.year,
        stationId: BigInt(data.stationId),
        isDone: data.isDone ?? false,
        doneOn: data.doneOn,
      },
    })
    
    revalidatePath('/admin/plan-stations')
    return { success: true, data: planStation }
  } catch (error) {
    console.error('Error updating plan station:', error)
    return { success: false, error: 'Failed to update plan station' }
  }
}

// SOFT DELETE
export async function deletePlanStation(id: string) {
  try {
    await prisma.planStationItem.update({
      where: { id: BigInt(id) },
      data: {
        deletedAt: new Date(),
      },
    })
    
    revalidatePath('/admin/plan-stations')
    return { success: true }
  } catch (error) {
    console.error('Error deleting plan station:', error)
    return { success: false, error: 'Failed to delete plan station' }
  }
}

// MARK AS DONE
export async function markPlanStationDone(id: string, doneOn: Date = new Date()) {
  try {
    await prisma.planStationItem.update({
      where: { id: BigInt(id) },
      data: {
        isDone: true,
        doneOn: doneOn,
      },
    })
    
    revalidatePath('/admin/plan-stations')
    return { success: true }
  } catch (error) {
    console.error('Error marking plan station as done:', error)
    return { success: false, error: 'Failed to mark plan station as done' }
  }
}

// GET PLAN OVERVIEW (สำหรับ Dashboard)
export async function getPlanStationsOverview(year?: number) {
  try {
    const result = await prisma.planStationItem.groupBy({
      by: ['isDone'],
      where: {
        deletedAt: null,
        ...(year && { year }),
      },
      _count: {
        id: true,
      },
    })
    
    const total = result.reduce((sum, item) => sum + item._count.id, 0)
    const completed = result.find(item => item.isDone)?._count.id || 0
    const pending = total - completed
    
    return { 
      success: true, 
      data: { 
        total, 
        completed, 
        pending,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      } 
    }
  } catch (error) {
    console.error('Error fetching plan stations overview:', error)
    return { success: false, error: 'Failed to fetch plan stations overview' }
  }
}
