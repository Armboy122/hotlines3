import * as assert from 'node:assert/strict'
import type { LargeWorkTaskResponse } from '@/types/large-work'
import {
  canCompleteWorkerTask,
  canStartWorkerTask,
  classifyWorkerTodoState,
  completionPayload,
  initialWorkerTodoDraft,
  nextIncompleteTask,
  photoPayload,
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

assert.deepEqual(photoPayload(' https://img/before.jpg ', 'before'), { kind: 'before', url: 'https://img/before.jpg' })
assert.equal(photoPayload('   ', 'after'), null)
assert.deepEqual(completionPayload({ beforePhotoUrl: '', afterPhotoUrl: ' https://img/after.jpg ', completionNote: ' เสร็จแล้ว ' }), {
  completionNote: 'เสร็จแล้ว',
  afterPhotoUrls: ['https://img/after.jpg'],
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

console.log('All worker-todo-flow tests passed ✓')
