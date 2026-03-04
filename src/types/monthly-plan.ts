// ============================================================
// Monthly Plan File Management Types — aligned with API v1.0
// ============================================================

export type SubmissionStatus = 'submitted' | 'pending' | 'missed'

// ── Nested types (from API responses) ────────────────────────

export interface TeamNested {
  id: number
  name: string
}

export interface PlanFileUploader {
  id: number
  username: string
}

// ── Period ────────────────────────────────────────────────────

export interface MonthlyPlanPeriod {
  id: number
  year: number
  month: number
  isLocked: boolean
  createdAt: string
}

// ── Plan File (single entity covers both team files & master plan) ─

export interface PlanFile {
  id: number
  monthlyPlanId: number
  teamId: number | null
  uploadedById: number
  fileKey: string
  fileURL: string
  fileName: string
  fileSizeBytes: number
  description: string | null
  isMasterPlan: boolean
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
  team?: TeamNested
  uploadedBy?: PlanFileUploader
}

// ── Submission Status ─────────────────────────────────────────

export interface TeamSubmissionStatus {
  team: TeamNested
  status: SubmissionStatus
  fileCount: number
}

export interface SubmissionStatusResponse {
  period: MonthlyPlanPeriod
  deadline: string
  teams: TeamSubmissionStatus[]
}

// ── Settings (flat — no nested wrapper) ───────────────────────

export interface MonthlyPlanSettings {
  lockDay: number
  autoCreateDay: number
  autoCreateTarget: string
  allowedFileTypes: string[]
  maxFileSizeMB: number | null
  reminderStartDay: number
  adminCanUploadAfterLock: boolean
}

export interface UpdateSettingsRequest {
  lockDay?: number
  autoCreateDay?: number
  autoCreateTarget?: string
  allowedFileTypes?: string[]
  maxFileSizeMB?: number | null
  reminderStartDay?: number
  adminCanUploadAfterLock?: boolean
}

// ── Presign ───────────────────────────────────────────────────

export interface PlanPresignRequest {
  fileName: string
  fileType: string
}

export interface PlanPresignResponse {
  uploadUrl: string
  fileUrl: string
  fileKey: string
}

// ── Confirm Upload ────────────────────────────────────────────

export interface ConfirmUploadRequest {
  fileKey: string
  fileURL: string
  fileName: string
  fileSizeBytes: number
  description?: string
  isMasterPlan?: boolean
  teamId?: number
}

// ── Download URL ──────────────────────────────────────────────

export interface DownloadUrlResponse {
  downloadUrl: string
}

// ── UI helpers ────────────────────────────────────────────────

export interface MonthOption {
  year: number
  month: number
  label: string
  isLocked: boolean
}
