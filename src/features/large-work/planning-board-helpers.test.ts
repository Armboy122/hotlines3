import * as assert from 'node:assert/strict'
import type { LargeWorkAddTasksRequest, LargeWorkTaskResponse } from '@/types/large-work'
import {
  UNASSIGNED_LANE_ID,
  applyPlanningBoardDraftDrop,
  applyPlanningBoardTeamDrop,
  assignDraftCardToTeam,
  buildPlanningBoardLanes,
  createEmptyPlanningBoardCard,
  moveDraftCardToLane,
  parseManualLatLong,
  planningBoardDraftsFromTasks,
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
  beforePhotoUrls: [],
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

assert.deepEqual(parseManualLatLong('13.756331, 100.501762'), { lat: 13.756331, lng: 100.501762 })
assert.deepEqual(parseManualLatLong(' 13.756331 ,100.501762 '), { lat: 13.756331, lng: 100.501762 })
assert.equal(parseManualLatLong('13.756331'), null)
assert.equal(parseManualLatLong('ละติจูด, ลองจิจูด'), null)

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
  { id: UNASSIGNED_LANE_ID, title: 'งานที่ยังไม่มอบหมาย', count: 1 },
  { id: 2, title: 'ทีม B', count: 0 },
  { id: 1, title: 'ทีม A', count: 1 },
])
assert.equal(lanes[0].cards[0].clientId, 'draft-u')
assert.equal(lanes[2].cards[0].clientId, 'draft-a')

const backendPlanningTasks: LargeWorkTaskResponse[] = [
  {
    id: 1002,
    largeWorkItemId: 42,
    assignedTeamId: 2,
    sequence: 2,
    pointLabel: ' P-B2 ',
    latitude: 13.75,
    longitude: 100.5,
    workType: 'inspect',
    workDetail: ' ตรวจแนวสาย ',
    pointCount: 4,
    treeCount: null,
    itemCount: 2,
    notes: ' ทำช่วงบ่าย ',
    status: 'todo',
    beforePhotoUrls: ['https://cdn.example/old-before.jpg'],
    afterPhotoUrls: [],
    completionNote: null,
    startedAt: null,
    startedByUserId: null,
    completedAt: null,
    completedByUserId: null,
    metadata: { feeder: 'F02', locationText: 'ใกล้เสาไฟฟ้าแรงสูง' },
    createdAt: '2026-05-12T00:00:00Z',
    updatedAt: '2026-05-12T00:00:00Z',
  },
  {
    id: 1001,
    largeWorkItemId: 42,
    assignedTeamId: 1,
    sequence: 1,
    pointLabel: 'P-A1',
    latitude: null,
    longitude: null,
    workType: 'tree_trim',
    workDetail: 'ตัดกิ่งไม้',
    pointCount: 1,
    treeCount: 3,
    itemCount: null,
    notes: null,
    status: 'in_progress',
    beforePhotoUrls: [],
    afterPhotoUrls: [],
    completionNote: null,
    startedAt: null,
    startedByUserId: null,
    completedAt: null,
    completedByUserId: null,
    metadata: null,
    createdAt: '2026-05-12T00:00:00Z',
    updatedAt: '2026-05-12T00:00:00Z',
  },
]
const hydratedDrafts = planningBoardDraftsFromTasks(backendPlanningTasks)
assert.deepEqual(hydratedDrafts.map((card) => ({
  clientId: card.clientId,
  assignedTeamId: card.assignedTeamId,
  pointLabel: card.pointLabel,
  workType: card.workType,
  workDetail: card.workDetail,
  pointCount: card.pointCount,
  treeCount: card.treeCount,
  itemCount: card.itemCount,
  locationText: card.locationText,
  beforePhotoUrls: card.beforePhotoUrls,
  metadata: card.metadata,
})), [
  {
    clientId: 'task-1001',
    assignedTeamId: 1,
    pointLabel: 'P-A1',
    workType: 'tree_trim',
    workDetail: 'ตัดกิ่งไม้',
    pointCount: 1,
    treeCount: 3,
    itemCount: null,
    locationText: '',
    beforePhotoUrls: [],
    metadata: {},
  },
  {
    clientId: 'task-1002',
    assignedTeamId: 2,
    pointLabel: ' P-B2 ',
    workType: 'inspect',
    workDetail: ' ตรวจแนวสาย ',
    pointCount: 4,
    treeCount: null,
    itemCount: 2,
    locationText: 'ใกล้เสาไฟฟ้าแรงสูง',
    beforePhotoUrls: ['https://cdn.example/old-before.jpg'],
    metadata: { feeder: 'F02', locationText: 'ใกล้เสาไฟฟ้าแรงสูง' },
  },
], 'backend tasks hydrate into editable draft cards ordered by assigned team then sequence')
assert.deepEqual(buildPlanningBoardLanes([{ id: 1, name: 'ทีม A' }, { id: 2, name: 'ทีม B' }], hydratedDrafts).map((lane) => lane.cards.map((card) => card.clientId)), [
  [],
  ['task-1001'],
  ['task-1002'],
], 'hydrated backend tasks render in the correct team lanes')

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
  createEmptyPlanningBoardCard('a-1', { assignedTeamId: 1, pointLabel: 'P-001', workType: 'tree_trim', workDetail: 'ตัดกิ่งไม้', latitude: 13.1, longitude: 100.1 }),
  createEmptyPlanningBoardCard('a-2', { assignedTeamId: 1, pointLabel: 'P-002', workType: 'inspect', workDetail: 'ตรวจสอบ', latitude: 13.2, longitude: 100.2 }),
  createEmptyPlanningBoardCard('b-1', { assignedTeamId: 2, pointLabel: 'P-003', workType: 'inspect', workDetail: 'ตรวจสอบ', latitude: 13.3, longitude: 100.3 }),
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
      sequence: task.sequence,
      hasLocationText: 'locationText' in task,
})), [
  { assignedTeamId: 1, pointLabel: 'P-002', sequence: 1, hasLocationText: false },
  { assignedTeamId: 1, pointLabel: 'P-001', sequence: 2, hasLocationText: false },
  { assignedTeamId: 2, pointLabel: 'P-003', sequence: 1, hasLocationText: false },
])

