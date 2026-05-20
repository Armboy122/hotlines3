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
  canAssignLargeWorkTasks,
  canExecuteLargeWorkTask,
  canViewLargeWorkOverview,
  canGenerateDraftsFromPlan,
  canManageDailyReportDraft,
} from './role-policy'

const assertRoleList = <T extends readonly UserRole[]>(value: T) => {
  void value
}
const assert = (value: boolean, message?: string) => {
  if (!value) throw new Error(message ?? 'role policy assertion failed')
}
const assertEqual = <T>(actual: T, expected: T, message?: string) => {
  if (actual !== expected) throw new Error(message ?? `expected ${String(actual)} to equal ${String(expected)}`)
}

assert(isPrivilegedAdmin('super_admin'))
assert(!isPrivilegedAdmin('admin'))
assert(!isPrivilegedAdmin('team_lead'))
assert(isSystemAdmin('super_admin'))
assert(!isSystemAdmin('admin'))
assert(isMonthlyPlanManager('super_admin'))
assert(!isMonthlyPlanManager('admin'))
assert(!isMonthlyPlanManager('team_lead'))

assert(canAccessAdminConsole('super_admin'))
assert(!canAccessAdminConsole('admin'))
assert(canAccessSystemAdminConsole('super_admin'))
assert(!canAccessSystemAdminConsole('admin'))
assert(!canAccessAdminConsole('team_lead'))
assert(!canAccessAdminConsole('user'))
assert(getAdminRoleLabel('super_admin') === 'ผู้ดูแลระบบสูงสุด')
assert(getAdminRoleLabel('admin') === null)
assert(getAdminRoleLabel('team_lead') === null)

assert(canManageRole('super_admin', 'admin'))
assert(!canManageRole('super_admin', 'super_admin'))
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
assert(!getAssignableRoles('super_admin').includes('super_admin'))
assertEqual(getAssignableRoles('super_admin').join(','), 'team_lead,user,viewer')
assertEqual(getAssignableRoles('admin').length, 0)

assert(canSubmitMonthlyPlan({ role: 'team_lead', isLocked: false, hasTeam: true }))
assert(!canSubmitMonthlyPlan({ role: 'team_lead', isLocked: true, hasTeam: true }))
assert(!canSubmitMonthlyPlan({ role: 'team_lead', isLocked: false, hasTeam: false }))
assert(canSubmitMonthlyPlan({ role: 'user', isLocked: false, hasTeam: true }))
assert(!canSubmitMonthlyPlan({ role: 'user', isLocked: true, hasTeam: true }))
assert(!canSubmitMonthlyPlan({ role: 'user', isLocked: false, hasTeam: false }))
assert(!canSubmitMonthlyPlan({ role: 'viewer', isLocked: false, hasTeam: true }))
assert(!canSubmitMonthlyPlan({ role: 'admin', isLocked: true, hasTeam: false }))
assert(canSubmitMonthlyPlan({ role: 'super_admin', isLocked: true, hasTeam: false }))
assert(canManageMonthlyPlanFile({ role: 'super_admin', currentUserTeamId: null, targetTeamId: 1, isLocked: true }))
assert(!canManageMonthlyPlanFile({ role: 'admin', currentUserTeamId: null, targetTeamId: 1, isLocked: true }))
assert(canManageMonthlyPlanFile({ role: 'team_lead', currentUserTeamId: 1, targetTeamId: 1, isLocked: false }))
assert(!canManageMonthlyPlanFile({ role: 'team_lead', currentUserTeamId: 1, targetTeamId: 2, isLocked: false }))
assert(!canManageMonthlyPlanFile({ role: 'team_lead', currentUserTeamId: 1, targetTeamId: 1, isLocked: true }))
// user now has same own-team file management rights as team_lead
assert(canManageMonthlyPlanFile({ role: 'user', currentUserTeamId: 1, targetTeamId: 1, isLocked: false }))
assert(!canManageMonthlyPlanFile({ role: 'user', currentUserTeamId: 1, targetTeamId: 2, isLocked: false }))
assert(!canManageMonthlyPlanFile({ role: 'user', currentUserTeamId: 1, targetTeamId: 1, isLocked: true }))
assert(!canManageMonthlyPlanFile({ role: 'user', currentUserTeamId: null, targetTeamId: 1, isLocked: false }))
assert(!canManageMonthlyPlanFile({ role: 'viewer', currentUserTeamId: 1, targetTeamId: 1, isLocked: false }))

