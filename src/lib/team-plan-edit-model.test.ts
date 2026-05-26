import { strict as assert } from 'node:assert'
import {
  buildTeamPlanDialogSubmitPayload,
  buildTeamPlanEditPayload,
  getPlanningCardActions,
  mapTeamPlanToEditForm,
  mapTeamPlanToPlanningItem,
  validateTeamPlanEditDates,
} from './planning-ui'
import type { TeamPlanResponse } from '@/types/team-plan'

function teamPlan(overrides: Partial<TeamPlanResponse> = {}): TeamPlanResponse {
  return {
    id: 42,
    teamId: 7,
    title: 'ตัดต้นไม้แนวสายส่ง',
    workType: 'บำรุงรักษา',
    startDate: '2026-06-10',
    endDate: '2026-06-12',
    workTime: '08:30-16:30',
    locationText: 'สถานี A / F01',
    peaId: 3,
    operationCenterId: 4,
    feederId: 5,
    stationId: 6,
    notes: 'เตรียมรถกระเช้า',
    createdByUserId: 11,
    status: 'planned',
    dailyTaskId: null,
    team: { id: 7, name: 'ทีม Hotline A' },
    createdBy: { id: 11, username: 'planner', displayName: 'Planner' },
    actions: { canEdit: true, canDelete: true },
    createdAt: '2026-05-26T00:00:00Z',
    updatedAt: '2026-05-26T00:00:00Z',
    deletedAt: null,
    ...overrides,
  }
}

const existing = teamPlan()
const form = mapTeamPlanToEditForm(existing)
assert.deepEqual(
  {
    teamId: form.teamId,
    title: form.title,
    startDate: form.startDate,
    endDate: form.endDate,
    workTime: form.workTime,
    feederId: form.feederId,
    locationText: form.locationText,
  },
  {
    teamId: '7',
    title: 'ตัดต้นไม้แนวสายส่ง',
    startDate: '2026-06-10',
    endDate: '2026-06-12',
    workTime: '08:30-16:30',
    feederId: '5',
    locationText: 'สถานี A / F01',
  },
  'existing TeamPlanResponse must prefill edit form date range and work time',
)

const changedDateOnlyPayload = buildTeamPlanEditPayload(existing, {
  ...form,
  startDate: '2026-06-14',
  endDate: '2026-06-15',
  workTime: '09:00-15:00',
})
assert.deepEqual(
  changedDateOnlyPayload,
  {
    teamId: 7,
    title: 'ตัดต้นไม้แนวสายส่ง',
    workType: 'บำรุงรักษา',
    startDate: '2026-06-14',
    endDate: '2026-06-15',
    workTime: '09:00-15:00',
    locationText: 'สถานี A / F01',
    peaId: 3,
    operationCenterId: 4,
    feederId: 5,
    stationId: 6,
    notes: 'เตรียมรถกระเช้า',
    status: 'planned',
  },
  'date-only edit payload must include changed date/workTime and preserve existing required fields',
)

assert.equal(
  validateTeamPlanEditDates({ ...form, startDate: '2026-06-20', endDate: '2026-06-19' }, existing),
  'วันที่สิ้นสุดต้องไม่อยู่ก่อนวันที่เริ่ม',
  'endDate before startDate must block save with Thai validation copy',
)

assert.equal(
  validateTeamPlanEditDates({ ...form, startDate: '', endDate: '' }, existing),
  'ไม่สามารถล้างวันที่ของแผนที่กำหนดวันแล้วได้',
  'emptying scheduled edit dates must be blocked instead of sending null/empty clear',
)

assert.deepEqual(
  buildTeamPlanDialogSubmitPayload({
    plan: existing,
    form: {
      ...form,
      startDate: '2026-06-16',
      endDate: '2026-06-17',
      workTime: '07:30-12:00',
    },
  }),
  {
    teamId: 7,
    title: 'ตัดต้นไม้แนวสายส่ง',
    workType: 'บำรุงรักษา',
    startDate: '2026-06-16',
    endDate: '2026-06-17',
    workTime: '07:30-12:00',
    locationText: 'สถานี A / F01',
    peaId: 3,
    operationCenterId: 4,
    feederId: 5,
    stationId: 6,
    notes: 'เตรียมรถกระเช้า',
    status: 'planned',
  },
  'dialog edit submit must use update payload semantics and preserve existing electric area when feeder catalog is unavailable',
)

const readOnlyPlan = teamPlan({ actions: { canEdit: false, canDelete: false } })
const readOnlyItem = mapTeamPlanToPlanningItem(readOnlyPlan)
assert.equal(readOnlyItem.actions.canEdit, false, 'view model must trust API actions.canEdit=false')
assert(!getPlanningCardActions(readOnlyItem).some((action) => action.id === 'edit'), 'read-only plan must not expose an edit affordance')

console.log('✅ team-plan edit model tests passed')
