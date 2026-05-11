import * as assert from 'node:assert/strict'
import type { LargeWorkAddTasksRequest } from '@/types/large-work'
import {
  UNASSIGNED_LANE_ID,
  applyPlanningBoardDraftDrop,
  applyPlanningBoardTeamDrop,
  assignDraftCardToTeam,
  buildPlanningBoardLanes,
  createEmptyPlanningBoardCard,
  moveDraftCardToLane,
  reorderDraftCardsWithinLane,
  serializePlanningBoardDrafts,
  validatePlanningBoardDrafts,
} from './planning-board-helpers'

const base = createEmptyPlanningBoardCard('card-1')
assert.deepEqual(base, {
  clientId: 'card-1',
  assignedTeamId: null,
  pointLabel: '',
  workType: '',
  workDetail: '',
  locationText: '',
  latitude: null,
  longitude: null,
  pointCount: null,
  treeCount: null,
  itemCount: null,
  notes: '',
  metadata: {},
})

const filled = createEmptyPlanningBoardCard('card-2', {
  assignedTeamId: 7,
  pointLabel: ' P-001 ',
  workType: 'tree_trim',
  workDetail: ' ตัดกิ่งไม้ ',
  locationText: 'สถานี A',
  latitude: 13.7563,
  longitude: 100.5018,
  pointCount: 1,
  treeCount: 3,
  notes: ' เข้าพื้นที่เช้า ',
  metadata: { feeder: 'F01' },
})
assert.equal(filled.assignedTeamId, 7)
assert.equal(filled.metadata.feeder, 'F01')
assert.equal(filled.workDetail, ' ตัดกิ่งไม้ ')

assert.deepEqual(assignDraftCardToTeam(filled, 9), { ...filled, assignedTeamId: 9 })
assert.equal(assignDraftCardToTeam(filled, UNASSIGNED_LANE_ID).assignedTeamId, null)
assert.equal(assignDraftCardToTeam(filled, null).assignedTeamId, null)

const lanes = buildPlanningBoardLanes(
  [
    { id: 2, name: 'ทีม B' },
    { id: 1, name: 'ทีม A' },
  ],
  [
    createEmptyPlanningBoardCard('draft-u', { pointLabel: 'ยังไม่มอบหมาย' }),
    createEmptyPlanningBoardCard('draft-a', { assignedTeamId: 1, pointLabel: 'A draft' }),
  ],
)
assert.deepEqual(lanes.map((lane) => ({ id: lane.id, title: lane.title, count: lane.cards.length })), [
  { id: 2, title: 'ทีม B', count: 0 },
  { id: 1, title: 'ทีม A', count: 1 },
  { id: UNASSIGNED_LANE_ID, title: 'งานที่ยังไม่มอบหมาย', count: 1 },
])
assert.equal(lanes[1].cards[0].clientId, 'draft-a')
assert.equal(lanes[2].cards[0].clientId, 'draft-u')

const board = [
  createEmptyPlanningBoardCard('u-1', { pointLabel: 'U1' }),
  createEmptyPlanningBoardCard('a-1', { assignedTeamId: 1, pointLabel: 'A1' }),
  createEmptyPlanningBoardCard('a-2', { assignedTeamId: 1, pointLabel: 'A2' }),
  createEmptyPlanningBoardCard('b-1', { assignedTeamId: 2, pointLabel: 'B1' }),
]

const movedToTeam = moveDraftCardToLane(board, 'u-1', 1, 1)
assert.deepEqual(movedToTeam.map((card) => `${card.clientId}:${card.assignedTeamId ?? 'u'}`), [
  'a-1:1',
  'u-1:1',
  'a-2:1',
  'b-1:2',
])
assert.notEqual(movedToTeam[1], board[0], 'moving creates an updated card copy')
assert.deepEqual(board.map((card) => `${card.clientId}:${card.assignedTeamId ?? 'u'}`), [
  'u-1:u',
  'a-1:1',
  'a-2:1',
  'b-1:2',
], 'moving is immutable')

const movedToUnassigned = moveDraftCardToLane(board, 'b-1', UNASSIGNED_LANE_ID, 0)
assert.deepEqual(movedToUnassigned.map((card) => `${card.clientId}:${card.assignedTeamId ?? 'u'}`), [
  'b-1:u',
  'u-1:u',
  'a-1:1',
  'a-2:1',
])

assert.throws(() => moveDraftCardToLane(board, 'missing', 1, 0), /missing draft card/)
assert.throws(() => moveDraftCardToLane(board, 'u-1', 1, -1), /target index/)

const reordered = reorderDraftCardsWithinLane(board, 1, 1, 0)
assert.deepEqual(reordered.map((card) => card.clientId), ['u-1', 'a-2', 'a-1', 'b-1'])
assert.deepEqual(reorderDraftCardsWithinLane(board, 1, 0, 0), board, 'no-op reorder returns the same order')
assert.throws(() => reorderDraftCardsWithinLane(board, 1, 3, 0), /source index/)

const dragAssignedFromUnassigned = applyPlanningBoardDraftDrop(board, {
  activeClientId: 'u-1',
  overLaneId: 2,
  overClientId: 'b-1',
})
assert.deepEqual(dragAssignedFromUnassigned.map((card) => `${card.clientId}:${card.assignedTeamId ?? 'u'}`), [
  'a-1:1',
  'a-2:1',
  'u-1:2',
  'b-1:2',
])

