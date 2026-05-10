import type { UserRole } from '@/types/auth'

export const SYSTEM_ADMIN_ROLES = ['super_admin'] as const satisfies readonly UserRole[]
export const MONTHLY_PLAN_MANAGER_ROLES = ['super_admin', 'admin'] as const satisfies readonly UserRole[]
export const PRIVILEGED_ADMIN_ROLES = MONTHLY_PLAN_MANAGER_ROLES
export const ALL_USER_ROLES = ['super_admin', 'admin', 'team_lead', 'user', 'viewer'] as const satisfies readonly UserRole[]

export const ADMIN_MENU_IDS = [
  'dashboard',
  'operation-centers',
  'peas',
  'stations',
  'feeders',
  'job-types',
  'job-details',
  'monthly-plan',
] as const

export type AdminMenuId = (typeof ADMIN_MENU_IDS)[number]

const ADMIN_ROUTE_ACCESS: Record<AdminMenuId, readonly UserRole[]> = {
  dashboard: SYSTEM_ADMIN_ROLES,
  'operation-centers': SYSTEM_ADMIN_ROLES,
  peas: SYSTEM_ADMIN_ROLES,
  stations: SYSTEM_ADMIN_ROLES,
  feeders: SYSTEM_ADMIN_ROLES,
  'job-types': SYSTEM_ADMIN_ROLES,
  'job-details': SYSTEM_ADMIN_ROLES,
  'monthly-plan': MONTHLY_PLAN_MANAGER_ROLES,
}

export function isSystemAdmin(role: UserRole | null | undefined): role is 'super_admin' {
  return role === 'super_admin'
}

export function isMonthlyPlanManager(role: UserRole | null | undefined): role is 'super_admin' | 'admin' {
  return role === 'super_admin' || role === 'admin'
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
    title: 'ระบบจัดการข้อมูลพื้นฐาน',
    description: 'จัดการข้อมูลพื้นฐาน ดู Dashboard และวิเคราะห์รายงานงานประจำวัน',
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
  if (isMonthlyPlanManager(role)) return true
  return (role === 'team_lead' || role === 'user') && hasTeam
}

export function canEditTeamPlan(
  role: UserRole | null | undefined,
  currentUserId: number | null | undefined,
  creatorId: number | null | undefined,
): boolean {
  if (isMonthlyPlanManager(role)) return true
  // creator can edit own item
  return (
    (role === 'team_lead' || role === 'user') &&
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
  if (isMonthlyPlanManager(role)) return true
  // team_lead can delete own-team items
  return (
    role === 'team_lead' &&
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
// Large Work (งานระดับทีม) Policy
// Backend MVP policy: admin/super_admin create, edit, and cancel large-work.
// team_lead/user/viewer are view-only for relevant owner/participant teams.
// ============================================================

export function canCreateLargeWork(role: UserRole | null | undefined, _hasTeam: boolean): boolean {
  return isMonthlyPlanManager(role)
}

export function canEditLargeWork(
  role: UserRole | null | undefined,
  _currentUserId: number | null | undefined,
  _creatorId: number | null | undefined,
): boolean {
  return isMonthlyPlanManager(role)
}

export function canManageTeamLargeWork(
  role: UserRole | null | undefined,
  _currentUserTeamId: number | null | undefined,
  _targetTeamId: number | null | undefined,
): boolean {
  return isMonthlyPlanManager(role)
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
