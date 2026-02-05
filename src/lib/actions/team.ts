'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { isExternalMode } from '@/lib/api-config'
import { apiClient } from '@/lib/axios-client'

export interface CreateTeamData {
  name: string
}

export interface UpdateTeamData extends CreateTeamData {
  id: string
}

// CREATE
export async function createTeam(data: CreateTeamData) {
  try {
    if (isExternalMode()) {
      // External API mode
      const response = await apiClient.post<any, any>('/api/v1/team', data)
      revalidatePath('/admin/teams')
      return { success: true, data: response }
    } else {
      // Local Prisma mode
      const team = await prisma.team.create({
        data: {
          name: data.name,
        },
      })

      revalidatePath('/admin/teams')
      return { success: true, data: team }
    }
  } catch (error) {
    console.error('Error creating team:', error)
    return { success: false, error: 'Failed to create team' }
  }
}

// READ ALL
export async function getTeams() {
  try {
    if (isExternalMode()) {
      // External API mode
      const response = await apiClient.get<any, any[]>('/api/v1/team')
      return { success: true, data: response }
    } else {
      // Local Prisma mode
      const teams = await prisma.team.findMany({
        orderBy: { name: 'asc' },
      })

      return { success: true, data: teams }
    }
  } catch (error) {
    console.error('Error fetching teams:', error)
    return { success: false, error: 'Failed to fetch teams' }
  }
}

// READ ONE
export async function getTeam(id: string) {
  try {
    if (isExternalMode()) {
      // External API mode
      const response = await apiClient.get<any, any>(`/api/v1/team/${id}`)
      return { success: true, data: response }
    } else {
      // Local Prisma mode
      const team = await prisma.team.findUnique({
        where: { id: BigInt(id) },
      })

      if (!team) {
        return { success: false, error: 'Team not found' }
      }

      return { success: true, data: team }
    }
  } catch (error) {
    console.error('Error fetching team:', error)
    return { success: false, error: 'Failed to fetch team' }
  }
}

// UPDATE
export async function updateTeam(data: UpdateTeamData) {
  try {
    if (isExternalMode()) {
      // External API mode
      const response = await apiClient.put<any, any>(`/api/v1/team/${data.id}`, data)
      revalidatePath('/admin/teams')
      return { success: true, data: response }
    } else {
      // Local Prisma mode
      const team = await prisma.team.update({
        where: { id: BigInt(data.id) },
        data: {
          name: data.name,
        },
      })

      revalidatePath('/admin/teams')
      return { success: true, data: team }
    }
  } catch (error) {
    console.error('Error updating team:', error)
    return { success: false, error: 'Failed to update team' }
  }
}

// DELETE
export async function deleteTeam(id: string) {
  try {
    if (isExternalMode()) {
      // External API mode
      await apiClient.delete(`/api/v1/team/${id}`)
      revalidatePath('/admin/teams')
      return { success: true }
    } else {
      // Local Prisma mode
      await prisma.team.delete({
        where: { id: BigInt(id) },
      })

      revalidatePath('/admin/teams')
      return { success: true }
    }
  } catch (error) {
    console.error('Error deleting team:', error)
    return { success: false, error: 'Failed to delete team' }
  }
}
