'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export interface CreatePeaData {
  shortname: string
  fullname: string
  operationId: string
}

export interface UpdatePeaData extends CreatePeaData {
  id: string
}

// CREATE
export async function createPea(data: CreatePeaData) {
  try {
    const pea = await prisma.pea.create({
      data: {
        shortname: data.shortname,
        fullname: data.fullname,
        operationId: BigInt(data.operationId),
      },
    })
    
    revalidatePath('/admin/peas')
    return { success: true, data: pea }
  } catch (error) {
    console.error('Error creating pea:', error)
    return { success: false, error: 'Failed to create pea' }
  }
}

// READ ALL
export async function getPeas() {
  try {
    const peas = await prisma.pea.findMany({
      include: {
        operationCenter: true,
        _count: {
          select: {
            planConductors: true,
            planCableCars: true,
          }
        }
      },
      orderBy: {
        shortname: 'asc',
      },
    })
    
    return { success: true, data: peas }
  } catch (error) {
    console.error('Error fetching peas:', error)
    return { success: false, error: 'Failed to fetch peas' }
  }
}

// READ ONE
export async function getPea(id: string) {
  try {
    const pea = await prisma.pea.findUnique({
      where: { id: BigInt(id) },
      include: {
        operationCenter: true,
        planConductors: true,
        planCableCars: true,
      },
    })
    
    if (!pea) {
      return { success: false, error: 'Pea not found' }
    }
    
    return { success: true, data: pea }
  } catch (error) {
    console.error('Error fetching pea:', error)
    return { success: false, error: 'Failed to fetch pea' }
  }
}

// UPDATE
export async function updatePea(data: UpdatePeaData) {
  try {
    const pea = await prisma.pea.update({
      where: { id: BigInt(data.id) },
      data: {
        shortname: data.shortname,
        fullname: data.fullname,
        operationId: BigInt(data.operationId),
      },
    })
    
    revalidatePath('/admin/peas')
    return { success: true, data: pea }
  } catch (error) {
    console.error('Error updating pea:', error)
    return { success: false, error: 'Failed to update pea' }
  }
}

// DELETE
export async function deletePea(id: string) {
  try {
    await prisma.pea.delete({
      where: { id: BigInt(id) },
    })
    
    revalidatePath('/admin/peas')
    return { success: true }
  } catch (error) {
    console.error('Error deleting pea:', error)
    return { success: false, error: 'Failed to delete pea' }
  }
}
