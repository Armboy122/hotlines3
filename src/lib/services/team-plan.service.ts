import { apiClient } from '@/lib/api-client'
import type {
  TeamPlanRequest,
  UpdateTeamPlanRequest,
  TeamPlanResponse,
  TeamPlanListParams,
} from '@/types/team-plan'

export const teamPlanService = {
  // ── List ────────────────────────────────────────────────────
  async list(params: TeamPlanListParams): Promise<TeamPlanResponse[]> {
    return apiClient.get<TeamPlanResponse[]>('/v1/team-plans', { params })
  },

  // ── Detail ──────────────────────────────────────────────────
  async get(id: number): Promise<TeamPlanResponse> {
    return apiClient.get<TeamPlanResponse>(`/v1/team-plans/${id}`)
  },

  // ── Create ──────────────────────────────────────────────────
  async create(data: TeamPlanRequest): Promise<TeamPlanResponse> {
    return apiClient.post<TeamPlanResponse>('/v1/team-plans', data)
  },

  // ── Update ──────────────────────────────────────────────────
  async update(id: number, data: UpdateTeamPlanRequest): Promise<TeamPlanResponse> {
    return apiClient.put<TeamPlanResponse>(`/v1/team-plans/${id}`, data)
  },

  // ── Cancel (soft status transition) ─────────────────────────
  async cancel(id: number): Promise<TeamPlanResponse> {
    return apiClient.put<TeamPlanResponse>(`/v1/team-plans/${id}`, { status: 'cancelled' })
  },

  // ── Delete (alias to cancel/soft delete) ────────────────────
  async remove(id: number): Promise<void> {
    return apiClient.delete(`/v1/team-plans/${id}`)
  },
}
