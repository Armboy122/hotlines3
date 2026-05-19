/**
 * HRD-F0 Design Tokens
 *
 * Source of truth: Requirement D §D.4 (Color system)
 * - Primary: official/deep blue
 * - Background: light neutral / white
 * - Source: blue (team-plan), teal (monthly-plan)
 * - Status: green (completed), amber (draft/waiting), blue (in_progress), red (cancelled), slate (read_only)
 * - No-permission: muted gray with "ไม่มีสิทธิ์"
 */

// ── STATUS TYPES & TOKENS ──────────────────────────────

/** Board-lane planning statuses (Requirement C lanes) */
export type PlanningStatus =
  | 'waiting'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

/** General status color keys covering all semantic states (Requirement D §D.4) */
export type SemanticStatus = PlanningStatus | 'draft' | 'read_only'

export const PLANNING_STATUS_LABELS: Record<PlanningStatus, string> = {
  waiting: 'รอวางแผน',
  scheduled: 'กำหนดวันแล้ว',
  in_progress: 'กำลังทำ',
  completed: 'เสร็จแล้ว',
  cancelled: 'ยกเลิก',
} as const

/** Semantic color intent per status — maps to Tailwind color name */
export const STATUS_COLORS: Record<SemanticStatus, string> = {
  waiting: 'amber',
  draft: 'amber',
  scheduled: 'blue',
  in_progress: 'blue',
  completed: 'green',
  cancelled: 'red',
  read_only: 'slate',
} as const

export function getStatusColor(status: SemanticStatus): string {
  return STATUS_COLORS[status]
}

// ── SOURCE TYPES & TOKENS ──────────────────────────────

export type PlanningSource = 'team_plan' | 'monthly_plan'

export const PLANNING_SOURCE_LABELS: Record<PlanningSource, string> = {
  team_plan: 'งานแผนของทีม',
  monthly_plan: 'งานจากแผนเดือน',
} as const

/** Source color per Requirement D: team-plan = blue, monthly-plan = teal */
export const SOURCE_COLORS: Record<PlanningSource, string> = {
  team_plan: 'blue',
  monthly_plan: 'teal',
} as const

export function getSourceColor(source: PlanningSource): string {
  return SOURCE_COLORS[source]
}

// ── ROLE BADGE TOKENS ──────────────────────────────────

import type { UserRole } from '@/types/auth'

export const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: 'blue',
  team_lead: 'blue',
  user: 'slate',
  viewer: 'gray',
} as const

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'ผู้ดูแลระบบ',
  team_lead: 'หัวหน้าทีม',
  user: 'ผู้ใช้',
  viewer: 'ผู้บริหาร',
} as const

/** Returns a Tailwind badge class string for a given role */
export function getRoleBadgeStyle(role: UserRole): string {
  const color = ROLE_COLORS[role]
  return `bg-${color}-100 text-${color}-800 border-${color}-200`
}

// ── NO-PERMISSION LABEL ────────────────────────────────

export const NO_PERMISSION_LABEL = 'ไม่มีสิทธิ์' as const

// ── CONFIRMATION DIALOG COPY ───────────────────────────

export const CONFIRM_DELETE = 'ยืนยันการลบ' as const
export const CONFIRM_ROLE_CHANGE = 'ยืนยันการเปลี่ยนบทบาท' as const
export const CANCEL_ACTION = 'ยกเลิก' as const
export const CONFIRM_ACTION = 'ยืนยัน' as const
