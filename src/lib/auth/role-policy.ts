import type { UserRole } from '@/types/auth'

export const SYSTEM_ADMIN_ROLES = ['super_admin'] as const satisfies readonly UserRole[]
export const MONTHLY_PLAN_MANAGER_ROLES = ['super_admin', 'admin'] as const satisfies readonly UserRole[]
export const PRIVILEGED_ADMIN_ROLES = MONTHLY_PLAN_MANAGER_ROLES
export const ALL_USER_ROLES = ['super_admin', 'admin', 'team_lead', 'user', 'viewer'] as const satisfies readonly UserRole[]
export const ADMIN_MENU_IDS = [
  'users',
  'teams',
  'capabilities',
  'audit',
] as const

export type AdminMenuId = (typeof ADMIN_MENU_IDS)[number]

const ADMIN_ROUTE_ACCESS: Record<AdminMenuId, readonly UserRole[]> = {
  users: SYSTEM_ADMIN_ROLES,
  teams: SYSTEM_ADMIN_ROLES,
  capabilities: SYSTEM_ADMIN_ROLES,
  audit: SYSTEM_ADMIN_ROLES,
}
export function isSystemAdmin(role: UserRole | null | undefined): role is 'super_admin' {
  return role === 'super_admin'
}

export function isMonthlyPlanManager(role: UserRole | null | undefined): role is 'super_admin' | 'admin' {
  return role === 'super_admin' || role === 'admin'
}

export function isSuperAdmin(role: UserRole | null | undefined): role is 'super_admin' {
  return role === 'super_admin'
}

export function isPrivilegedAdmin(role: UserRole | null | undefined): role is 'super_admin' | 'admin' {
  return isMonthlyPlanManager(role)
}

export function canAccessAdminConsole(role: UserRole | null | undefined): boolean {
  return isSystemAdmin(role)
}

export function canAccessSystemAdminConsole(role: UserRole | null | undefined): boolean {
  return isSystemAdmin(role)
}

export function canAccessMainNavigationItem(role: UserRole | null | undefined, href: string): boolean {
  if (href === '/admin' || href.startsWith('/admin/')) {
    return canAccessAdminConsole(role)
  }
  return true
}

export function getAdminRoleLabel(role: UserRole | null | undefined): 'ผู้ดูแลระบบสูงสุด' | null {
  if (role === 'super_admin') return 'ผู้ดูแลระบบสูงสุด'
  return null
}

export function getAdminConsoleHeroCopy(_role: UserRole | null | undefined): { title: string; description: string } {
  void _role
  return {
    title: 'จัดการระบบ',
    description: 'จัดการผู้ใช้ ทีม สิทธิ์ และข้อมูลระบบสำหรับผู้ดูแลระบบสูงสุด',
  }
}

export function canManageRole(actorRole: UserRole | null | undefined, _targetRole: UserRole): boolean {
  void _targetRole
  return isSystemAdmin(actorRole)
}

export function canCreateRole(actorRole: UserRole | null | undefined, targetRole: UserRole): boolean {
  return canManageRole(actorRole, targetRole)
}

export function canResetOtherPassword(role: UserRole | null | undefined): boolean {
  return isSystemAdmin(role)
}

export function getAssignableRoles(actorRole: UserRole | null | undefined): readonly UserRole[] {
  if (isSystemAdmin(actorRole)) return ALL_USER_ROLES
  return []
}

export function canSubmitMonthlyPlan({
  role,
  isLocked,
  hasTeam,
}: {
  role: UserRole | null | undefined
  isLocked: boolean
  hasTeam: boolean
}): boolean {
  if (isMonthlyPlanManager(role)) return true
  return (role === 'team_lead' || role === 'user') && hasTeam && !isLocked
}

export function canManageMonthlyPlanFile({
  role,
  currentUserTeamId,
  targetTeamId,
  isLocked,
}: {
  role: UserRole | null | undefined
  currentUserTeamId: number | null | undefined
  targetTeamId: number | null | undefined
  isLocked: boolean
}): boolean {
  if (isMonthlyPlanManager(role)) return true
  return (
    (role === 'team_lead' || role === 'user') &&
    !isLocked &&
    currentUserTeamId != null &&
    targetTeamId != null &&
    currentUserTeamId === targetTeamId
  )
}

export function canAccessAdminRoute(role: UserRole | null | undefined, pathname: string): boolean {
  if (!canAccessAdminConsole(role)) return false
  const normalized = pathname.split('?')[0].replace(/\/$/, '') || '/admin'
  if (normalized === '/admin') return true
  if (normalized === '/admin/users' || normalized.startsWith('/admin/users/')) return true
  if (normalized === '/admin/teams' || normalized.startsWith('/admin/teams/')) return true
  if (normalized === '/admin/capabilities' || normalized.startsWith('/admin/capabilities/')) return true
  if (normalized === '/admin/audit' || normalized.startsWith('/admin/audit/')) return true
  return false
}

export function getVisibleAdminMenuIds(role: UserRole | null | undefined): readonly AdminMenuId[] {
  if (!canAccessAdminConsole(role)) return []
  return ADMIN_MENU_IDS.filter((id) => ADMIN_ROUTE_ACCESS[id].includes(role as UserRole))
}

// ============================================================
// Team Plan Policy
// Team plan = own-area work, no approval.
// user/team_lead/admin can add for own team; creator can edit own item;
// admin/team_lead can delete own-team items.
// super_admin has global CRUD across all teams.
// Note: admin is team-scoped management (NOT the same as team_lead),
//       but shares own-team operational rights for team-plan.
// ============================================================

