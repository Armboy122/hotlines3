import { apiClient } from '@/lib/api-client'
import type { Team } from '@/types/query-types'

export interface CreateTeamData {
  name: string
}

export interface UpdateTeamData extends CreateTeamData {
  id: string
}

export const teamService = {
  async getAll(): Promise<Team[]> {
    return apiClient.get<Team[]>('/v1/teams')
  },

  async getById(id: string): Promise<Team> {
    return apiClient.get<Team>(`/v1/teams/${id}`)
  },

  async create(data: CreateTeamData): Promise<Team> {
    return apiClient.post<Team>('/v1/teams', data)
  },

  async update(data: UpdateTeamData): Promise<Team> {
    return apiClient.put<Team>(`/v1/teams/${data.id}`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/v1/teams/${id}`)
  },
}
