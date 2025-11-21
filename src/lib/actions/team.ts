'use server'

import { apiClient } from '@/lib/api-client'
import { revalidatePath } from 'next/cache'

export interface CreateTeamData {
  name: string
}

export interface UpdateTeamData extends CreateTeamData {
  id: string
}

type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
}

// CREATE
export async function createTeam(data: CreateTeamData) {
  try {
    const res = await apiClient<ApiResponse<any>>('/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (res.success) {
      revalidatePath('/admin/teams')
    }
    return res
  } catch (error) {
    console.error('Error creating team:', error)
    return { success: false, error: 'Failed to create team' }
  }
}

// READ ALL
export async function getTeams() {
  try {
    const res = await apiClient<ApiResponse<any>>('/teams')
    return res
  } catch (error) {
    console.error('Error fetching teams:', error)
    return { success: false, error: 'Failed to fetch teams' }
  }
}

// READ ONE
export async function getTeam(id: string) {
  try {
    const res = await apiClient<ApiResponse<any>>(`/teams/${id}`)
    return res
  } catch (error) {
    console.error('Error fetching team:', error)
    return { success: false, error: 'Failed to fetch team' }
  }
}

// UPDATE
export async function updateTeam(data: UpdateTeamData) {
  try {
    const res = await apiClient<ApiResponse<any>>(`/teams/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })

    if (res.success) {
      revalidatePath('/admin/teams')
    }
    return res
  } catch (error) {
    console.error('Error updating team:', error)
    return { success: false, error: 'Failed to update team' }
  }
}

// DELETE
export async function deleteTeam(id: string) {
  try {
    const res = await apiClient<ApiResponse<void>>(`/teams/${id}`, {
      method: 'DELETE',
    })

    if (res.success) {
      revalidatePath('/admin/teams')
    }
    return res
  } catch (error) {
    console.error('Error deleting team:', error)
    return { success: false, error: 'Failed to delete team' }
  }
}
