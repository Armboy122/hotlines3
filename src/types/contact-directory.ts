// ============================================================
// Contact Directory Types — aligned with HNP-01 API contract
// ============================================================

import type { UserRole } from './auth'

// ── Response DTO ─────────────────────────────────────────────

export interface ContactDirectoryEntry {
  id: number
  username: string
  displayName: string | null
  position: string | null
  phoneNumber: string | null
  role: UserRole
  teamId: number | null
  team?: { id: number; name: string } | null
  isActive: boolean
  actions: {
    canEdit: boolean
    canEditRoleOrTeam: boolean
  }
  updatedAt: string
}

// ── Request DTOs ─────────────────────────────────────────────

export interface UpdateContactRequest {
  displayName?: string | null
  position?: string | null
  phoneNumber?: string | null
}

// ── Query params ─────────────────────────────────────────────

export interface ContactDirectoryListParams {
  query?: string
  teamId?: number
  role?: string
  includeInactive?: boolean
  page?: number
  limit?: number
}
