import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { getDesktopNavItems, getMobileNavItems, navigationItems } from '@/config/navigation'
import {
  canAccessAdminConsole,
  canAccessMainNavigationItem,
  canCreateLargeWork,
  canCreateTeamPlan,
  canDeleteTeamPlan,
  canExecuteLargeWorkTask,
  canManageMonthlyPlanFile,
  canUpdateAnyContact,
  canUpdateOwnContact,
  getAssignableRoles,
} from '@/lib/auth/role-policy'
import { normalizeCalendarResponse } from '@/lib/services/planning-calendar.service'
import { filterPlanningItems, getPlanningCardActions } from '@/lib/planning-ui'
import {
  canDownloadApprovedFile,
  canManageOwnTeamMonthlyPlan,
  canUploadApprovedMonthlyPlan,
  canViewMonthlyPlanOverview,
} from '@/features/monthly-plan/monthly-plan-view-model'
import {
  buildReportSummary,
  canMutateReport,
  filterReports,
  normalizeTaskDailyReport,
} from '@/features/work-report/work-report-view-model'
import { contactCallHref } from '@/features/contacts/contact-directory-view-model'
import type { PlanningCalendarItem } from '@/types/planning-calendar'
import type { PlanFile } from '@/types/monthly-plan'
import type { TaskResponse } from '@/types/task-daily'

type Role = 'super_admin' | 'team_lead' | 'user' | 'viewer' | 'admin'

const root = process.cwd()
const navOrder = navigationItems.map((item) => item.href)
assert.deepEqual(
  navOrder,
  ['/planning', '/large-work', '/monthly-plan', '/daily-report', '/work-report', '/contacts', '/admin'],
  'Requirement B nav order must match PRD/userflow and keep Dashboard/list out of primary IA',
)
assert(!navOrder.includes('/list'), 'legacy /list must not be in main navigation')
assert(!navOrder.some((href) => href.includes('dashboard')), 'Dashboard must not be in main navigation')

for (const role of ['team_lead', 'user', 'viewer', 'admin'] as Role[]) {
  assert.equal(canAccessAdminConsole(role), false, `${role} must not access admin console`)
  assert.equal(canAccessMainNavigationItem(role, '/admin'), false, `${role} must not see /admin nav`)
  assert(!getDesktopNavItems(role as never).some((item) => item.href === '/admin'), `${role} desktop nav must hide /admin`)
  assert(!getMobileNavItems(role as never).some((item) => item.href === '/admin'), `${role} mobile nav must hide /admin`)
}
assert.equal(canAccessAdminConsole('super_admin'), true, 'super_admin must access admin console')
assert(getAssignableRoles('super_admin').join(',') === 'team_lead,user,viewer', 'super_admin assignable roles must exclude protected owner role')
assert.equal(getAssignableRoles('admin').length, 0, 'legacy admin must not assign roles')

assert.equal(canCreateTeamPlan('super_admin', false), true)
assert.equal(canCreateTeamPlan('team_lead', true), true)
assert.equal(canCreateTeamPlan('user', true), true)
assert.equal(canCreateTeamPlan('viewer', true), false)
assert.equal(canCreateTeamPlan('admin', true), false)
assert.equal(canDeleteTeamPlan('team_lead', 1, 1), true)
assert.equal(canDeleteTeamPlan('team_lead', 1, 2), false)

assert.equal(canCreateLargeWork('super_admin', false), true)
assert.equal(canCreateLargeWork('team_lead', true), true)
assert.equal(canCreateLargeWork('user', true), false)
assert.equal(canCreateLargeWork('viewer', true), false)
assert.equal(canExecuteLargeWorkTask('user', 8, 8), true)
assert.equal(canExecuteLargeWorkTask('user', 8, 9), false)

