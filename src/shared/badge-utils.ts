/**
 * Badge utility functions for the redesign (Requirement D §D.4, §D.7).
 *
 * Pure functions returning Tailwind class strings.
 * Used by SourceBadge, StatusBadge, RoleBadge components.
 */

import type { UserRole } from '@/types/auth'
import {
  type SemanticStatus,
  type PlanningSource,
  STATUS_COLORS,
  SOURCE_COLORS,
  ROLE_COLORS,
} from './design-tokens'

// ── BASE BADGE CLASS ───────────────────────────────────

const BADGE_BASE = 'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold'

// ── STATUS BADGE ───────────────────────────────────────

const STATUS_BG: Record<string, string> = {
  green: 'bg-green-100 text-green-800 border-green-200',
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  red: 'bg-red-100 text-red-800 border-red-200',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
}

export function getBadgeClass(status: SemanticStatus): string {
  const color = STATUS_COLORS[status]
  return `${BADGE_BASE} ${STATUS_BG[color] ?? 'bg-slate-100 text-slate-700 border-slate-200'}`
}

// ── SOURCE BADGE ───────────────────────────────────────

const SOURCE_BG: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  teal: 'bg-teal-100 text-teal-800 border-teal-200',
}

export function getSourceBadgeClass(source: PlanningSource): string {
  const color = SOURCE_COLORS[source]
  return `${BADGE_BASE} ${SOURCE_BG[color] ?? 'bg-slate-100 text-slate-700 border-slate-200'}`
}

// ── ROLE BADGE ─────────────────────────────────────────

const ROLE_BG: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
  gray: 'bg-gray-100 text-gray-700 border-gray-200',
}

export function getRoleBadgeClass(role: UserRole): string {
  const color = ROLE_COLORS[role]
  return `${BADGE_BASE} ${ROLE_BG[color] ?? 'bg-slate-100 text-slate-700 border-slate-200'}`
}

// ── NO-PERMISSION BADGE ────────────────────────────────

export const NO_PERMISSION_BADGE_CLASS =
  'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
