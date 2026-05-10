import type { UserRole } from '@/types/auth'
import {
  canAccessAdminConsole,
  canAccessAdminRoute,
  canAccessMainNavigationItem,
  canAccessSystemAdminConsole,
  canManageMonthlyPlanFile,
  canManageRole,
  canResetOtherPassword,
  canSubmitMonthlyPlan,
  getAdminConsoleHeroCopy,
  getAdminRoleLabel,
  getAssignableRoles,
  getVisibleAdminMenuIds,
  isMonthlyPlanManager,
  isPrivilegedAdmin,
  isSystemAdmin,
  canCreateTeamPlan,
  canEditTeamPlan,
  canDeleteTeamPlan,
  canViewPlanningCalendar,
  canManagePlanningCalendar,
  canViewContactDirectory,
  canUpdateOwnContact,
  canUpdateAnyContact,
  canCreateLargeWork,
  canEditLargeWork,
  canManageTeamLargeWork,
  canGenerateDraftsFromPlan,
  canManageDailyReportDraft,
} from './role-policy'

const assertRoleList = <T extends readonly UserRole[]>(_value: T) => undefined
const assert = (value: boolean, message?: string) => {
  if (!value) throw new Error(message ?? 'role policy assertion failed')
}
const assertEqual = <T>(actual: T, expected: T, message?: string) => {
  if (actual !== expected) throw new Error(message ?? `expected ${String(actual)} to equal ${String(expected)}`)
}

assert(isPrivilegedAdmin('super_admin'))
assert(isPrivilegedAdmin('admin'))
assert(!isPrivilegedAdmin('team_lead'))
assert(isSystemAdmin('super_admin'))
assert(!isSystemAdmin('admin'))
assert(isMonthlyPlanManager('super_admin'))
assert(isMonthlyPlanManager('admin'))
assert(!isMonthlyPlanManager('team_lead'))

assert(canAccessAdminConsole('super_admin'))
assert(canAccessAdminConsole('admin'))
assert(canAccessSystemAdminConsole('super_admin'))
assert(!canAccessSystemAdminConsole('admin'))
assert(!canAccessAdminConsole('team_lead'))
assert(!canAccessAdminConsole('user'))
assert(getAdminRoleLabel('super_admin') === 'Super Admin')
assert(getAdminRoleLabel('admin') === 'Admin')
assert(getAdminRoleLabel('team_lead') === null)

assert(canManageRole('super_admin', 'admin'))
assert(canManageRole('super_admin', 'super_admin'))
assert(!canManageRole('admin', 'team_lead'))
assert(!canManageRole('admin', 'user'))
assert(!canManageRole('admin', 'viewer'))
assert(!canManageRole('admin', 'admin'))
assert(!canManageRole('admin', 'super_admin'))
assert(!canManageRole('team_lead', 'user'))

assert(canResetOtherPassword('super_admin'))
assert(!canResetOtherPassword('admin'))

assertRoleList(getAssignableRoles('super_admin'))
assertRoleList(getAssignableRoles('admin'))
assert(getAssignableRoles('super_admin').includes('admin'))
assert(getAssignableRoles('super_admin').includes('super_admin'))
assertEqual(getAssignableRoles('admin').length, 0)

assert(canSubmitMonthlyPlan({ role: 'team_lead', isLocked: false, hasTeam: true }))
assert(!canSubmitMonthlyPlan({ role: 'team_lead', isLocked: true, hasTeam: true }))
assert(!canSubmitMonthlyPlan({ role: 'team_lead', isLocked: false, hasTeam: false }))
assert(canSubmitMonthlyPlan({ role: 'user', isLocked: false, hasTeam: true }))
assert(!canSubmitMonthlyPlan({ role: 'user', isLocked: true, hasTeam: true }))
assert(!canSubmitMonthlyPlan({ role: 'user', isLocked: false, hasTeam: false }))
assert(!canSubmitMonthlyPlan({ role: 'viewer', isLocked: false, hasTeam: true }))
assert(canSubmitMonthlyPlan({ role: 'admin', isLocked: true, hasTeam: false }))
assert(canSubmitMonthlyPlan({ role: 'super_admin', isLocked: true, hasTeam: false }))
assert(canManageMonthlyPlanFile({ role: 'super_admin', currentUserTeamId: null, targetTeamId: 1, isLocked: true }))
assert(canManageMonthlyPlanFile({ role: 'admin', currentUserTeamId: null, targetTeamId: 1, isLocked: true }))
assert(canManageMonthlyPlanFile({ role: 'team_lead', currentUserTeamId: 1, targetTeamId: 1, isLocked: false }))
assert(!canManageMonthlyPlanFile({ role: 'team_lead', currentUserTeamId: 1, targetTeamId: 2, isLocked: false }))
assert(!canManageMonthlyPlanFile({ role: 'team_lead', currentUserTeamId: 1, targetTeamId: 1, isLocked: true }))
// user now has same own-team file management rights as team_lead
assert(canManageMonthlyPlanFile({ role: 'user', currentUserTeamId: 1, targetTeamId: 1, isLocked: false }))
assert(!canManageMonthlyPlanFile({ role: 'user', currentUserTeamId: 1, targetTeamId: 2, isLocked: false }))
assert(!canManageMonthlyPlanFile({ role: 'user', currentUserTeamId: 1, targetTeamId: 1, isLocked: true }))
assert(!canManageMonthlyPlanFile({ role: 'user', currentUserTeamId: null, targetTeamId: 1, isLocked: false }))
assert(!canManageMonthlyPlanFile({ role: 'viewer', currentUserTeamId: 1, targetTeamId: 1, isLocked: false }))

