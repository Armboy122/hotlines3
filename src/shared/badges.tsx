'use client'

/**
 * Reusable badge components for the redesign (Requirement D §D.4, §D.7).
 *
 * - SourceBadge: blue (team-plan), teal (monthly-plan)
 * - StatusBadge: semantic status colors with Thai labels
 * - RoleBadge: role-based colors
 * - NoPermissionBadge: muted gray "ไม่มีสิทธิ์"
 */

import { cn } from '@/lib/utils'
import {
  type SemanticStatus,
  type PlanningSource,
  PLANNING_STATUS_LABELS,
  PLANNING_SOURCE_LABELS,
  NO_PERMISSION_LABEL,
} from './design-tokens'
import {
  getBadgeClass,
  getSourceBadgeClass,
  getRoleBadgeClass,
  NO_PERMISSION_BADGE_CLASS,
} from './badge-utils'
import type { UserRole } from '@/types/auth'
import { ROLE_LABELS } from './design-tokens'

// ── Source Badge ───────────────────────────────────────

interface SourceBadgeProps {
  source: PlanningSource
  className?: string
}

export function SourceBadge({ source, className }: SourceBadgeProps) {
  return (
    <span className={cn(getSourceBadgeClass(source), className)}>
      {PLANNING_SOURCE_LABELS[source]}
    </span>
  )
}

// ── Status Badge ───────────────────────────────────────

interface StatusBadgeProps {
  status: SemanticStatus
  label?: string
  className?: string
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const displayLabel = label ?? PLANNING_STATUS_LABELS[status as keyof typeof PLANNING_STATUS_LABELS] ?? status
  return (
    <span className={cn(getBadgeClass(status), className)}>
      {displayLabel}
    </span>
  )
}

// ── Role Badge ─────────────────────────────────────────

interface RoleBadgeProps {
  role: UserRole
  className?: string
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <span className={cn(getRoleBadgeClass(role), className)}>
      {ROLE_LABELS[role]}
    </span>
  )
}

// ── No-Permission Badge ────────────────────────────────

interface NoPermissionBadgeProps {
  label?: string
  className?: string
}

export function NoPermissionBadge({ label = NO_PERMISSION_LABEL, className }: NoPermissionBadgeProps) {
  return (
    <span className={cn(NO_PERMISSION_BADGE_CLASS, className)}>
      {label}
    </span>
  )
}
