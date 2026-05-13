import * as assert from 'node:assert/strict'
import type { LargeWorkTaskResponse, LargeWorkTeamRef } from '@/types/large-work'
import {
  activeTeamRows,
  buildGoogleMapsDirectionsUrl,
  buildGoogleMapsSearchUrl,
  computeTeamOperationSummary,
  groupTasksByTeam,
  mapBeforeWorkPhotoVisibility,
  resolveTeamName,
  taskStatusClass,
  taskHasGps,
  TASK_STATUS_LABELS,
} from './operations-view-helpers'

function task(overrides: Partial<LargeWorkTaskResponse>): LargeWorkTaskResponse {
  return {
    id: 1,
    largeWorkItemId: 10,
    assignedTeamId: 2,
    sequence: 1,
    pointLabel: 'P-001',
    latitude: null,
    longitude: null,
    workType: null,
    workDetail: null,
    pointCount: null,
    treeCount: null,
    itemCount: null,
    notes: null,
    status: 'todo',
    beforePhotoUrls: [],
    afterPhotoUrls: [],
    completionNote: null,
    startedAt: null,
    startedByUserId: null,
    completedAt: null,
    completedByUserId: null,
    metadata: null,
    createdAt: '2026-05-13T00:00:00Z',
    updatedAt: '2026-05-13T00:00:00Z',
    ...overrides,
  }
}

const teams: LargeWorkTeamRef[] = [
  { id: 7, name: 'ทีมฮอตไลน์เหนือ', role: 'participant' },
  { id: 2, name: 'ทีมฮอตไลน์กลาง', role: 'owner' },
  { id: 13, name: 'ทีมฮอตไลน์ใต้', role: 'participant' },
]

assert.equal(resolveTeamName(7, teams), 'ทีมฮอตไลน์เหนือ')
assert.equal(resolveTeamName(99, teams), 'ทีม #99')
assert.equal(resolveTeamName(null, teams), 'ทีม #ไม่ระบุ')
assert.equal(resolveTeamName(44, [{ id: 44, name: '' }]), 'ทีม #44')
assert.equal(resolveTeamName(45, [{ id: 45, name: '   ' }]), 'ทีม #45')

assert.equal(TASK_STATUS_LABELS.todo, 'รอทำ')
assert.equal(TASK_STATUS_LABELS.in_progress, 'กำลังทำ')
assert.equal(TASK_STATUS_LABELS.done, 'เสร็จแล้ว')
assert.match(taskStatusClass('in_progress'), /amber-50/)
assert.match(taskStatusClass('done'), /emerald-50/)
assert.match(taskStatusClass('blocked'), /red-50/)
assert.match(taskStatusClass('todo'), /gray-50/)

assert.equal(taskHasGps(task({ latitude: 13.756331, longitude: 100.501762 })), true)
assert.equal(taskHasGps(task({ latitude: 13.756331, longitude: null })), false)
assert.equal(taskHasGps(task({ latitude: null, longitude: 100.501762 })), false)
assert.equal(buildGoogleMapsSearchUrl(13.756331, 100.501762), 'https://www.google.com/maps/search/?api=1&query=13.756331%2C100.501762')
assert.equal(buildGoogleMapsDirectionsUrl(13.756331, 100.501762), 'https://www.google.com/maps/dir/?api=1&destination=13.756331%2C100.501762')
assert.equal(buildGoogleMapsSearchUrl(-33.86882, 151.209296), 'https://www.google.com/maps/search/?api=1&query=-33.86882%2C151.209296')
assert.equal(buildGoogleMapsDirectionsUrl(-33.86882, 151.209296), 'https://www.google.com/maps/dir/?api=1&destination=-33.86882%2C151.209296')