assert(canAccessAdminRoute('super_admin', '/admin'))
assert(canAccessAdminRoute('super_admin', '/admin/dashboard'))
assert(canAccessAdminRoute('super_admin', '/admin/operation-centers'))
assert(canAccessAdminRoute('admin', '/admin'))
assert(canAccessAdminRoute('admin', '/admin/monthly-plan'))
assert(!canAccessAdminRoute('admin', '/admin/dashboard'))
assert(!canAccessAdminRoute('admin', '/admin/operation-centers'))
assert(!canAccessAdminRoute('team_lead', '/admin/monthly-plan'))

assertEqual(getVisibleAdminMenuIds('admin').join(','), 'monthly-plan')
assert(getVisibleAdminMenuIds('super_admin').includes('dashboard'))
assert(getVisibleAdminMenuIds('super_admin').includes('operation-centers'))
assert(getVisibleAdminMenuIds('super_admin').includes('monthly-plan'))
assertEqual(getVisibleAdminMenuIds('team_lead').length, 0)

assert(canAccessMainNavigationItem('super_admin', '/admin'))
assert(canAccessMainNavigationItem('admin', '/admin'))
assert(!canAccessMainNavigationItem('team_lead', '/admin'))
assert(!canAccessMainNavigationItem('user', '/admin'))
assert(!canAccessMainNavigationItem('viewer', '/admin'))
assert(canAccessMainNavigationItem('team_lead', '/monthly-plan'))
assert(canAccessMainNavigationItem('user', '/monthly-plan'))
assert(canAccessMainNavigationItem('viewer', '/monthly-plan'))

assertEqual(getAdminConsoleHeroCopy('admin').title, 'ศูนย์จัดการแผนงานประจำเดือน')
assert(!getAdminConsoleHeroCopy('admin').description.includes('Dashboard'))
assertEqual(getAdminConsoleHeroCopy('super_admin').title, 'ระบบจัดการข้อมูลพื้นฐาน')
assert(getAdminConsoleHeroCopy('super_admin').description.includes('Dashboard'))

// ============================================================
// Team Plan Policy Tests
// ============================================================

// canCreateTeamPlan
assert(canCreateTeamPlan('super_admin', false))
assert(canCreateTeamPlan('admin', false))
assert(canCreateTeamPlan('team_lead', true))
assert(canCreateTeamPlan('user', true))
assert(!canCreateTeamPlan('team_lead', false))
assert(!canCreateTeamPlan('user', false))
assert(!canCreateTeamPlan('viewer', true))

// canEditTeamPlan
assert(canEditTeamPlan('super_admin', 1, 999)) // admin can edit any
assert(canEditTeamPlan('admin', 1, 999))
assert(canEditTeamPlan('team_lead', 42, 42)) // creator edits own
assert(canEditTeamPlan('user', 42, 42))
assert(!canEditTeamPlan('team_lead', 42, 99)) // cannot edit others
assert(!canEditTeamPlan('user', 42, 99))
assert(!canEditTeamPlan('team_lead', null, 42))
assert(!canEditTeamPlan('user', 42, null))