const activeAdminRoutes = ['/admin', '/admin/users', '/admin/teams', '/admin/capabilities', '/admin/master-data', '/admin/settings'] as const
const forbiddenAdminRoutes = [
  '/admin/audit',
  '/admin/audit/events',
  '/admin/dashboard',
  '/admin/operation-centers',
  '/admin/monthly-plan',
  '/admin/task-daily',
] as const
const nonSuperAdminRoles: Array<UserRole | 'admin'> = ['admin', 'team_lead', 'user', 'viewer']

for (const route of activeAdminRoutes) {
  assert(canAccessAdminRoute('super_admin', route), `super_admin should access active admin route ${route}`)
  for (const role of nonSuperAdminRoles) {
    assert(!canAccessAdminRoute(role, route), `${role} must not access ${route}`)
  }
}

for (const route of forbiddenAdminRoutes) {
  assert(!canAccessAdminRoute('super_admin', route), `round-1 admin route must not allow ${route}`)
  for (const role of nonSuperAdminRoles) {
    assert(!canAccessAdminRoute(role, route), `${role} must not access forbidden admin route ${route}`)
  }
}

assertEqual(getVisibleAdminMenuIds('admin').length, 0)
assert(!(getVisibleAdminMenuIds('super_admin') as readonly string[]).includes('dashboard'))
assert(!(getVisibleAdminMenuIds('super_admin') as readonly string[]).includes('audit'))
assert(getVisibleAdminMenuIds('super_admin').includes('users'))
assert(getVisibleAdminMenuIds('super_admin').includes('teams'))
assert(getVisibleAdminMenuIds('super_admin').includes('capabilities'))
assert(getVisibleAdminMenuIds('super_admin').includes('master-data'))
assert(getVisibleAdminMenuIds('super_admin').includes('settings'))
assertEqual(getVisibleAdminMenuIds('team_lead').length, 0)

assert(canAccessMainNavigationItem('super_admin', '/admin'))
assert(!canAccessMainNavigationItem('admin', '/admin'))
assert(!canAccessMainNavigationItem('team_lead', '/admin'))
assert(!canAccessMainNavigationItem('user', '/admin'))
assert(!canAccessMainNavigationItem('viewer', '/admin'))
assert(canAccessMainNavigationItem('team_lead', '/monthly-plan'))
assert(canAccessMainNavigationItem('user', '/monthly-plan'))
assert(canAccessMainNavigationItem('viewer', '/monthly-plan'))

assertEqual(getAdminConsoleHeroCopy('admin').title, 'จัดการระบบ')
assert(!getAdminConsoleHeroCopy('admin').description.includes('Dashboard'))
assertEqual(getAdminConsoleHeroCopy('super_admin').title, 'จัดการระบบ')
assert(!getAdminConsoleHeroCopy('super_admin').description.includes('Dashboard'))

// ============================================================
// Team Plan Policy Tests
// ============================================================

// canCreateTeamPlan
assert(canCreateTeamPlan('super_admin', false))
assert(!canCreateTeamPlan('admin', false))
assert(!canCreateTeamPlan('admin', true))
assert(canCreateTeamPlan('team_lead', true))
assert(canCreateTeamPlan('user', true))
assert(!canCreateTeamPlan('team_lead', false))
assert(!canCreateTeamPlan('user', false))
assert(!canCreateTeamPlan('viewer', true))

// canEditTeamPlan
assert(canEditTeamPlan('super_admin', 1, 999))  // super_admin can edit any
assert(!canEditTeamPlan('admin', 42, 42))
assert(!canEditTeamPlan('admin', 1, 99, 1, 1))
assert(!canEditTeamPlan('admin', 1, 999))          // no creator match, no team match
assert(!canEditTeamPlan('admin', 1, 99, 1, 2))    // admin's team ≠ target team
assert(canEditTeamPlan('team_lead', 42, 42)) // creator edits own
assert(canEditTeamPlan('user', 42, 42))
assert(!canEditTeamPlan('team_lead', 42, 99)) // cannot edit others
assert(!canEditTeamPlan('user', 42, 99))
assert(!canEditTeamPlan('team_lead', null, 42))
assert(!canEditTeamPlan('user', 42, null))

