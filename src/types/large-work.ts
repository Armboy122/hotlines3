// ============================================================
// Large Work (งานระดมทีม) Types — aligned with HNP-01 API contract
// ============================================================

export type LargeWorkStatus = 'draft' | 'planned' | 'in_progress' | 'cancelled' | 'completed'
export type LargeWorkTeamRole = 'owner' | 'participant'

// ── Request DTOs ─────────────────────────────────────────────

export interface LargeWorkRequest {
  ownerTeamId: number
  participantTeamIds: number[]
  title: string
  workType?: string | null
  startDate: string
  endDate?: string | null
  workTime?: string | null
  locationText: string
  peaId?: number | null
  operationCenterId?: number | null
  feederId?: number | null
  stationId?: number | null
  notes?: string | null
}

export type UpdateLargeWorkRequest = Partial<LargeWorkRequest> & {
  status?: LargeWorkStatus
}

// ── Response DTOs ────────────────────────────────────────────

export interface LargeWorkTeamRef {
  id: number
  name: string
  role: LargeWorkTeamRole
}

export interface LargeWorkResponse extends Omit<LargeWorkRequest, 'participantTeamIds'> {
  id: number
  createdByUserId: number
  status: LargeWorkStatus
  teams: LargeWorkTeamRef[]
  actions: {
    canEdit: boolean
    canCancel: boolean
    canStartDailyReport: boolean
  }
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

// ── Query params ─────────────────────────────────────────────

export interface LargeWorkListParams {
  from?: string
  to?: string
  teamId?: number
  status?: string
  page?: number
  limit?: number
}
