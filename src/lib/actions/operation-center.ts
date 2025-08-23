'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export interface CreateOperationCenterData {
  name: string
}

export interface UpdateOperationCenterData extends CreateOperationCenterData {
  id: string
}

// CREATE
export async function createOperationCenter(data: CreateOperationCenterData) {
  try {
    const operationCenter = await prisma.operationCenter.create({
      data: {
        name: data.name,
      },
    })
    
    revalidatePath('/admin/operation-centers')
    return { success: true, data: operationCenter }
  } catch (error) {
    console.error('Error creating operation center:', error)
    return { success: false, error: 'Failed to create operation center' }
  }
}

// READ ALL
export async function getOperationCenters() {
  try {
    const operationCenters = await prisma.operationCenter.findMany({
      include: {
        _count: {
          select: {
            peas: true,
            stations: true,
          }
        }
      },
      orderBy: {
        name: 'asc',
      },
    })
    
    return { success: true, data: operationCenters }
  } catch (error) {
    console.error('Error fetching operation centers:', error)
    return { success: false, error: 'Failed to fetch operation centers' }
  }
}

// READ ONE
export async function getOperationCenter(id: string) {
  try {
    const operationCenter = await prisma.operationCenter.findUnique({
      where: { id: BigInt(id) },
      include: {
        peas: true,
        stations: true,
      },
    })
    
    if (!operationCenter) {
      return { success: false, error: 'Operation center not found' }
    }
    
    return { success: true, data: operationCenter }
  } catch (error) {
    console.error('Error fetching operation center:', error)
    return { success: false, error: 'Failed to fetch operation center' }
  }
}

// UPDATE
export async function updateOperationCenter(data: UpdateOperationCenterData) {
  try {
    const operationCenter = await prisma.operationCenter.update({
      where: { id: BigInt(data.id) },
      data: {
        name: data.name,
      },
    })
    
    revalidatePath('/admin/operation-centers')
    return { success: true, data: operationCenter }
  } catch (error) {
    console.error('Error updating operation center:', error)
    return { success: false, error: 'Failed to update operation center' }
  }
}

// DELETE
export async function deleteOperationCenter(id: string) {
  try {
    await prisma.operationCenter.delete({
      where: { id: BigInt(id) },
    })
    
    revalidatePath('/admin/operation-centers')
    return { success: true }
  } catch (error) {
    console.error('Error deleting operation center:', error)
    return { success: false, error: 'Failed to delete operation center' }
  }
}