const invalid = validatePlanningBoardDrafts([
  createEmptyPlanningBoardCard('empty'),
  createEmptyPlanningBoardCard('bad-count', {
    assignedTeamId: 4,
    latitude: 13.7563,
    longitude: 100.5018,
    workDetail: 'รายละเอียดหน้างาน',
    pointCount: -1,
  }),
])
assert.equal(invalid.valid, false)
assert.deepEqual(invalid.errors.empty, ['เลือกทีมรับผิดชอบ', 'ระบุละติจูด', 'ระบุลองจิจูด', 'ระบุรายละเอียดหน้างาน'])
assert.deepEqual(invalid.errors['bad-count'], ['จำนวนจุดต้องไม่ติดลบ'])

const latLongOnlyCard = createEmptyPlanningBoardCard('location-only', {
  assignedTeamId: 2,
  locationText: ' ใกล้ร้านสะดวกซื้อหน้าปากซอย ',
  latitude: 13.756331,
  longitude: 100.501762,
  workDetail: ' ปักจุดหน้างานและรายละเอียดข้อความยาวได้ ',
  beforePhotoUrls: ['https://cdn.example/site.jpg'],
})
assert.deepEqual(validatePlanningBoardDrafts([latLongOnlyCard]), { valid: true, errors: {} }, 'lat/long + long detail is enough; photo is optional')
assert.deepEqual(serializePlanningBoardDrafts([latLongOnlyCard]).tasks[0], {
  assignedTeamId: 2,
  sequence: 1,
  pointLabel: '13.756331, 100.501762',
  latitude: 13.756331,
  longitude: 100.501762,
  workType: 'location_note',
  workDetail: 'ปักจุดหน้างานและรายละเอียดข้อความยาวได้',
  pointCount: null,
  treeCount: null,
  itemCount: null,
  notes: null,
  beforePhotoUrls: ['https://cdn.example/site.jpg'],
  metadata: { locationText: 'ใกล้ร้านสะดวกซื้อหน้าปากซอย' },
})

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
    beforePhotoUrls: ['https://cdn.example/before.jpg'],
  }),
  createEmptyPlanningBoardCard('a-2', {
    assignedTeamId: 1,
    pointLabel: 'P-002',
    workType: 'inspect',
    workDetail: 'ตรวจสอบ',
    latitude: 13.757,
    longitude: 100.502,
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
      sequence: 1,
      pointLabel: 'P-001',
      latitude: 13.7563,
      longitude: 100.5018,
      workType: 'tree_trim',
      workDetail: 'ตัดกิ่งไม้',
      pointCount: 1,
      treeCount: 3,
      itemCount: null,
      notes: 'เข้าพื้นที่เช้า',
      beforePhotoUrls: ['https://cdn.example/before.jpg'],
      metadata: { feeder: 'F01', locationText: 'สถานี A' },
    },
    {
      assignedTeamId: 1,
      sequence: 2,
      pointLabel: 'P-002',
      latitude: 13.757,
      longitude: 100.502,
      workType: 'inspect',
      workDetail: 'ตรวจสอบ',
      pointCount: null,
      treeCount: null,
      itemCount: null,
      notes: null,
      beforePhotoUrls: [],
      metadata: null,
    },
  ],
})
assert.throws(() => serializePlanningBoardDrafts([createEmptyPlanningBoardCard('empty')]), /Cannot serialize invalid planning-board drafts/)

console.log('All planning-board helper tests passed ✓')
