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
    return apiClient.get<Team[]>('/api/v1/team')
  },

  async getById(id: string): Promise<Team> {
    return apiClient.get<Team>(`/api/v1/team/${id}`)
  },

  async create(data: CreateTeamData): Promise<Team> {
    return apiClient.post<Team>('/api/v1/team', data)
  },

  async update(data: UpdateTeamData): Promise<Team> {
    return apiClient.put<Team>(`/api/v1/team/${data.id}`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/api/v1/team/${id}`)
  },
}
