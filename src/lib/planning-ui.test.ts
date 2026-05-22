import { strict as assert } from 'node:assert'
import {
  canAddPlanningWork,
  filterPlanningItems,
  getPlanningCardActions,
  normalizePlanningStatus,
  planningStatusFilterOptions,
  planningStatusLabel,
} from './planning-ui'
import type { PlanningCalendarItem } from '@/types/planning-calendar'

function item(id: string, status: string, route = '/planning?teamPlanId=1'): PlanningCalendarItem {
  return {
    id,
    type: 'team_plan',
    sourceId: Number(id),
    title: `item ${id}`,
    startDate: '2026-05-10',
    endDate: null,
    workTime: null,
    dateKeys: ['2026-05-10'],
    teamIds: [1],
    teams: [{ id: 1, name: 'ทีม A', role: 'owner' }],
    locationText: 'สถานี 1',
    electricArea: {
      peaId: null,
      peaName: null,
      operationCenterId: null,
      operationCenterName: null,
      feederId: null,
      feederCode: null,
      stationId: null,
      stationName: null,
    },
    status,
    source: { route, dailyReportPrefillRoute: null },
    actions: {
      canView: true,
      canEdit: true,
      canCancel: true,
      canUpload: false,
      canDownload: false,
      canStartDailyReport: false,
    },
  }
}

const planned = item('1', 'planned')
const draft = item('2', 'draft')
const inProgress = item('3', 'in_progress')
const completed = item('4', 'completed')
const otherTeamPlan = {
  ...item('5', 'planned'),
  teamIds: [2],
  teams: [{ id: 2, name: 'ทีม B', role: 'owner' as const }],
}

assert.equal(normalizePlanningStatus('planned'), 'planned', 'planned must be a first-class status, not not_started')
assert.equal(normalizePlanningStatus('draft'), 'not_started', 'draft/backlog work remains not_started')
assert.equal(planningStatusLabel('planned'), 'กำหนดวันแล้ว')
assert.equal(planningStatusLabel('draft'), 'รอวางแผน')
assert(planningStatusFilterOptions.some((option) => option.value === 'planned' && option.label === 'กำหนดวันแล้ว'), 'filter must expose planned/กำหนดวันแล้ว')

assert.deepEqual(
  filterPlanningItems([planned, draft, inProgress, completed], { sourceFilter: 'all', statusFilter: 'planned' }).map((entry) => entry.id),
  ['1'],
  'planned filter should only include planned work',
)
assert.deepEqual(
  filterPlanningItems([planned, draft, inProgress, completed], { sourceFilter: 'all', statusFilter: 'not_started' }).map((entry) => entry.id),
  ['2'],
  'not_started filter should exclude dated/planned work',
)
assert.deepEqual(
  filterPlanningItems([planned, otherTeamPlan], {
    sourceFilter: 'all',
    statusFilter: 'all',
    teamScope: { role: 'team_lead', teamId: 1 },
  }).map((entry) => entry.id),
  ['1'],
  'team lead planning view must only include own-team items',
)
assert.deepEqual(
  filterPlanningItems([planned, otherTeamPlan], {
    sourceFilter: 'all',
    statusFilter: 'all',
    teamScope: { role: 'viewer', teamId: null },
  }).map((entry) => entry.id),
  ['1', '5'],
  'viewer planning view remains cross-team read-only',
)

const plannedActions = getPlanningCardActions(planned)
assert.deepEqual(
  plannedActions.map((action) => action.label),
  ['แก้ไข', 'ลบงาน'],
  'team-plan cards must expose edit/delete work actions while hiding unsupported detail and daily-report routes',
)
assert(!plannedActions.some((action) => action.href?.startsWith('/daily-report')), 'planning cards must not link directly to Daily Report per PRD/userflow')
const teamPlanDetail = plannedActions.find((action) => action.id === 'view')
assert.equal(teamPlanDetail, undefined, 'team-plan detail action must be hidden until /planning handles teamPlanId detail routes')
assert(!plannedActions.some((action) => action.href === planned.source.route), 'team-plan card actions must not link to no-op /planning?teamPlanId route')
assert(plannedActions.some((action) => action.id === 'delete' && action.label === 'ลบงาน'), 'team-plan cards with canCancel must show a delete work action')
assert.equal(new Set(plannedActions.map((action) => `${action.label}:${action.href ?? action.disabledReason ?? ''}`)).size, plannedActions.length, 'actions should be unique by label and destination/state')

const largeWork = { ...planned, id: '5', type: 'large_work' as const, source: { route: '/large-work?largeWorkId=5&view=operations', dailyReportPrefillRoute: null } }
const largeWorkActions = getPlanningCardActions(largeWork)
const largeWorkDetail = largeWorkActions.find((action) => action.id === 'view')
assert.equal(largeWorkDetail?.href, '/large-work?largeWorkId=5&view=operations', 'large-work detail opens the dedicated operations route')
assert(
  largeWorkActions.some((action) => action.id === 'delete' && action.label === 'ลบงาน'),
  'large-work cards with canCancel must expose delete work action',
)

const backlogActions = getPlanningCardActions(draft)
assert(backlogActions.some((action) => action.label === 'กำหนดวันใน Calendar' && action.disabled), 'undated/backlog schedule action should be honest disabled copy until real scheduling UI exists')
assert(!backlogActions.some((action) => action.label === 'ย้ายลง Calendar' && action.href === draft.source.route), 'fake move-to-calendar link must not be rendered')

assert.equal(canAddPlanningWork('user', true), true, 'user with own team can add planning work by capability rule')
assert.equal(canAddPlanningWork('user', false), false, 'user without team cannot add planning work')
assert.equal(canAddPlanningWork('viewer', true), false, 'viewer remains read-only')

console.log('✅ planning UI status/filter/action tests passed')
