// ============================================================
// Team Plan Types — aligned with HNP-01 API contract
// ============================================================

export type TeamPlanStatus = 'draft' | 'planned' | 'cancelled' | 'completed'

// ── Request DTOs ─────────────────────────────────────────────

export interface TeamPlanRequest {
  teamId: number
  title: string
  workType?: string | null
  startDate?: string | null
  endDate?: string | null
  workTime?: string | null
  locationText: string
  peaId?: number | null
  operationCenterId?: number | null
  feederId?: number | null
  stationId?: number | null
  notes?: string | null
}

export type UpdateTeamPlanRequest = Partial<TeamPlanRequest> & {
  status?: TeamPlanStatus
}

// ── Response DTOs ────────────────────────────────────────────

export interface TeamPlanActions {
  canEdit: boolean
  canDelete: boolean
}

export interface TeamPlanResponse extends TeamPlanRequest {
  id: number
  createdByUserId: number
  status: TeamPlanStatus
  dailyTaskId: number | null
  team?: { id: number; name: string }
  createdBy?: { id: number; username: string; displayName: string | null }
  actions: TeamPlanActions
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

// ── Query params ─────────────────────────────────────────────

export interface TeamPlanListParams {
  from?: string
  to?: string
  teamId?: number
  status?: string
  page?: number
  limit?: number
}
