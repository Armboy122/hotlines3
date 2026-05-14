import type { UserRole } from '@/types/auth'

export const SYSTEM_ADMIN_ROLES = ['super_admin'] as const satisfies readonly UserRole[]
export const MONTHLY_PLAN_MANAGER_ROLES = ['super_admin', 'admin'] as const satisfies readonly UserRole[]
export const PRIVILEGED_ADMIN_ROLES = MONTHLY_PLAN_MANAGER_ROLES
export const ALL_USER_ROLES = ['super_admin', 'admin', 'team_lead', 'user', 'viewer'] as const satisfies readonly UserRole[]
export const ADMIN_MENU_IDS = [
  'operation-centers',
  'peas',
  'stations',
  'feeders',
  'job-types',
  'job-details',
  'users',
  'teams',
  'monthly-plan',
  'task-daily',
] as const

export type AdminMenuId = (typeof ADMIN_MENU_IDS)[number]

const ADMIN_ROUTE_ACCESS: Record<AdminMenuId, readonly UserRole[]> = {
  'operation-centers': SYSTEM_ADMIN_ROLES,
  peas: SYSTEM_ADMIN_ROLES,
  stations: SYSTEM_ADMIN_ROLES,
  feeders: SYSTEM_ADMIN_ROLES,
  'job-types': SYSTEM_ADMIN_ROLES,
  'job-details': SYSTEM_ADMIN_ROLES,
  users: SYSTEM_ADMIN_ROLES,
  teams: SYSTEM_ADMIN_ROLES,
  'monthly-plan': MONTHLY_PLAN_MANAGER_ROLES,
  'task-daily': MONTHLY_PLAN_MANAGER_ROLES,
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
  return isMonthlyPlanManager(role)
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

export function getAdminRoleLabel(role: UserRole | null | undefined): 'Super Admin' | 'Admin' | null {
  if (role === 'super_admin') return 'Super Admin'
  if (role === 'admin') return 'Admin'
  return null
}

export function getAdminConsoleHeroCopy(role: UserRole | null | undefined): { title: string; description: string } {
  if (role === 'admin') {
    return {
      title: 'ศูนย์จัดการแผนงานประจำเดือน',
      description: 'จัดการไฟล์แผนงาน อัพโหลดแผนรวม และตั้งค่ารอบส่งแผนงานประจำเดือน',
    }
  }
  return {
    title: 'จัดการระบบ',
    description: 'จัดการข้อมูลพื้นฐาน โครงสร้างองค์กร ประเภทงาน และแผนงานประจำเดือน',
  }
}

export function canManageRole(actorRole: UserRole | null | undefined, _targetRole: UserRole): boolean {
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
  if (isSystemAdmin(role)) return true

  const normalized = pathname.split('?')[0].replace(/\/$/, '') || '/admin'
  if (normalized === '/admin') return true
  if (normalized === '/admin/monthly-plan' || normalized.startsWith('/admin/monthly-plan/')) return true
  if (normalized === '/admin/task-daily' || normalized.startsWith('/admin/task-daily/')) return true
  return false
}

export function getVisibleAdminMenuIds(role: UserRole | null | undefined): readonly AdminMenuId[] {
  if (!canAccessAdminConsole(role)) return []
  return ADMIN_MENU_IDS.filter((id) => ADMIN_ROUTE_ACCESS[id].includes(role as UserRole))
}

// ============================================================
// Team Plan Policy
// Team plan = own-area work, no approval.
// user/team_lead can add; creator can edit own item; team_lead can delete own-team items.
// admin/super_admin manage broadly.
// ============================================================

export function canCreateTeamPlan(role: UserRole | null | undefined, hasTeam: boolean): boolean {
  const isAdmin = role === 'admin'
  if (isMonthlyPlanManager(role)) return true
  return (isAdmin || role === 'team_lead' || role === 'user') && hasTeam
}

export function canEditTeamPlan(
  role: UserRole | null | undefined,
  currentUserId: number | null | undefined,
  creatorId: number | null | undefined,
): boolean {
  const isAdmin = role === 'admin'
  if (isMonthlyPlanManager(role)) return true
  // creator can edit own item
  return (
    (isAdmin || role === 'team_lead' || role === 'user') &&
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
  const isAdmin = role === 'admin'
  if (isMonthlyPlanManager(role)) return true
  // admin/team_lead can delete own-team items
  return (
    (isAdmin || role === 'team_lead') &&
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

export function canUpdateOwnContact(_role: UserRole | null | undefined): boolean {
  // any authenticated user can update their own contact
  return true
}

export function canUpdateAnyContact(role: UserRole | null | undefined): boolean {
  return isSystemAdmin(role)
}

// ============================================================
// Large Work (งานระดมทีม) Policy — execution replan 2026-05-11
// team_lead can create/edit/assign for own area.
// user/team_lead of assigned team can execute tasks.
// admin/super_admin retain full operational access.
// ============================================================

export function canViewLargeWorkOverview(role: UserRole | null | undefined): boolean {
  return !!role
}

export function canCreateLargeWork(role: UserRole | null | undefined, hasTeam: boolean): boolean {
  const isAdmin = role === 'admin'
  if (isMonthlyPlanManager(role)) return true
  return (isAdmin || role === 'team_lead') && hasTeam
}

export function canEditLargeWork(
  role: UserRole | null | undefined,
  currentUserId: number | null | undefined,
  creatorId: number | null | undefined,
  currentUserTeamId?: number | null,
  ownerTeamId?: number | null,
): boolean {
  const isAdmin = role === 'admin'
  if (isMonthlyPlanManager(role)) return true
  if (!isAdmin && role !== 'team_lead') return false
  if (currentUserId != null && creatorId != null && currentUserId === creatorId) return true
  if (currentUserTeamId != null && ownerTeamId != null && currentUserTeamId === ownerTeamId) return true
  return false
}

export function canManageTeamLargeWork(
  role: UserRole | null | undefined,
  currentUserTeamId: number | null | undefined,
  targetTeamId: number | null | undefined,
): boolean {
  const isAdmin = role === 'admin'
  if (isMonthlyPlanManager(role)) return true
  return (
    (isAdmin || role === 'team_lead') &&
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
  const isAdmin = role === 'admin'
  if (isMonthlyPlanManager(role)) return true
  return (
    (isAdmin || role === 'team_lead') &&
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
  if (isMonthlyPlanManager(role)) return true
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