const dragReorderedWithinLane = applyPlanningBoardDraftDrop([
  createEmptyPlanningBoardCard('a-1', { assignedTeamId: 1, pointLabel: 'P-001', workType: 'tree_trim', workDetail: 'ตัดกิ่งไม้' }),
  createEmptyPlanningBoardCard('a-2', { assignedTeamId: 1, pointLabel: 'P-002', workType: 'inspect', workDetail: 'ตรวจสอบ' }),
  createEmptyPlanningBoardCard('b-1', { assignedTeamId: 2, pointLabel: 'P-003', workType: 'inspect', workDetail: 'ตรวจสอบ' }),
], {
  activeClientId: 'a-2',
  overLaneId: 1,
  overClientId: 'a-1',
})
assert.deepEqual(dragReorderedWithinLane.map((card) => card.clientId), ['a-2', 'a-1', 'b-1'])

const teamDroppedOnDraftCard = applyPlanningBoardTeamDrop(board, {
  activeTeamId: 2,
  overClientId: 'u-1',
})
assert.deepEqual(teamDroppedOnDraftCard.map((card) => `${card.clientId}:${card.assignedTeamId ?? 'u'}`), [
  'u-1:2',
  'a-1:1',
  'a-2:1',
  'b-1:2',
])
assert.deepEqual(board.map((card) => `${card.clientId}:${card.assignedTeamId ?? 'u'}`), [
  'u-1:u',
  'a-1:1',
  'a-2:1',
  'b-1:2',
], 'team-to-card assignment is immutable')
assert.throws(() => applyPlanningBoardTeamDrop(board, { activeTeamId: 2, overClientId: 'missing' }), /missing target draft card/)
assert.deepEqual(serializePlanningBoardDrafts(dragReorderedWithinLane).tasks.map((task) => ({
  assignedTeamId: task.assignedTeamId,
  pointLabel: task.pointLabel,
  sequenceNo: task.sequenceNo,
})), [
  { assignedTeamId: 1, pointLabel: 'P-002', sequenceNo: 1 },
  { assignedTeamId: 1, pointLabel: 'P-001', sequenceNo: 2 },
  { assignedTeamId: 2, pointLabel: 'P-003', sequenceNo: 1 },
])

const invalid = validatePlanningBoardDrafts([
  createEmptyPlanningBoardCard('empty'),
  createEmptyPlanningBoardCard('bad-count', {
    assignedTeamId: 4,
    pointLabel: 'P-004',
    workType: 'tree_trim',
    workDetail: 'ตัดกิ่งไม้',
    pointCount: -1,
  }),
])
assert.equal(invalid.valid, false)
assert.deepEqual(invalid.errors.empty, ['เลือกทีมรับผิดชอบ', 'ระบุชื่อจุดงาน', 'ระบุประเภทงาน', 'ระบุรายละเอียดงาน'])
assert.deepEqual(invalid.errors['bad-count'], ['จำนวนจุดต้องไม่ติดลบ'])

const validCards = [
  createEmptyPlanningBoardCard('a-1', {
    assignedTeamId: 1,
    pointLabel: ' P-001 ',
    workType: 'tree_trim',
    workDetail: ' ตัดกิ่งไม้ ',
    locationText: ' สถานี A ',
    latitude: 13.7563,
    longitude: 100.5018,
    pointCount: 1,
    treeCount: 3,
    itemCount: null,
    notes: ' เข้าพื้นที่เช้า ',
    metadata: { feeder: 'F01' },
  }),
  createEmptyPlanningBoardCard('a-2', {
    assignedTeamId: 1,
    pointLabel: 'P-002',
    workType: 'inspect',
    workDetail: 'ตรวจสอบ',
    locationText: '',
    notes: '',
  }),
]
assert.deepEqual(validatePlanningBoardDrafts(validCards), { valid: true, errors: {} })

const payload: LargeWorkAddTasksRequest = serializePlanningBoardDrafts(validCards)
assert.deepEqual(payload, {
  tasks: [
    {
      assignedTeamId: 1,
      sequenceNo: 1,
      pointLabel: 'P-001',
      locationText: 'สถานี A',
      latitude: 13.7563,
      longitude: 100.5018,
      workType: 'tree_trim',
      workDetail: 'ตัดกิ่งไม้',
      pointCount: 1,
      treeCount: 3,
      itemCount: null,
      notes: 'เข้าพื้นที่เช้า',
      metadata: { feeder: 'F01' },
    },
    {
      assignedTeamId: 1,
      sequenceNo: 2,
      pointLabel: 'P-002',
      locationText: null,
      latitude: null,
      longitude: null,
      workType: 'inspect',
      workDetail: 'ตรวจสอบ',
      pointCount: null,
      treeCount: null,
      itemCount: null,
      notes: null,
      metadata: null,
    },
  ],
})
assert.throws(() => serializePlanningBoardDrafts([createEmptyPlanningBoardCard('empty')]), /Cannot serialize invalid planning-board drafts/)

console.log('All planning-board helper tests passed ✓')
