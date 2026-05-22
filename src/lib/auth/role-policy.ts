import type { UserRole } from '@/types/auth'

type RoleLike = UserRole | string | null | undefined

export const SYSTEM_ADMIN_ROLES = ['super_admin'] as const satisfies readonly UserRole[]
export const MONTHLY_PLAN_MANAGER_ROLES = ['super_admin'] as const satisfies readonly UserRole[]
export const PRIVILEGED_ADMIN_ROLES = MONTHLY_PLAN_MANAGER_ROLES
export const ALL_USER_ROLES = ['super_admin', 'team_lead', 'user', 'viewer'] as const satisfies readonly UserRole[]
export const MUTABLE_USER_ROLES = ['team_lead', 'user', 'viewer'] as const satisfies readonly UserRole[]
export const ADMIN_MENU_IDS = [
  'users',
  'teams',
  'capabilities',
  'master-data',
  'settings',
] as const

export type AdminMenuId = (typeof ADMIN_MENU_IDS)[number]

const ADMIN_ROUTE_ACCESS: Record<AdminMenuId, readonly UserRole[]> = {
  users: SYSTEM_ADMIN_ROLES,
  teams: SYSTEM_ADMIN_ROLES,
  capabilities: SYSTEM_ADMIN_ROLES,
  'master-data': SYSTEM_ADMIN_ROLES,
  settings: SYSTEM_ADMIN_ROLES,
}
function isKnownRole(role: RoleLike): role is UserRole {
  return ALL_USER_ROLES.includes(role as UserRole)
}

export function isSystemAdmin(role: RoleLike): role is 'super_admin' {
  return role === 'super_admin'
}

export function isMonthlyPlanManager(role: RoleLike): role is 'super_admin' {
  return role === 'super_admin'
}

export function isSuperAdmin(role: RoleLike): role is 'super_admin' {
  return role === 'super_admin'
}

export function isPrivilegedAdmin(role: RoleLike): role is 'super_admin' {
  return isMonthlyPlanManager(role)
}

export function canAccessAdminConsole(role: RoleLike): boolean {
  return isSystemAdmin(role)
}

export function canAccessSystemAdminConsole(role: RoleLike): boolean {
  return isSystemAdmin(role)
}

export function canAccessMainNavigationItem(role: RoleLike, href: string): boolean {
  if (href === '/admin' || href.startsWith('/admin/')) {
    return canAccessAdminConsole(role)
  }
  return true
}

export function getAdminRoleLabel(role: RoleLike): 'ผู้ดูแลระบบสูงสุด' | null {
  if (role === 'super_admin') return 'ผู้ดูแลระบบสูงสุด'
  return null
}

export function getAdminConsoleHeroCopy(_role: RoleLike): { title: string; description: string } {
  void _role
  return {
    title: 'จัดการระบบ',
    description: 'จัดการผู้ใช้ ทีม สิทธิ์ และข้อมูลระบบสำหรับผู้ดูแลระบบสูงสุด',
  }
}

export function canManageRole(actorRole: RoleLike, targetRole: RoleLike): boolean {
  return isSystemAdmin(actorRole) && targetRole !== 'super_admin'
}

export function canCreateRole(actorRole: RoleLike, targetRole: RoleLike): boolean {
  return canManageRole(actorRole, targetRole)
}

export function canResetOtherPassword(role: RoleLike): boolean {
  return isSystemAdmin(role)
}

export function getAssignableRoles(actorRole: RoleLike): readonly UserRole[] {
  if (isSystemAdmin(actorRole)) return MUTABLE_USER_ROLES
  return []
}

