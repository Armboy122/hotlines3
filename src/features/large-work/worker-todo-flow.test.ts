import * as assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { LargeWorkTaskResponse } from '@/types/large-work'
import {
  canCompleteWorkerTask,
  canStartWorkerTask,
  classifyWorkerTodoState,
  completionPayload,
  initialWorkerTodoDraft,
  mapWorkerBeforePhotoPreview,
  nextIncompleteTask,
  photoPayload,
  photoPayloadFromUploadResult,
} from './worker-todo-helpers'

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
    createdAt: '2026-05-11T00:00:00Z',
    updatedAt: '2026-05-11T00:00:00Z',
    ...overrides,
  }
}

const draft = initialWorkerTodoDraft()
assert.deepEqual(draft, { beforePhotoUrl: '', afterPhotoUrl: '', completionNote: '' })

const queue = [
  task({ id: 1, status: 'done' }),
  task({ id: 2, status: 'in_progress', pointLabel: 'P-002' }),
  task({ id: 3, status: 'todo', pointLabel: 'P-003' }),
]
assert.equal(nextIncompleteTask(queue)?.id, 2)
assert.equal(nextIncompleteTask(queue, 2)?.id, 3)
assert.equal(nextIncompleteTask(queue, 3)?.id, 2)
assert.equal(nextIncompleteTask([task({ status: 'done' }), task({ status: 'cancelled' })]), null)

assert.equal(canStartWorkerTask(task({ status: 'todo' })), true)
assert.equal(canStartWorkerTask(task({ status: 'blocked' })), true)
assert.equal(canStartWorkerTask(task({ status: 'in_progress' })), false)

assert.equal(canCompleteWorkerTask(task({ status: 'todo' }), { beforePhotoUrl: 'a', afterPhotoUrl: 'b', completionNote: '' }), false)
assert.equal(canCompleteWorkerTask(task({ status: 'in_progress' }), { beforePhotoUrl: 'a', afterPhotoUrl: '', completionNote: '' }), false)
assert.equal(canCompleteWorkerTask(task({ status: 'in_progress', beforePhotoUrls: ['existing-before'] }), { beforePhotoUrl: '', afterPhotoUrl: 'after', completionNote: '' }), false)
assert.equal(canCompleteWorkerTask(task({ status: 'in_progress', beforePhotoUrls: ['existing-before'] }), { beforePhotoUrl: '', afterPhotoUrl: 'after', completionNote: 'เสร็จแล้ว' }), true)
assert.equal(canCompleteWorkerTask(task({ status: 'in_progress', beforePhotoUrls: [] }), { beforePhotoUrl: '', afterPhotoUrl: 'after', completionNote: 'เสร็จแล้ว' }), true)

assert.deepEqual(photoPayload(' https://img/before.jpg ', 'before'), { kind: 'before', url: 'https://img/before.jpg' })
assert.equal(photoPayload('   ', 'after'), null)
assert.deepEqual(photoPayloadFromUploadResult({ success: true, data: { url: 'https://img/uploaded.jpg' } }, 'after'), { kind: 'after', url: 'https://img/uploaded.jpg' })
assert.equal(photoPayloadFromUploadResult({ success: true }, 'before'), null)
assert.equal(photoPayloadFromUploadResult({ success: false, error: 'failed' }, 'after'), null)
assert.deepEqual(completionPayload({ beforePhotoUrl: '', afterPhotoUrl: ' https://img/after.jpg ', completionNote: ' เสร็จแล้ว ' }), {
  completionNote: 'เสร็จแล้ว',
  afterPhotoUrls: ['https://img/after.jpg'],
})
assert.deepEqual(mapWorkerBeforePhotoPreview(['', ' https://img/before-1.jpg ', 'https://img/before-2.jpg', 'https://img/before-3.jpg', 'https://img/before-4.jpg']), {
  visibleUrls: ['https://img/before-1.jpg', 'https://img/before-2.jpg', 'https://img/before-3.jpg'],
  totalCount: 4,
  remainingCount: 1,
  hasPhotos: true,
})
assert.deepEqual(mapWorkerBeforePhotoPreview([]), {
  visibleUrls: [],
  totalCount: 0,
  remainingCount: 0,
  hasPhotos: false,
})

