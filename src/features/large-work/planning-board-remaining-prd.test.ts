import assert from 'node:assert/strict'
import type { LargeWorkTaskResponse } from '@/types/large-work'
import {
  buildLargeWorkCompletionReference,
  buildPlanningBoardScheduleLanes,
  createEmptyPlanningBoardCard,
} from './planning-board-helpers'

const unscheduled = createEmptyPlanningBoardCard('u-1', { workDetail: 'ยังไม่ได้กำหนดวัน', metadata: { sourceId: 99 } })
const scheduled = createEmptyPlanningBoardCard('s-1', { workDetail: 'กำหนดวันแล้ว', metadata: { scheduledDate: '2026-05-22' } })
const lanes = buildPlanningBoardScheduleLanes([unscheduled, scheduled])
assert.deepEqual(lanes.map((lane) => ({ id: lane.id, title: lane.title, cards: lane.cards.map((card) => card.clientId) })), [
  { id: 'unscheduled', title: 'รอวางแผน', cards: ['u-1'] },
  { id: 'scheduled', title: 'กำหนดวันแล้ว', cards: ['s-1'] },
])

const completedTask: LargeWorkTaskResponse = {
  id: 701,
  largeWorkItemId: 77,
  assignedTeamId: 10,
  sequence: 1,
  pointLabel: 'P-001',
  latitude: 13.7,
  longitude: 100.5,
  workType: 'tree_trim',
  workDetail: 'ตัดกิ่งไม้',
  pointCount: 1,
  treeCount: 3,
  itemCount: null,
  notes: null,
  status: 'done',
  beforePhotoUrls: [],
  afterPhotoUrls: ['after.jpg'],
  completionNote: 'ดำเนินการแล้ว',
  startedAt: '2026-05-21T08:00:00Z',
  startedByUserId: 1,
  completedAt: '2026-05-21T10:00:00Z',
  completedByUserId: 2,
  metadata: { dailyReportId: 555, dailyReportNo: 'DR-2569-0005' },
  createdAt: '2026-05-20T00:00:00Z',
  updatedAt: '2026-05-21T10:00:00Z',
}
assert.deepEqual(buildLargeWorkCompletionReference(completedTask), {
  dailyReportId: 555,
  label: 'สร้างรายงานประจำวัน DR-2569-0005 แล้ว',
  href: '/daily-report?reportId=555',
})
assert.equal(buildLargeWorkCompletionReference({ ...completedTask, metadata: null }), null)

console.log('planning board remaining PRD helpers tests passed ✓')
