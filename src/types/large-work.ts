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

// ── Execution task types ──────────────────────────────────────

export type LargeWorkTaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked' | 'cancelled'

export interface LargeWorkTaskRequest {
  assignedTeamId: number
  sequenceNo?: number | null
  pointLabel?: string | null
  locationText?: string | null
  latitude?: number | null
  longitude?: number | null
  workType?: string | null
  workDetail?: string | null
  pointCount?: number | null
  treeCount?: number | null
  itemCount?: number | null
  notes?: string | null
  metadata?: Record<string, unknown> | null
}

export interface LargeWorkTaskResponse {
  id: number
  largeWorkItemId: number
  assignedTeamId: number
  assignedTeamName: string
  sequenceNo: number | null
  pointLabel: string | null
  locationText: string | null
  latitude: number | null
  longitude: number | null
  workType: string | null
  workDetail: string | null
  pointCount: number | null
  treeCount: number | null
  itemCount: number | null
  notes: string | null
  status: LargeWorkTaskStatus
  beforePhotoUrls: string[]
  afterPhotoUrls: string[]
  completionNote: string | null
  startedAt: string | null
  startedByUserId: number | null
  completedAt: string | null
  completedByUserId: number | null
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

export interface LargeWorkOverviewTeamProgress {
  teamId: number
  teamName: string
  role: LargeWorkTeamRole
  totalTasks: number
  todoCount: number
  inProgressCount: number
  doneCount: number
  blockedCount: number
}

export interface LargeWorkOverviewResponse {
  item: LargeWorkResponse
  totalTasks: number
  todoCount: number
  inProgressCount: number
  doneCount: number
  blockedCount: number
  cancelledCount: number
  teamProgress: LargeWorkOverviewTeamProgress[]
}

export interface LargeWorkAddTasksRequest {
  tasks: LargeWorkTaskRequest[]
}

export interface LargeWorkTaskCompleteRequest {
  completionNote?: string | null
  afterPhotoUrls?: string[]
}

export interface LargeWorkTaskBlockRequest {
  reason: string
}

export interface LargeWorkTaskPhotoRequest {
  photoUrls: string[]
  photoType: 'before' | 'after'
}
