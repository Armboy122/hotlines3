import type { PlanFile } from '@/types/monthly-plan'
import {
  buildMonthlyPlanPageModel,
  canPreviewApprovedFile,
  canDownloadApprovedFile,
  canUploadApprovedMonthlyPlan,
  canManageOwnTeamMonthlyPlan,
  canViewMonthlyPlanOverview,
  type MonthlyPlanUserContext,
} from './monthly-plan-view-model'

const assert = (value: boolean, message?: string) => {
  if (!value) throw new Error(message ?? 'monthly plan view-model assertion failed')
}
const assertEqual = (actual: unknown, expected: unknown, message?: string) => {
  if (actual !== expected) throw new Error(message ?? `expected ${String(actual)} to equal ${String(expected)}`)
}
const assertArrayEqual = (actual: readonly unknown[], expected: readonly unknown[], message?: string) => {
  const actualText = actual.join(',')
  const expectedText = expected.join(',')
  if (actualText !== expectedText) throw new Error(message ?? `expected ${actualText} to equal ${expectedText}`)
}

const baseFile: PlanFile = {
  id: 10,
  monthlyPlanId: 1,
  teamId: null,
  uploadedById: 7,
  fileKey: 'approved/may.pdf',
  fileURL: 'https://example.test/approved/may.pdf',
  fileName: 'approved-may.pdf',
  fileSizeBytes: 1024,
  description: 'ไฟล์อนุมัติ',
  workStartDate: null,
  workEndDate: null,
  destination: null,
  remarks: null,
  isMasterPlan: true,
  isDeleted: false,
  deletedAt: null,
  createdAt: '2026-05-19T00:00:00Z',
  updatedAt: '2026-05-19T00:00:00Z',
  uploadedBy: { id: 7, username: 'planner' },
}

const userContext = (overrides: Partial<MonthlyPlanUserContext>): MonthlyPlanUserContext => ({
  role: 'user',
  teamId: 1,
  capabilities: [],
  ...overrides,
})

assert(canUploadApprovedMonthlyPlan(userContext({ role: 'super_admin', teamId: null })))
assert(canUploadApprovedMonthlyPlan(userContext({ role: 'team_lead', capabilities: ['can_upload_approved_monthly_plan'] })))
assert(canUploadApprovedMonthlyPlan(userContext({ role: 'user', capabilities: ['can_upload_approved_monthly_plan'] })))
assert(!canUploadApprovedMonthlyPlan(userContext({ role: 'team_lead' })))
assert(!canUploadApprovedMonthlyPlan(userContext({ role: 'viewer', capabilities: ['can_upload_approved_monthly_plan'] })))
assert(!canUploadApprovedMonthlyPlan(userContext({ role: 'admin', capabilities: ['can_upload_approved_monthly_plan'] })), 'legacy admin role must not upload approved monthly plan')

assert(canManageOwnTeamMonthlyPlan(userContext({ role: 'super_admin', teamId: null })))
assert(canManageOwnTeamMonthlyPlan(userContext({ role: 'team_lead', teamId: 1 })))
assert(canManageOwnTeamMonthlyPlan(userContext({ role: 'user', capabilities: ['can_manage_own_team_monthly_plan'] })))
assert(!canManageOwnTeamMonthlyPlan(userContext({ role: 'user', capabilities: [] })))
assert(!canManageOwnTeamMonthlyPlan(userContext({ role: 'viewer', teamId: 1 })))
assert(!canManageOwnTeamMonthlyPlan(userContext({ role: 'admin', teamId: 1, capabilities: ['can_manage_own_team_monthly_plan'] })), 'legacy admin role must not manage own-team monthly plan in redesign')

assert(canViewMonthlyPlanOverview(userContext({ role: 'super_admin', teamId: null })))
assert(canViewMonthlyPlanOverview(userContext({ role: 'team_lead', teamId: 1 })))
assert(canViewMonthlyPlanOverview(userContext({ role: 'viewer', teamId: null })))
assert(!canViewMonthlyPlanOverview(userContext({ role: 'user', capabilities: [] })))