// canDeleteTeamPlan
assert(canDeleteTeamPlan('super_admin', null, 1))
assert(canDeleteTeamPlan('admin', null, 1))
assert(canDeleteTeamPlan('team_lead', 1, 1)) // own team
assert(!canDeleteTeamPlan('team_lead', 1, 2)) // other team
assert(!canDeleteTeamPlan('team_lead', null, 1))
assert(!canDeleteTeamPlan('user', 1, 1)) // user cannot delete even own team
assert(!canDeleteTeamPlan('viewer', 1, 1))

// ============================================================
// Planning Calendar Policy Tests
// ============================================================

assert(canViewPlanningCalendar('super_admin'))
assert(canViewPlanningCalendar('admin'))
assert(canViewPlanningCalendar('team_lead'))
assert(canViewPlanningCalendar('user'))
assert(canViewPlanningCalendar('viewer'))
assert(!canViewPlanningCalendar(null))
assert(!canViewPlanningCalendar(undefined))

assert(canManagePlanningCalendar('super_admin'))
assert(canManagePlanningCalendar('admin'))
assert(!canManagePlanningCalendar('team_lead'))
assert(!canManagePlanningCalendar('user'))

// ============================================================
// Contact Directory Policy Tests
// ============================================================

assert(canViewContactDirectory('super_admin'))
assert(canViewContactDirectory('admin'))
assert(canViewContactDirectory('team_lead'))
assert(canViewContactDirectory('user'))
assert(canViewContactDirectory('viewer'))
assert(!canViewContactDirectory(null))

assert(canUpdateOwnContact('user'))
assert(canUpdateOwnContact('team_lead'))
assert(canUpdateOwnContact('viewer'))

assert(canUpdateAnyContact('super_admin'))
assert(!canUpdateAnyContact('admin'))
assert(!canUpdateAnyContact('team_lead'))
assert(!canUpdateAnyContact('user'))

// ============================================================
// Large Work Policy Tests
// ============================================================

// canCreateLargeWork: backend MVP allows only admin/super_admin to create.
assert(canCreateLargeWork('super_admin', false))
assert(canCreateLargeWork('admin', false))
assert(!canCreateLargeWork('team_lead', true))
assert(!canCreateLargeWork('user', true))
assert(!canCreateLargeWork('team_lead', false))
assert(!canCreateLargeWork('user', false))
assert(!canCreateLargeWork('viewer', true))

// canEditLargeWork: backend MVP keeps team_lead/user/viewer view-only.
assert(canEditLargeWork('super_admin', 1, 999))
assert(canEditLargeWork('admin', 1, 999))
assert(!canEditLargeWork('team_lead', 42, 42))
assert(!canEditLargeWork('user', 42, 42))
assert(!canEditLargeWork('team_lead', 42, 99))
assert(!canEditLargeWork('user', 42, 99))
assert(!canEditLargeWork('viewer', 42, 42))

// canManageTeamLargeWork/cancel controls: backend MVP allows only admin/super_admin.
assert(canManageTeamLargeWork('super_admin', null, 1))
assert(canManageTeamLargeWork('admin', null, 1))
assert(!canManageTeamLargeWork('team_lead', 1, 1))
assert(!canManageTeamLargeWork('team_lead', 1, 2))
assert(!canManageTeamLargeWork('user', 1, 1))
assert(!canManageTeamLargeWork('viewer', 1, 1))

// ============================================================
// Daily Report Draft Policy Tests
// ============================================================

// canGenerateDraftsFromPlan
assert(canGenerateDraftsFromPlan('super_admin', false))
assert(canGenerateDraftsFromPlan('admin', false))
assert(canGenerateDraftsFromPlan('team_lead', true))
assert(canGenerateDraftsFromPlan('user', true))
assert(!canGenerateDraftsFromPlan('team_lead', false))
assert(!canGenerateDraftsFromPlan('user', false))
assert(!canGenerateDraftsFromPlan('viewer', true))

// canManageDailyReportDraft
assert(canManageDailyReportDraft('super_admin', null, 1, true))
assert(canManageDailyReportDraft('admin', null, 1, true))
assert(canManageDailyReportDraft('team_lead', 1, 1, false))
assert(canManageDailyReportDraft('user', 1, 1, false))
assert(!canManageDailyReportDraft('team_lead', 1, 1, true)) // locked
assert(!canManageDailyReportDraft('user', 1, 1, true)) // locked
assert(!canManageDailyReportDraft('team_lead', 1, 2, false)) // other team
assert(!canManageDailyReportDraft('user', 1, 2, false)) // other team
assert(!canManageDailyReportDraft('team_lead', null, 1, false))
assert(!canManageDailyReportDraft('viewer', 1, 1, false))

console.log('All role-policy tests passed ✓')
