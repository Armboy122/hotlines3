import assert from 'node:assert/strict'
import {
  buildReportSummary,
  canMutateReport,
  filterReports,
  getScopedTeamId,
  normalizeTaskDailyReport,
} from './work-report-view-model'
import type { TaskResponse } from '@/types/task-daily'

const baseTask = (overrides: Partial<TaskResponse> = {}): TaskResponse => ({
  id: 1,
  workDate: '2026-05-19',
  teamId: 10,
  jobTypeId: 100,
  jobDetailId: 200,
  feederId: null,
  numPole: null,
  deviceCode: null,
  detail: 'ตรวจสอบระบบและสรุปผลเรียบร้อย',
  urlsBefore: [],
  urlsAfter: ['https://example.com/after.jpg'],
  latitude: null,
  longitude: null,
  team: { id: 10, name: 'ทีม Hotline 1' },
  jobType: { id: 100, name: 'งานจาก Planning' },
  jobDetail: { id: 200, name: 'ตรวจสอบ feeder' },
  createdAt: '2026-05-19T08:00:00Z',
  updatedAt: '2026-05-19T10:00:00Z',
  deletedAt: null,
  ...overrides,
})

const reports = [
  normalizeTaskDailyReport(baseTask({ id: 1, teamId: 10, urlsAfter: ['done.jpg'], jobType: { id: 100, name: 'Planning' } })),
  normalizeTaskDailyReport(baseTask({ id: 2, teamId: 10, urlsAfter: [], jobType: { id: 101, name: 'Monthly Plan' }, detail: null })),
  normalizeTaskDailyReport(baseTask({ id: 3, teamId: 20, urlsAfter: ['done.jpg'], jobType: { id: 102, name: 'งานนอกแผน' } })),
]

assert.equal(getScopedTeamId({ role: 'viewer', teamId: null }, '99'), '99', 'viewer may inspect selected team as read-only')
assert.equal(getScopedTeamId({ role: 'user', teamId: 10 }, '99'), '10', 'normal users stay locked to own team')
assert.equal(getScopedTeamId({ role: 'team_lead', teamId: 10 }, undefined), '10', 'team_lead stays locked to own team')
assert.equal(getScopedTeamId({ role: 'super_admin', teamId: null }, '20'), '20', 'super_admin can select any team')

assert.equal(canMutateReport('viewer', 10, 10), false, 'viewer must not create/edit/delete reports')
assert.equal(canMutateReport('user', 10, 20), false, 'user cannot mutate other team report')
assert.equal(canMutateReport('team_lead', 10, 10), true, 'team_lead can mutate own team report')
assert.equal(canMutateReport('super_admin', null, 20), true, 'super_admin can mutate all reports')

const summary = buildReportSummary(reports, { role: 'super_admin', teamId: null })
assert.deepEqual(
  summary,
  {
    total: 3,
    saved: 2,
    drafts: 1,
    planning: 1,
    monthlyPlan: 1,
    largeWork: 0,
    adHoc: 1,
    reportingTeams: 2,
    teamsWithoutReports: 0,
  },
  'summary cards reflect active report data and source/status counts',
)

const filtered = filterReports(reports, {
  status: 'saved',
  source: 'planning',
  teamId: '10',
})
assert.deepEqual(filtered.map((item) => item.id), [1], 'filters compose by status/source/team')

const searchFiltered = filterReports(reports, { search: 'feeder' })
assert.deepEqual(searchFiltered.map((item) => item.id), [1, 2, 3], 'search covers Thai/English report fields')

console.log('work-report view-model tests passed ✓')