assert.deepEqual(classifyWorkerTodoState({ tasks: [task({ id: 9 })], error: null, userTeamId: 2 }), {
  kind: 'ready',
  title: 'มีงานระดมทีมที่ต้องทำ',
  description: 'เลือกจุดงานเพื่อเริ่มทำงาน บันทึกรูป และปิดงานทีละจุด',
})
assert.deepEqual(classifyWorkerTodoState({ tasks: [], error: null, userTeamId: 2 }), {
  kind: 'empty',
  title: 'ยังไม่มีงานที่มอบหมายให้ทีมของคุณ',
  description: 'เมื่อหัวหน้าทีมวางแผนและมอบหมายจุดงานให้ทีมนี้ งานจะแสดงในคิวนี้',
})
assert.deepEqual(classifyWorkerTodoState({ tasks: [], error: null, userTeamId: null }), {
  kind: 'no_team',
  title: 'บัญชีนี้ยังไม่ผูกทีม',
  description: 'ติดต่อผู้ดูแลเพื่อกำหนดทีมก่อนใช้งานคิวงานระดมทีม',
})
assert.deepEqual(classifyWorkerTodoState({ tasks: undefined, error: new Error('large work task schema is unavailable'), userTeamId: 2 }), {
  kind: 'schema_unavailable',
  title: 'ระบบคิวงานยังไม่พร้อมใช้งาน',
  description: 'Backend ยังไม่ได้เปิด schema/API สำหรับจุดงานระดมทีม กรุณาลองใหม่หลัง deploy migration',
})
assert.deepEqual(classifyWorkerTodoState({ tasks: undefined, error: new Error('Network Error'), userTeamId: 2 }), {
  kind: 'network_error',
  title: 'เชื่อมต่อระบบคิวงานไม่ได้',
  description: 'ตรวจสอบเครือข่ายหรือ Backend API แล้วกดรีเฟรชอีกครั้ง',
})

const workerQueueSource = readFileSync(resolve(process.cwd(), 'src/features/large-work/components/WorkerTodoQueue.tsx'), 'utf8')
assert.equal(
  /MVP ใช้ URL|วาง URL|บันทึก URL/.test(workerQueueSource),
  false,
  'worker queue upload copy must stay user-facing and avoid URL-paste/technical URL wording',
)
assert.equal(
  /อ่านแผนอย่างเดียว/.test(workerQueueSource),
  false,
  'worker queue detail copy must not imply read-only mode when upload and completion actions are available',
)
assert.equal(
  workerQueueSource.includes('เปิดแผนที่') && workerQueueSource.includes('นำทาง'),
  true,
  'worker queue must offer primary map and directions actions for GPS tasks',
)
assert.equal(
  workerQueueSource.includes('BeforePhotoPreviewStrip') && workerQueueSource.includes('mapWorkerBeforePhotoPreview'),
  true,
  'worker task cards must render uploaded before-work photos, not only a photo count badge',
)
assert.equal(
  /TASK_STATUS_LABELS/.test(workerQueueSource) && /taskStatusClass/.test(workerQueueSource),
  true,
  'worker queue must reuse shared status labels/classes to prevent owner/worker tone conflicts',
)
assert.equal(
  /mapBeforeWorkPhotoVisibility/.test(workerQueueSource),
  true,
  'worker detail must reuse the shared before-photo visibility helper for trimming and empty-state consistency',
)
assert.equal(
  /const STATUS_LABELS|function statusClass/.test(workerQueueSource),
  false,
  'worker queue must not duplicate task status display maps locally',
)
assert.equal(
  /คัดลอกพิกัด|copy\s*lat|copy\/paste|Lat:|Lng:/.test(workerQueueSource),
  false,
  'worker GPS UX must not be a copy/paste-only coordinate flow',
)
assert.equal(
  /<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">/.test(workerQueueSource),
  true,
  'worker task detail metadata must stay single-column on the smallest mobile screens before expanding responsively',
)
assert.equal(
  /const taskBeforePhotos = mapBeforeWorkPhotoVisibility\(task\.beforePhotoUrls\)/.test(workerQueueSource) && /taskBeforePhotos\.urls\.length/.test(workerQueueSource),
  true,
  'worker task cards must count trimmed before-work photos through the shared visibility helper',
)
assert.equal(
  /className="min-h-\[44px\] bg-blue-600 text-white hover:bg-blue-700"[\s\S]*?<Navigation className="h-4 w-4" \/> นำทาง/.test(workerQueueSource),
  true,
  'worker detail directions action must match the primary blue smart-home tone used by task cards and owner operations',
)

console.log('All worker-todo-flow tests passed ✓')
