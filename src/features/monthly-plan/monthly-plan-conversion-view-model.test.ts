import assert from 'node:assert/strict'
import type { PlanFile } from '@/types/monthly-plan'
import {
  buildMonthlyPlanPageModel,
  buildMonthlyPlanToPlanningConversion,
  shouldShowMonthlyPlanConversionCta,
  type MonthlyPlanUserContext,
} from './monthly-plan-view-model'

const user: MonthlyPlanUserContext = { role: 'team_lead', teamId: 1, capabilities: ['can_upload_approved_monthly_plan'] }
const approved: PlanFile = {
  id: 10,
  monthlyPlanId: 2,
  teamId: null,
  uploadedById: 1,
  fileKey: 'approved.pdf',
  fileURL: 'https://files/approved.pdf',
  fileName: 'approved.pdf',
  fileSizeBytes: 1234,
  description: 'ไฟล์อนุมัติ',
  workStartDate: null,
  workEndDate: null,
  destination: null,
  remarks: null,
  isMasterPlan: true,
  isDeleted: false,
  deletedAt: null,
  createdAt: '2026-05-21T00:00:00Z',
  updatedAt: '2026-05-21T00:00:00Z',
}
const teamPlan = { ...approved, id: 11, isMasterPlan: false, teamId: 1, fileName: 'team-plan.pdf' }

const model = buildMonthlyPlanPageModel({ user, approvedFile: approved, ownTeamPlans: [teamPlan], otherTeamPlans: [], teams: [{ id: 1, name: 'ทีมหนึ่ง' }], year: 2026, month: 5 })
assert.equal(model.approvedFile.file?.id, 10, 'selected-month approved/master file must be the first-class page artifact')
assert.equal(model.planningConversion.visible, true)
assert.equal(model.planningConversion.enabled, true)
assert.equal(model.planningConversion.sourceFileId, 10)
assert.equal(model.planningConversion.ctaText, 'แปลงไฟล์อนุมัติเป็น Planning')
assert.equal(model.planningConversion.confirmText.includes('พฤษภาคม'), true)
assert.deepEqual(buildMonthlyPlanToPlanningConversion({ year: 2026, month: 5, approvedFile: approved, selectedTeamIds: [1, 2] }), {
  year: 2026,
  month: 5,
  approvedFileId: 10,
  selectedTeamIds: [1, 2],
})
assert.equal(shouldShowMonthlyPlanConversionCta(user, approved), true)
assert.equal(shouldShowMonthlyPlanConversionCta({ role: 'viewer', teamId: null, capabilities: [] }, approved), false)
assert.equal(shouldShowMonthlyPlanConversionCta(user, null), false)

console.log('monthly plan conversion view-model tests passed ✓')
