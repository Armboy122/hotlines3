// ============================================================
// Daily Report Draft Types — aligned with HNP-01 API contract
// ============================================================

import type { PlanningItemType } from './planning-calendar'

// ── Source reference ─────────────────────────────────────────

export interface DailyReportDraftSource {
  sourceType: PlanningItemType
  sourceId: number
  title: string
}

// ── Source candidate (from /sources endpoint) ────────────────

export interface DailyReportDraftSourceCandidate {
  sourceType: PlanningItemType
  sourceId: number
  title: string
  workDate?: string
  teamId?: number | null
  teamName?: string | null
  location?: string | null
  detail?: string | null
}

export interface DailyReportDraftSourcesResponse {
  items: DailyReportDraftSourceCandidate[]
}

export interface DailyReportDraftSourcesParams {
  workDate: string
  teamId?: number
}

// ── Prefill payload ──────────────────────────────────────────
// Mirrors CreateTaskDailyData fields but standalone to avoid
// tight coupling with the task-daily form shape.

export interface DailyReportPrefill {
  workDate: string
  teamId: number | null
  jobTypeId: number | null
  jobDetailId: number | null
  feederId: number | null
  numPole: string | null
  deviceCode: string | null
  detail: string | null
  urlsBefore: string[]
  urlsAfter: string[]
  latitude: number | null
  longitude: number | null
}

// ── Response ─────────────────────────────────────────────────

export interface DailyReportDraftFromPlanResponse {
  source: DailyReportDraftSource
  prefill: DailyReportPrefill
  warnings: string[]
}

// ── Query params ─────────────────────────────────────────────

export interface DailyReportDraftParams {
  sourceType: PlanningItemType
  sourceId: number
  workDate?: string
}