// canDeleteTeamPlan
assert(canDeleteTeamPlan('super_admin', null, 1))
assert(!canDeleteTeamPlan('admin', 1, 1))
assert(!canDeleteTeamPlan('admin', null, 1))   // no team context
assert(!canDeleteTeamPlan('admin', 1, 2))      // other team
assert(canDeleteTeamPlan('team_lead', 1, 1)) // own team
assert(!canDeleteTeamPlan('team_lead', 1, 2)) // other team
assert(!canDeleteTeamPlan('team_lead', null, 1))
assert(canDeleteTeamPlan('user', 1, 1))
assert(!canDeleteTeamPlan('viewer', 1, 1))

// ============================================================
// Planning Calendar Policy Tests
// ============================================================

assert(canViewPlanningCalendar('super_admin'))
assert(!canViewPlanningCalendar('admin'))
assert(canViewPlanningCalendar('team_lead'))
assert(canViewPlanningCalendar('user'))
assert(canViewPlanningCalendar('viewer'))
assert(!canViewPlanningCalendar(null))
assert(!canViewPlanningCalendar(undefined))

assert(canManagePlanningCalendar('super_admin'))
assert(!canManagePlanningCalendar('admin'))
assert(canManagePlanningCalendar('team_lead'))
assert(canManagePlanningCalendar('user'))

// ============================================================
// Contact Directory Policy Tests
// ============================================================

assert(canViewContactDirectory('super_admin'))
assert(!canViewContactDirectory('admin'))
assert(canViewContactDirectory('team_lead'))
assert(canViewContactDirectory('user'))
assert(canViewContactDirectory('viewer'))
assert(!canViewContactDirectory(null))

assert(canUpdateOwnContact('user'))
assert(canUpdateOwnContact('team_lead'))
assert(!canUpdateOwnContact('viewer'))

assert(canUpdateAnyContact('super_admin'))
assert(!canUpdateAnyContact('admin'))
assert(!canUpdateAnyContact('team_lead'))
assert(!canUpdateAnyContact('user'))

// ============================================================
// Large Work Policy Tests (งานระดมทีม execution replan 2026-05-11)
// ============================================================

// canCreateLargeWork: team_lead creates for own team; super_admin is global.
assert(canCreateLargeWork('super_admin', false))
assert(!canCreateLargeWork('admin', false))
assert(!canCreateLargeWork('admin', true))
assert(canCreateLargeWork('team_lead', true))     // team_lead with team can create
assert(!canCreateLargeWork('team_lead', false))   // no team = cannot create
assert(!canCreateLargeWork('user', true))
assert(!canCreateLargeWork('user', false))
assert(!canCreateLargeWork('viewer', true))

assert(canEditLargeWork('super_admin', 1, 999))
assert(!canEditLargeWork('admin', 42, 42))
assert(!canEditLargeWork('admin', 42, 99, 1, 1))
assert(!canEditLargeWork('admin', 42, 99))             // no creator match, no team args
assert(!canEditLargeWork('admin', 42, 99, 1, 2))      // admin's team ≠ owner team
assert(canEditLargeWork('team_lead', 42, 42))           // team_lead is the creator
assert(!canEditLargeWork('team_lead', 42, 99))           // different creator, no team args
assert(!canEditLargeWork('user', 42, 42))                // user cannot edit even if creator
assert(!canEditLargeWork('user', 42, 99))
assert(!canEditLargeWork('viewer', 42, 42))
// team-based edit (team_lead's team is the owner team)
assert(canEditLargeWork('team_lead', 42, 99, 1, 1))    // own team owns it
assert(!canEditLargeWork('team_lead', 42, 99, 1, 2))    // neither creator nor own team
assert(!canEditLargeWork('team_lead', 42, 99, null, 1)) // no user team

