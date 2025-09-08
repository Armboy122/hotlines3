'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { VoltageLevel } from '@prisma/client'

export interface CreatePlanLineData {
  year: number
  feederId: string
  level: VoltageLevel
  planDistanceKm: number
  isCancelled?: boolean
}

export interface UpdatePlanLineData extends CreatePlanLineData {
  id: string
}

// CREATE
export async function createPlanLine(data: CreatePlanLineData) {
  try {
    const planLine = await prisma.planLineItem.create({
      data: {
        year: data.year,
        feederId: BigInt(data.feederId),
        level: data.level,
        planDistanceKm: data.planDistanceKm,
        isCancelled: data.isCancelled ?? false,
      },
    })
    
    revalidatePath('/admin/plan-lines')
    return { success: true, data: planLine }
  } catch (error) {
    console.error('Error creating plan line:', error)
    return { success: false, error: 'Failed to create plan line' }
  }
}

// READ ALL
export async function getPlanLines(year?: number) {
  try {
    const planLines = await prisma.planLineItem.findMany({
      where: {
        deletedAt: null,
        ...(year && { year }),
      },
      orderBy: [
        { year: 'desc' },
        { feederId: 'asc' },
        { level: 'asc' },
      ],
    })
    
    return { success: true, data: planLines }
  } catch (error) {
    console.error('Error fetching plan lines:', error)
    return { success: false, error: 'Failed to fetch plan lines' }
  }
}

// READ ONE
export async function getPlanLine(id: string) {
  try {
    const planLine = await prisma.planLineItem.findUnique({
      where: { id: BigInt(id) },
    })
    
    if (!planLine || planLine.deletedAt) {
      return { success: false, error: 'Plan line not found' }
    }
    
    return { success: true, data: planLine }
  } catch (error) {
    console.error('Error fetching plan line:', error)
    return { success: false, error: 'Failed to fetch plan line' }
  }
}

// UPDATE
export async function updatePlanLine(data: UpdatePlanLineData) {
  try {
    const planLine = await prisma.planLineItem.update({
      where: { id: BigInt(data.id) },
      data: {
        year: data.year,
        feederId: BigInt(data.feederId),
        level: data.level,
        planDistanceKm: data.planDistanceKm,
        isCancelled: data.isCancelled ?? false,
      },
    })
    
    revalidatePath('/admin/plan-lines')
    return { success: true, data: planLine }
  } catch (error) {
    console.error('Error updating plan line:', error)
    return { success: false, error: 'Failed to update plan line' }
  }
}

// SOFT DELETE
export async function deletePlanLine(id: string) {
  try {
    await prisma.planLineItem.update({
      where: { id: BigInt(id) },
      data: {
        deletedAt: new Date(),
      },
    })
    
    revalidatePath('/admin/plan-lines')
    return { success: true }
  } catch (error) {
    console.error('Error deleting plan line:', error)
    return { success: false, error: 'Failed to delete plan line' }
  }
}

// CANCEL PLAN
export async function cancelPlanLine(id: string) {
  try {
    await prisma.planLineItem.update({
      where: { id: BigInt(id) },
      data: {
        isCancelled: true,
      },
    })
    
    revalidatePath('/admin/plan-lines')
    return { success: true }
  } catch (error) {
    console.error('Error cancelling plan line:', error)
    return { success: false, error: 'Failed to cancel plan line' }
  }
}

// GET PLAN OVERVIEW (สำหรับ Dashboard)
export async function getPlanLinesOverview(year?: number) {
  try {
    const result = await prisma.planLineItem.groupBy({
      by: ['isCancelled'],
      where: {
        deletedAt: null,
        ...(year && { year }),
      },
      _count: {
        id: true,
      },
      _sum: {
        planDistanceKm: true,
      },
    })
    
    const total = result.reduce((sum, item) => sum + item._count.id, 0)
    const cancelled = result.filter(item => item.isCancelled).reduce((sum, item) => sum + item._count.id, 0)
    const active = total - cancelled
    const totalDistance = result.reduce((sum, item) => sum + (Number(item._sum.planDistanceKm) || 0), 0)
    
    return { 
      success: true, 
      data: { 
        total, 
        active,
        cancelled,
        totalDistance: Math.round(totalDistance * 100) / 100,
        cancelRate: total > 0 ? Math.round((cancelled / total) * 100) : 0
      } 
    }
  } catch (error) {
    console.error('Error fetching plan lines overview:', error)
    return { success: false, error: 'Failed to fetch plan lines overview' }
  }
}