const operationTasks = [
  task({ id: 101, assignedTeamId: 99, sequence: 1, pointLabel: 'U-001', status: 'todo' }),
  task({ id: 102, assignedTeamId: 2, sequence: 2, pointLabel: 'C-002', status: 'done', completedAt: '2026-05-13T10:00:00Z' }),
  task({ id: 103, assignedTeamId: 7, sequence: 2, pointLabel: 'N-002', status: 'blocked', beforePhotoUrls: ['https://photo.example/before-n2.jpg'] }),
  task({ id: 104, assignedTeamId: 7, sequence: 1, pointLabel: 'N-001', status: 'in_progress', workDetail: 'ตัดกิ่งไม้', latitude: 13.1, longitude: 100.1, startedAt: '2026-05-13T09:00:00Z', beforePhotoUrls: ['https://photo.example/before-n1.jpg'], afterPhotoUrls: ['https://photo.example/after-n1.jpg'] }),
  task({ id: 105, assignedTeamId: 2, sequence: 1, pointLabel: 'C-001', status: 'cancelled' }),
]

const grouped = groupTasksByTeam(operationTasks, teams)
assert.deepEqual(grouped.map((group) => ({ teamId: group.teamId, teamName: group.teamName, taskIds: group.tasks.map((item) => item.id) })), [
  { teamId: 7, teamName: 'ทีมฮอตไลน์เหนือ', taskIds: [104, 103] },
  { teamId: 2, teamName: 'ทีมฮอตไลน์กลาง', taskIds: [105, 102] },
  { teamId: 13, teamName: 'ทีมฮอตไลน์ใต้', taskIds: [] },
  { teamId: 99, teamName: 'ทีม #99', taskIds: [101] },
])
assert.deepEqual(grouped.find((group) => group.teamId === 7)?.summary, {
  total: 2,
  todo: 0,
  inProgress: 1,
  done: 0,
  blocked: 1,
  cancelled: 0,
  active: 1,
  completedPercent: 0,
  beforePhotoCount: 2,
  afterPhotoCount: 1,
  hasBeforePhotos: true,
  hasAfterPhotos: true,
})
assert.deepEqual(grouped.find((group) => group.teamId === 13)?.summary, {
  total: 0,
  todo: 0,
  inProgress: 0,
  done: 0,
  blocked: 0,
  cancelled: 0,
  active: 0,
  completedPercent: 0,
  beforePhotoCount: 0,
  afterPhotoCount: 0,
  hasBeforePhotos: false,
  hasAfterPhotos: false,
})

assert.deepEqual(computeTeamOperationSummary(operationTasks), {
  total: 5,
  todo: 1,
  inProgress: 1,
  done: 1,
  blocked: 1,
  cancelled: 1,
  active: 1,
  completedPercent: 20,
  beforePhotoCount: 2,
  afterPhotoCount: 1,
  hasBeforePhotos: true,
  hasAfterPhotos: true,
})
assert.deepEqual(computeTeamOperationSummary([]), {
  total: 0,
  todo: 0,
  inProgress: 0,
  done: 0,
  blocked: 0,
  cancelled: 0,
  active: 0,
  completedPercent: 0,
  beforePhotoCount: 0,
  afterPhotoCount: 0,
  hasBeforePhotos: false,
  hasAfterPhotos: false,
})

assert.deepEqual(mapBeforeWorkPhotoVisibility([]), {
  optional: true,
  visible: false,
  urls: [],
  emptyText: 'ยังไม่มีรูปก่อนทำงาน',
})
assert.deepEqual(mapBeforeWorkPhotoVisibility(['', ' https://photo.example/before-1.jpg ', 'https://photo.example/before-2.jpg']), {
  optional: true,
  visible: true,
  urls: ['https://photo.example/before-1.jpg', 'https://photo.example/before-2.jpg'],
  emptyText: 'ยังไม่มีรูปก่อนทำงาน',
})

assert.deepEqual(activeTeamRows(operationTasks, teams), [
  {
    taskId: 104,
    teamId: 7,
    teamName: 'ทีมฮอตไลน์เหนือ',
    pointLabel: 'N-001',
    workDetail: 'ตัดกิ่งไม้',
    startedAt: '2026-05-13T09:00:00Z',
    hasGps: true,
  },
])

console.log('All operations-view-helpers tests passed ✓')