export function canSubmitMonthlyPlan({
  role,
  isLocked,
  hasTeam,
}: {
  role: RoleLike
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
  role: RoleLike
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

export function canAccessAdminRoute(role: RoleLike, pathname: string): boolean {
  if (!canAccessAdminConsole(role)) return false
  const normalized = pathname.split('?')[0].replace(/\/$/, '') || '/admin'
  if (normalized === '/admin') return true
  if (normalized === '/admin/users' || normalized.startsWith('/admin/users/')) return true
  if (normalized === '/admin/teams' || normalized.startsWith('/admin/teams/')) return true
  if (normalized === '/admin/capabilities' || normalized.startsWith('/admin/capabilities/')) return true
  if (normalized === '/admin/master-data' || normalized.startsWith('/admin/master-data/')) return true
  if (normalized === '/admin/settings' || normalized.startsWith('/admin/settings/')) return true
  return false
}

export function getVisibleAdminMenuIds(role: RoleLike): readonly AdminMenuId[] {
  if (!canAccessAdminConsole(role)) return []
  return ADMIN_MENU_IDS.filter((id) => ADMIN_ROUTE_ACCESS[id].includes(role as UserRole))
}

// ============================================================
// Team Plan Policy
// Team plan = own-area work, no approval.
// user/team_lead can add/edit/delete own-team items.
// super_admin has global CRUD across all teams.
// ============================================================

export function canCreateTeamPlan(role: RoleLike, hasTeam: boolean): boolean {
  if (isSystemAdmin(role)) return true
  return (role === 'team_lead' || role === 'user') && hasTeam
}

export function canEditTeamPlan(
  role: RoleLike,
  currentUserId: number | null | undefined,
  creatorId: number | null | undefined,
  currentUserTeamId?: number | null,
  targetTeamId?: number | null,
): boolean {
  if (isSystemAdmin(role)) return true
  if (role === 'team_lead' || role === 'user') {
    if (currentUserId != null && creatorId != null && currentUserId === creatorId) return true
    if (currentUserTeamId != null && targetTeamId != null && currentUserTeamId === targetTeamId) return true
    return false
  }
  return false
}

export function canDeleteTeamPlan(
  role: RoleLike,
  currentUserTeamId: number | null | undefined,
  targetTeamId: number | null | undefined,
): boolean {
  if (isSystemAdmin(role)) return true
  return (
    (role === 'team_lead' || role === 'user') &&
    currentUserTeamId != null &&
    targetTeamId != null &&
    currentUserTeamId === targetTeamId
  )
}

// ============================================================
// Planning Calendar Policy
// All authenticated roles can view; planning entries are managed by scoped
// team-plan/large-work policies.
// ============================================================

export function canViewPlanningCalendar(role: RoleLike): boolean {
  return isKnownRole(role)
}

export function canManagePlanningCalendar(role: RoleLike): boolean {
  return role === 'super_admin' || role === 'team_lead' || role === 'user'
}

// ============================================================
// Contact Directory Policy
// All authenticated roles can view; users can update own contact; super_admin can update any.
// ============================================================

export function canViewContactDirectory(role: RoleLike): boolean {
  return isKnownRole(role)
}

export function canUpdateOwnContact(role: RoleLike): boolean {
  // viewer is read-only: can call/copy/view details, but cannot edit contact data.
  return role === 'super_admin' || role === 'team_lead' || role === 'user'
}

export function canUpdateAnyContact(role: RoleLike): boolean {
  return isSystemAdmin(role)
}

export function canCreateExternalContact(role: RoleLike, hasTeam: boolean): boolean {
  if (isSystemAdmin(role)) return true
  return (role === 'team_lead' || role === 'user') && hasTeam
}

// ============================================================
// Large Work (งานระดมทีม) Policy — execution replan 2026-05-11
// team_lead can create/edit/assign for own area.
// user/team_lead of assigned team can execute tasks.
// super_admin retains full cross-team operational access.
// ============================================================

export function canViewLargeWorkOverview(role: RoleLike): boolean {
  return isKnownRole(role)
}

export function canCreateLargeWork(role: RoleLike, hasTeam: boolean): boolean {
  if (isSystemAdmin(role)) return true
  return role === 'team_lead' && hasTeam
}

export function canEditLargeWork(
  role: RoleLike,
  currentUserId: number | null | undefined,
  creatorId: number | null | undefined,
  currentUserTeamId?: number | null,
  ownerTeamId?: number | null,
): boolean {
  if (isSystemAdmin(role)) return true
  if (role !== 'team_lead') return false
  if (currentUserId != null && creatorId != null && currentUserId === creatorId) return true
  if (currentUserTeamId != null && ownerTeamId != null && currentUserTeamId === ownerTeamId) return true
  return false
}

export function canManageTeamLargeWork(
  role: RoleLike,
  currentUserTeamId: number | null | undefined,
  targetTeamId: number | null | undefined,
): boolean {
  if (isSystemAdmin(role)) return true
  return (
    role === 'team_lead' &&
    currentUserTeamId != null &&
    targetTeamId != null &&
    currentUserTeamId === targetTeamId
  )
}

export function canAssignLargeWorkTasks(
  role: RoleLike,
  currentUserTeamId: number | null | undefined,
  ownerTeamId: number | null | undefined,
): boolean {
  if (isSystemAdmin(role)) return true
  return (
    role === 'team_lead' &&
    currentUserTeamId != null &&
    ownerTeamId != null &&
    currentUserTeamId === ownerTeamId
  )
}

export function canExecuteLargeWorkTask(
  role: RoleLike,
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
// Drafts generated from planning/monthly plan.
// team_lead/user can manage own-team drafts when not locked.
// ============================================================

export function canGenerateDraftsFromPlan(
  role: RoleLike,
  hasTeam: boolean,
): boolean {
  if (isMonthlyPlanManager(role)) return true
  return (role === 'team_lead' || role === 'user') && hasTeam
}

export function canManageDailyReportDraft(
  role: RoleLike,
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