assert(canPreviewApprovedFile(userContext({ role: 'viewer' }), { ...baseFile, fileName: 'approved.png' }))
assert(canPreviewApprovedFile(userContext({ role: 'viewer' }), { ...baseFile, fileName: 'approved.pdf' }))
assert(!canPreviewApprovedFile(userContext({ role: 'viewer' }), { ...baseFile, fileName: 'approved.xlsx' }))
assert(!canPreviewApprovedFile(userContext({ role: 'user' }), baseFile), 'normal user should download approved file but not get preview action')
assert(canPreviewApprovedFile(userContext({ role: 'team_lead', capabilities: ['can_upload_approved_monthly_plan'] }), baseFile), 'approved uploaders should preview approved file')
assert(!canDownloadApprovedFile(userContext({ role: 'viewer' }), baseFile))
assert(canDownloadApprovedFile(userContext({ role: 'user' }), baseFile))
assert(canDownloadApprovedFile(userContext({ role: 'team_lead' }), baseFile))
assert(canDownloadApprovedFile(userContext({ role: 'super_admin', teamId: null }), baseFile))

const normalUserModel = buildMonthlyPlanPageModel({
  user: userContext({ role: 'user', capabilities: [] }),
  approvedFile: baseFile,
  ownTeamPlans: [],
  otherTeamPlans: [],
  teams: [{ id: 1, name: 'ทีมหนึ่ง' }],
})
assertArrayEqual(normalUserModel.tabs.map((tab) => tab.id), ['own-team'], 'normal user should not see overview or upload tab')
assertEqual(normalUserModel.approvedFile.actions.download.visible, true)
assertEqual(normalUserModel.approvedFile.actions.preview.visible, false)
assertEqual(normalUserModel.primaryActions.addOwnTeamPlan.visible, false)
assertEqual(normalUserModel.primaryActions.addOwnTeamPlan.reason, 'ไม่มีสิทธิ์')
assert(!normalUserModel.tabs.some((tab) => tab.id === 'upload-approved'))

const viewerModel = buildMonthlyPlanPageModel({
  user: userContext({ role: 'viewer', teamId: null }),
  approvedFile: { ...baseFile, fileName: 'approved.pdf' },
  ownTeamPlans: [],
  otherTeamPlans: [],
  teams: [],
})
assertArrayEqual(viewerModel.tabs.map((tab) => tab.id), ['own-team', 'overview'])
assertEqual(viewerModel.approvedFile.actions.download.visible, false)
assertEqual(viewerModel.approvedFile.actions.preview.visible, true)
assertEqual(viewerModel.approvedFile.viewerHint, 'ดูตัวอย่างได้เฉพาะไฟล์ PDF/รูปภาพ และไม่มีสิทธิ์ดาวน์โหลด')
assertEqual(viewerModel.primaryActions.uploadApprovedFile.visible, false)

const uploaderModel = buildMonthlyPlanPageModel({
  user: userContext({ role: 'team_lead', capabilities: ['can_upload_approved_monthly_plan'] }),
  approvedFile: { ...baseFile, fileName: 'approved.xlsx' },
  ownTeamPlans: [{ ...baseFile, id: 11, isMasterPlan: false, teamId: 1, fileName: 'team-a.xlsx' }],
  otherTeamPlans: [{ ...baseFile, id: 12, isMasterPlan: false, teamId: 2, fileName: 'team-b.xlsx' }],
  teams: [{ id: 1, name: 'ทีมหนึ่ง' }, { id: 2, name: 'ทีมสอง' }],
})
assertArrayEqual(uploaderModel.tabs.map((tab) => tab.id), ['own-team', 'overview', 'upload-approved'])
assertEqual(uploaderModel.primaryActions.uploadApprovedFile.visible, true)
assertEqual(uploaderModel.uploadSummary.submittedTeamPlanCount, 2)
assertEqual(uploaderModel.uploadSummary.includedInApprovedCount, 1)
assertEqual(uploaderModel.approvedFile.actions.replace.visible, true)
assertEqual(uploaderModel.overviewRows[0]?.canDownload, false, 'team_lead must not download other-team submissions')

const adminModel = buildMonthlyPlanPageModel({
  user: userContext({ role: 'super_admin', teamId: null }),
  approvedFile: null,
  ownTeamPlans: [],
  otherTeamPlans: [],
  teams: [{ id: 1, name: 'ทีมหนึ่ง' }],
})
assertEqual(adminModel.header.showTeamFilter, true)
assertEqual(adminModel.approvedFile.emptyText, 'ยังไม่มีไฟล์อนุมัติประจำเดือนนี้')
assertEqual(adminModel.approvedFile.actions.upload.visible, true)