export function canCreateTeamPlan(role: UserRole | null | undefined, hasTeam: boolean): boolean {
  if (isSystemAdmin(role)) return true
  return (role === 'admin' || role === 'team_lead' || role === 'user') && hasTeam
}

export function canEditTeamPlan(
  role: UserRole | null | undefined,
  currentUserId: number | null | undefined,
  creatorId: number | null | undefined,
  currentUserTeamId?: number | null,
  targetTeamId?: number | null,
): boolean {
  if (isSystemAdmin(role)) return true
  // admin/team_lead: edit own-team items (team match or creator match)
  if (role === 'admin' || role === 'team_lead') {
    if (currentUserId != null && creatorId != null && currentUserId === creatorId) return true
    if (currentUserTeamId != null && targetTeamId != null && currentUserTeamId === targetTeamId) return true
    return false
  }
  // user: creator can edit own item only
  return (
    role === 'user' &&
    currentUserId != null &&
    creatorId != null &&
    currentUserId === creatorId
  )
}

export function canDeleteTeamPlan(
  role: UserRole | null | undefined,
  currentUserTeamId: number | null | undefined,
  targetTeamId: number | null | undefined,
): boolean {
  if (isSystemAdmin(role)) return true
  // admin/team_lead can delete own-team items
  return (
    (role === 'admin' || role === 'team_lead') &&
    currentUserTeamId != null &&
    targetTeamId != null &&
    currentUserTeamId === targetTeamId
  )
}

// ============================================================
// Planning Calendar Policy
// All authenticated roles can view; admin/super_admin can manage entries.
// ============================================================

export function canViewPlanningCalendar(role: UserRole | null | undefined): boolean {
  return !!role
}

export function canManagePlanningCalendar(role: UserRole | null | undefined): boolean {
  return isMonthlyPlanManager(role)
}

// ============================================================
// Contact Directory Policy
// All authenticated roles can view; users can update own contact; super_admin can update any.
// ============================================================

export function canViewContactDirectory(role: UserRole | null | undefined): boolean {
  return !!role
}

export function canUpdateOwnContact(role: UserRole | null | undefined): boolean {
  // viewer is read-only: can call/copy/view details, but cannot edit contact data.
  return !!role && role !== 'viewer'
}

export function canUpdateAnyContact(role: UserRole | null | undefined): boolean {
  return isSystemAdmin(role)
}

// ============================================================
// Large Work (งานระดมทีม) Policy — execution replan 2026-05-11
// team_lead can create/edit/assign for own area.
// user/team_lead of assigned team can execute tasks.
// admin is team-scoped: own-team create/edit/assign/cancel (same as team_lead).
// super_admin retains full cross-team operational access.
// Note: admin is NOT team_lead but shares own-team large-work rights.
// ============================================================

export function canViewLargeWorkOverview(role: UserRole | null | undefined): boolean {
  return !!role
}

export function canCreateLargeWork(role: UserRole | null | undefined, hasTeam: boolean): boolean {
  if (isSystemAdmin(role)) return true
  return (role === 'admin' || role === 'team_lead') && hasTeam
}

export function canEditLargeWork(
  role: UserRole | null | undefined,
  currentUserId: number | null | undefined,
  creatorId: number | null | undefined,
  currentUserTeamId?: number | null,
  ownerTeamId?: number | null,
): boolean {
  if (isSystemAdmin(role)) return true
  if (role !== 'admin' && role !== 'team_lead') return false
  if (currentUserId != null && creatorId != null && currentUserId === creatorId) return true
  if (currentUserTeamId != null && ownerTeamId != null && currentUserTeamId === ownerTeamId) return true
  return false
}

export function canManageTeamLargeWork(
  role: UserRole | null | undefined,
  currentUserTeamId: number | null | undefined,
  targetTeamId: number | null | undefined,
): boolean {
  if (isSystemAdmin(role)) return true
  return (
    (role === 'admin' || role === 'team_lead') &&
    currentUserTeamId != null &&
    targetTeamId != null &&
    currentUserTeamId === targetTeamId
  )
}

export function canAssignLargeWorkTasks(
  role: UserRole | null | undefined,
  currentUserTeamId: number | null | undefined,
  ownerTeamId: number | null | undefined,
): boolean {
  if (isSystemAdmin(role)) return true
  return (
    (role === 'admin' || role === 'team_lead') &&
    currentUserTeamId != null &&
    ownerTeamId != null &&
    currentUserTeamId === ownerTeamId
  )
}

export function canExecuteLargeWorkTask(
  role: UserRole | null | undefined,
  currentUserTeamId: number | null | undefined,
  assignedTeamId: number | null | undefined,
): boolean {
  if (isSystemAdmin(role)) return true
  return (
    (role === 'team_lead' || role === 'user') &&
    currentUserTeamId != null &&
    assignedTeamId != null &&
    currentUserTeamId === assignedTeamId
  )
}

// ============================================================
// Daily Report Draft Policy
// Drafts generated from monthly plan. admin/super_admin manage broadly.
// team_lead/user can manage own-team drafts when not locked.
// ============================================================

export function canGenerateDraftsFromPlan(
  role: UserRole | null | undefined,
  hasTeam: boolean,
): boolean {
  if (isMonthlyPlanManager(role)) return true
  return (role === 'team_lead' || role === 'user') && hasTeam
}

export function canManageDailyReportDraft(
  role: UserRole | null | undefined,
  currentUserTeamId: number | null | undefined,
  targetTeamId: number | null | undefined,
  isLocked: boolean,
): boolean {
  if (isMonthlyPlanManager(role)) return true
  return (
    (role === 'team_lead' || role === 'user') &&
    !isLocked &&
    currentUserTeamId != null &&
    targetTeamId != null &&
    currentUserTeamId === targetTeamId
  )
}