assert.equal(canUploadApprovedMonthlyPlan({ role: 'super_admin', teamId: null, capabilities: [] }), true)
assert.equal(canUploadApprovedMonthlyPlan({ role: 'team_lead', teamId: 1, capabilities: ['can_upload_approved_monthly_plan'] }), true)
assert.equal(canUploadApprovedMonthlyPlan({ role: 'user', teamId: 1, capabilities: ['can_upload_approved_monthly_plan'] }), true)
assert.equal(canUploadApprovedMonthlyPlan({ role: 'viewer', teamId: null, capabilities: ['can_upload_approved_monthly_plan'] }), false)
assert.equal(canUploadApprovedMonthlyPlan({ role: 'admin', teamId: 1, capabilities: ['can_upload_approved_monthly_plan'] }), false)
assert.equal(canManageOwnTeamMonthlyPlan({ role: 'user', teamId: 1, capabilities: [] }), true)
assert.equal(canViewMonthlyPlanOverview({ role: 'viewer', teamId: null, capabilities: [] }), true)

const approvedFile: PlanFile = {
  id: 1,
  monthlyPlanId: 1,
  teamId: null,
  uploadedById: 1,
  fileKey: 'approved/may.pdf',
  fileURL: 'https://example.test/approved/may.pdf',
  fileName: 'approved-may.pdf',
  fileSizeBytes: 1024,
  description: null,
  workStartDate: null,
  workEndDate: null,
  destination: null,
  remarks: null,
  isMasterPlan: true,
  isDeleted: false,
  deletedAt: null,
  createdAt: '2026-05-19T00:00:00Z',
  updatedAt: '2026-05-19T00:00:00Z',
  uploadedBy: { id: 1, username: 'planner' },
}
assert.equal(canDownloadApprovedFile({ role: 'viewer', teamId: null, capabilities: [] }, approvedFile), false, 'viewer must not download approved monthly plan')
assert.equal(canDownloadApprovedFile({ role: 'user', teamId: 1, capabilities: [] }, approvedFile), true, 'normal user can download approved monthly plan')
assert.equal(canManageMonthlyPlanFile({ role: 'user', currentUserTeamId: 1, targetTeamId: 1, isLocked: false }), true)
assert.equal(canManageMonthlyPlanFile({ role: 'user', currentUserTeamId: 1, targetTeamId: 2, isLocked: false }), false)

const normalized = normalizeCalendarResponse({
  from: '2026-05-01',
  to: '2026-05-31',
  items: [
    {
      sourceType: 'team_plan',
      sourceId: 7,
      title: 'งานทีม',
      team: { id: 1, name: 'ทีม A' },
      status: 'planned',
      dateRange: { startDate: '2026-05-19' },
      actions: { canEdit: true, canCancel: true },
    },
    {
      sourceType: 'monthly_plan',
      sourceId: 8,
      title: 'งานจากแผนเดือน',
      team: { id: 1, name: 'ทีม A' },
      status: 'submitted',
      dateRange: { startDate: '2026-05-20' },
      actions: {},
    },
    {
      sourceType: 'large_work',
      sourceId: 9,
      title: 'งานระดมทีม',
      teams: [{ id: 2, name: 'ทีม B' }],
      status: 'planned',
      dateRange: { startDate: '2026-05-21' },
      actions: { canStartDailyReport: true },
    },
  ],
})
assert.equal(normalized.summary.byType.team_plan, 1)
assert.equal(normalized.summary.byType.monthly_plan, 1)
assert.equal(normalized.summary.byType.large_work, 1)
for (const item of normalized.items) {
  assert.equal(item.source.dailyReportPrefillRoute, null, `${item.type} must not expose direct Daily Report prefill link from Planning`)
  assert(!getPlanningCardActions(item).some((action) => action.href?.startsWith('/daily-report')), `${item.type} card must not link to Daily Report`)
}
assert.equal(normalized.items.find((item) => item.type === 'large_work')?.source.route, '/large-work?largeWorkId=9&view=operations')

const ownPlan = normalized.items[0] as PlanningCalendarItem
const otherPlan = { ...ownPlan, id: 'team_plan:99', sourceId: 99, teamIds: [2], teams: [{ id: 2, name: 'ทีม B', role: 'owner' as const }] }
assert.deepEqual(
  filterPlanningItems([ownPlan, otherPlan], { sourceFilter: 'all', statusFilter: 'all', teamScope: { role: 'user', teamId: 1 } }).map((item) => item.id),
  ['team_plan:7'],
  'user planning view must be scoped to own team',
)
assert.deepEqual(
  filterPlanningItems([ownPlan, otherPlan], { sourceFilter: 'all', statusFilter: 'all', teamScope: { role: 'viewer', teamId: null } }).map((item) => item.id),
  ['team_plan:7', 'team_plan:99'],
  'viewer planning view remains cross-team read-only',
)

