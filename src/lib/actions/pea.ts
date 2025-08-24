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

// CREATE MULTIPLE
export async function createMultiplePeas(peasData: CreatePeaData[]) {
  try {
    // ตรวจสอบชื่อย่อซ้ำในฐานข้อมูล
    const existingShortnameSet = new Set()
    const existingPeas = await prisma.pea.findMany({
      select: { shortname: true }
    })
    existingPeas.forEach(pea => existingShortnameSet.add(pea.shortname.toLowerCase()))

    // ตรวจสอบชื่อซ้ำ
    const duplicates = peasData.filter(pea => 
      existingShortnameSet.has(pea.shortname.toLowerCase())
    )
    
    if (duplicates.length > 0) {
      return { 
        success: false, 
        error: `ชื่อย่อ "${duplicates.map(d => d.shortname).join(', ')}" มีอยู่แล้วในระบบ` 
      }
    }

    // ตรวจสอบชื่อซ้ำในข้อมูลที่ส่งมา
    const inputShortnameSet = new Set()
    const inputDuplicates = []
    
    for (const pea of peasData) {
      const shortnameLower = pea.shortname.toLowerCase()
      if (inputShortnameSet.has(shortnameLower)) {
        inputDuplicates.push(pea.shortname)
      }
      inputShortnameSet.add(shortnameLower)
    }
    
    if (inputDuplicates.length > 0) {
      return { 
        success: false, 
        error: `ชื่อย่อ "${inputDuplicates.join(', ')}" ซ้ำกันในข้อมูลที่ส่งมา` 
      }
    }

    // สร้างข้อมูลทั้งหมดใน transaction
    const result = await prisma.$transaction(
      peasData.map(pea => 
        prisma.pea.create({
          data: {
            shortname: pea.shortname,
            fullname: pea.fullname,
            operationId: BigInt(pea.operationId),
          },
        })
      )
    )
    
    revalidatePath('/admin/peas')
    return { success: true, data: result }
  } catch (error) {
    console.error('Error creating multiple peas:', error)
    return { success: false, error: 'Failed to create multiple peas' }
  }
}