// canManageTeamLargeWork: team_lead is team-scoped, super_admin is global.
assert(canManageTeamLargeWork('super_admin', null, 1))
assert(!canManageTeamLargeWork('admin', 1, 1))
assert(!canManageTeamLargeWork('admin', null, 1))    // no team context
assert(!canManageTeamLargeWork('admin', 1, 2))       // other team
assert(canManageTeamLargeWork('team_lead', 1, 1))   // own team
assert(!canManageTeamLargeWork('team_lead', 1, 2))  // different team
assert(!canManageTeamLargeWork('team_lead', null, 1))
assert(!canManageTeamLargeWork('user', 1, 1))
assert(!canManageTeamLargeWork('viewer', 1, 1))

// canAssignLargeWorkTasks: team_lead is team-scoped, super_admin is global.
assert(canAssignLargeWorkTasks('super_admin', null, 1))
assert(!canAssignLargeWorkTasks('admin', 1, 1))
assert(!canAssignLargeWorkTasks('admin', null, 1))   // no team context
assert(!canAssignLargeWorkTasks('admin', 1, 2))      // other team
assert(canAssignLargeWorkTasks('team_lead', 1, 1))    // team_lead IS the owner team
assert(!canAssignLargeWorkTasks('team_lead', 1, 2))   // team_lead is NOT the owner team
assert(!canAssignLargeWorkTasks('team_lead', null, 1))
assert(!canAssignLargeWorkTasks('user', 1, 1))
assert(!canAssignLargeWorkTasks('viewer', 1, 1))

// canExecuteLargeWorkTask: admin is NOT an executor (like super_admin was before).
// Only user/team_lead of the assigned team can execute.
assert(canExecuteLargeWorkTask('super_admin', null, 1))
assert(!canExecuteLargeWorkTask('admin', 1, 1))     // admin does not execute tasks
assert(!canExecuteLargeWorkTask('admin', null, 1))
assert(canExecuteLargeWorkTask('team_lead', 1, 1))  // team_lead of assigned team
assert(canExecuteLargeWorkTask('user', 1, 1))       // user of assigned team
assert(!canExecuteLargeWorkTask('team_lead', 1, 2)) // different team
assert(!canExecuteLargeWorkTask('user', 1, 2))      // different team
assert(!canExecuteLargeWorkTask('user', null, 1))   // no team
assert(!canExecuteLargeWorkTask('viewer', 1, 1))

// canViewLargeWorkOverview: all authenticated roles can view.
assert(canViewLargeWorkOverview('super_admin'))
assert(!canViewLargeWorkOverview('admin'))
assert(canViewLargeWorkOverview('team_lead'))
assert(canViewLargeWorkOverview('user'))
assert(canViewLargeWorkOverview('viewer'))
assert(!canViewLargeWorkOverview(null))
assert(!canViewLargeWorkOverview(undefined))

// ============================================================
// Daily Report Draft Policy Tests
// ============================================================

// canGenerateDraftsFromPlan
assert(canGenerateDraftsFromPlan('super_admin', false))
assert(!canGenerateDraftsFromPlan('admin', false))
assert(canGenerateDraftsFromPlan('team_lead', true))
assert(canGenerateDraftsFromPlan('user', true))
assert(!canGenerateDraftsFromPlan('team_lead', false))
assert(!canGenerateDraftsFromPlan('user', false))
assert(!canGenerateDraftsFromPlan('viewer', true))

// canManageDailyReportDraft
assert(canManageDailyReportDraft('super_admin', null, 1, true))
assert(!canManageDailyReportDraft('admin', null, 1, true))
assert(canManageDailyReportDraft('team_lead', 1, 1, false))
assert(canManageDailyReportDraft('user', 1, 1, false))
assert(!canManageDailyReportDraft('team_lead', 1, 1, true)) // locked
assert(!canManageDailyReportDraft('user', 1, 1, true)) // locked
assert(!canManageDailyReportDraft('team_lead', 1, 2, false)) // other team
assert(!canManageDailyReportDraft('user', 1, 2, false)) // other team
assert(!canManageDailyReportDraft('team_lead', null, 1, false))
assert(!canManageDailyReportDraft('viewer', 1, 1, false))

console.log('All role-policy tests passed ✓')