const task = (overrides: Partial<TaskResponse>): TaskResponse => ({
  id: 1,
  workDate: '2026-05-19',
  teamId: 1,
  jobTypeId: 1,
  jobDetailId: 1,
  feederId: null,
  numPole: null,
  deviceCode: null,
  detail: 'ผลการทำงานเรียบร้อย',
  urlsBefore: [],
  urlsAfter: [],
  latitude: null,
  longitude: null,
  createdAt: '2026-05-19T00:00:00Z',
  updatedAt: '2026-05-19T00:00:00Z',
  deletedAt: null,
  ...overrides,
})
const reports = [
  normalizeTaskDailyReport(task({ id: 1, sourceType: 'team_plan', sourceId: 7 })),
  normalizeTaskDailyReport(task({ id: 2, sourceType: 'monthly_plan', sourceId: 8 })),
  normalizeTaskDailyReport(task({ id: 3, sourceType: 'large_work', sourceId: 9, largeWorkTaskId: 11 })),
  normalizeTaskDailyReport(task({ id: 4, sourceType: null, sourceId: null, detail: null })),
]
const reportSummary = buildReportSummary(reports, { role: 'super_admin', teamId: null })
assert.equal(reportSummary.planning, 1)
assert.equal(reportSummary.monthlyPlan, 1)
assert.equal(reportSummary.largeWork, 1)
assert.equal(reportSummary.adHoc, 1)
assert.deepEqual(
  filterReports(reports, { source: 'large-work' }).map((report) => report.referenceId),
  ['large_work:9:task:11'],
  'large-work report references must preserve source and task ids for completion traceability',
)
assert.equal(canMutateReport('viewer', null, 1), false)
assert.equal(canMutateReport('user', 1, 2), false)
assert.equal(canMutateReport('team_lead', 1, 1), true)

assert.equal(canUpdateAnyContact('super_admin'), true)
assert.equal(canUpdateAnyContact('team_lead'), false)
assert.equal(canUpdateOwnContact('viewer'), false)
assert.equal(canUpdateOwnContact('user'), true)

const monthlyPlanSource = readFileSync(resolve(root, 'src/app/(main)/monthly-plan/page.tsx'), 'utf8')
assert(monthlyPlanSource.indexOf('ไฟล์อนุมัติประจำเดือน') < monthlyPlanSource.indexOf('แผนทีมของฉัน'), 'Monthly Plan page must render approved/master file before own-team section')

const contactsSource = readFileSync(resolve(root, 'src/app/(main)/contacts/page.tsx'), 'utf8')
assert.equal(contactCallHref({ phoneNumber: '+66 81-234-5678 ต่อ 9' }), 'tel:+668123456789', 'Contacts must keep sanitized tel: call action')
assert(/href=\{phoneHref\(entry\.phoneNumber\)\}/.test(contactsSource), 'Contacts page must wire sanitized call href into call actions')
assert(/คัดลอกเบอร์โทร/.test(contactsSource), 'Contacts must keep copy-phone action')
assert(/ดูรายละเอียด/.test(contactsSource), 'Contacts must keep detail action')

const qaScript = readFileSync(resolve(root, 'scripts/qa-playwright-critical-flows.sh'), 'utf8')
for (const route of ['"/login"', '"/planning"', '"/large-work"', '"/monthly-plan"', '"/daily-report"', '"/work-report"', '"/contacts"', '"/admin"']) {
  assert(qaScript.includes(route), `Playwright critical-flow smoke must include ${route}`)
}
assert(!qaScript.includes('/daily-report?sourceType='), 'critical smoke must not preserve removed Planning-to-Daily-Report prefill route')
assert(!existsSync(resolve(root, 'src/app/(main)/list/page.tsx')), 'legacy /list route must stay removed')

console.log('PRD/userflow logic contract tests passed')
