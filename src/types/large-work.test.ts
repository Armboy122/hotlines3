import type { AxiosRequestConfig } from 'axios'
import { apiClient } from '@/lib/api-client'
import { largeWorkService } from '@/lib/services/large-work.service'
import type {
  LargeWorkAddTasksRequest,
  LargeWorkTaskBlockRequest,
  LargeWorkTaskCompleteRequest,
  LargeWorkTaskPhotoRequest,
  LargeWorkTaskRequest,
} from '@/types/large-work'
import type { TaskRowState } from '@/lib/large-work-helpers'
import { computeProgressPercent, buildTaskRowPayload, buildAssignmentPayload } from '@/lib/large-work-helpers'

const assert = (value: boolean, message?: string) => {
  if (!value) throw new Error(message ?? 'assertion failed')
}

const assertEqual = <T>(actual: T, expected: T, message?: string) => {
  if (actual !== expected) throw new Error(message ?? `expected ${String(actual)} to equal ${String(expected)}`)
}

const assertDeepEqual = (actual: unknown, expected: unknown, message?: string) => {
  const actualJson = JSON.stringify(actual)
  const expectedJson = JSON.stringify(expected)
  if (actualJson !== expectedJson) {
    throw new Error(message ?? `expected ${actualJson} to equal ${expectedJson}`)
  }
}

// ============================================================
// Helper function tests (pure, synchronous)
// ============================================================

// computeProgressPercent
assertEqual(computeProgressPercent(0, 0), 0, 'zero total returns 0')
assertEqual(computeProgressPercent(10, 5), 50, '5 of 10 = 50%')
assertEqual(computeProgressPercent(10, 10), 100, 'all done = 100%')
assertEqual(computeProgressPercent(3, 1), 33, '1 of 3 rounds to 33%')
assertEqual(computeProgressPercent(3, 2), 67, '2 of 3 rounds to 67%')

const validRow: TaskRowState = {
  assignedTeamId: '7',
  pointLabel: 'P-001',
  locationText: 'สถานีทดสอบ',
  latitude: '13.7563',
  longitude: '100.5018',
  workType: 'tree_trim',
  workDetail: 'ตัดกิ่งไม้',
  pointCount: '1',
  treeCount: '3',
  itemCount: '',
  notes: 'เข้าพื้นที่เช้า',
}

const goodPayload = buildTaskRowPayload(validRow)
assert(goodPayload !== null, 'valid row should produce a payload')
assertEqual(goodPayload!.assignedTeamId, 7, 'assignedTeamId parsed as number')
assertEqual(goodPayload!.latitude, 13.7563, 'latitude parsed as float')
assertEqual(goodPayload!.itemCount, null, 'empty string becomes null')
assertEqual(goodPayload!.pointLabel, 'P-001', 'string field preserved')
assertEqual(goodPayload!.notes, 'เข้าพื้นที่เช้า', 'Thai notes preserved')
assertEqual(goodPayload!.pointCount, 1, 'pointCount parsed as int')
assertEqual(goodPayload!.treeCount, 3, 'treeCount parsed as int')

assert(buildTaskRowPayload({ ...validRow, assignedTeamId: '' }) === null, 'missing assignedTeamId returns null')
assert(buildTaskRowPayload({ ...validRow, assignedTeamId: '0' }) === null, 'zero assignedTeamId returns null')

const mixedRows = [validRow, { ...validRow, assignedTeamId: '' }]
const assignResults = buildAssignmentPayload(mixedRows)
assertEqual(assignResults.length, 1, 'buildAssignmentPayload filters invalid rows')
assertEqual(assignResults[0].assignedTeamId, 7, 'valid row preserved in result')

const emptyResult = buildAssignmentPayload([])
assertEqual(emptyResult.length, 0, 'empty input returns empty array')

console.log('All large-work helper tests passed ✓')

type ApiCall = {
  method: 'get' | 'post' | 'patch'
  url: string
  data?: unknown
  config?: AxiosRequestConfig
}

const calls: ApiCall[] = []
const original = {
  get: apiClient.get,
  post: apiClient.post,
  patch: apiClient.patch,
}

apiClient.get = async <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  calls.push({ method: 'get', url, config })
  return [] as T
}

apiClient.post = async <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
  calls.push({ method: 'post', url, data, config })
  return [] as T
}

apiClient.patch = async <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
  calls.push({ method: 'patch', url, data, config })
  return [] as T
}

async function main() {
  try {
    const taskPoint: LargeWorkTaskRequest = {
      assignedTeamId: 7,
      sequenceNo: 1,
      pointLabel: 'P-001',
      locationText: 'สถานีทดสอบ',
      latitude: 13.7563,
      longitude: 100.5018,
      workType: 'tree_trim',
      workDetail: 'ตัดกิ่งไม้ใกล้แนวสาย',
      pointCount: 1,
      treeCount: 3,
      itemCount: null,
      notes: 'เข้าพื้นที่เช้า',
      metadata: { feeder: 'F01' },
    }

    const addTasksRequest: LargeWorkAddTasksRequest = { tasks: [taskPoint] }
    const completeRequest: LargeWorkTaskCompleteRequest = {
      completionNote: 'เสร็จตามจุดงาน',
      afterPhotoUrls: ['https://example.test/after-1.jpg'],
    }
    const blockRequest: LargeWorkTaskBlockRequest = { reason: 'ฝนตกหนัก' }
    const photoRequest: LargeWorkTaskPhotoRequest = {
      photoType: 'before',
      photoUrls: ['https://example.test/before-1.jpg'],
    }

    await largeWorkService.getOverview(123)
    await largeWorkService.addTasks(123, addTasksRequest)
    await largeWorkService.listTasks(123)
    await largeWorkService.getMyTodos()
    await largeWorkService.startTask(456)
    await largeWorkService.addTaskPhotos(456, photoRequest)
    await largeWorkService.completeTask(456, completeRequest)
    await largeWorkService.blockTask(456, blockRequest)

    assertEqual(calls.length, 8, 'large work execution service should expose every backend route')
    assertDeepEqual(calls[0], { method: 'get', url: '/v1/large-work-items/123/overview', config: undefined })
    assertDeepEqual(calls[1], { method: 'post', url: '/v1/large-work-items/123/tasks', data: addTasksRequest, config: undefined })
    assertDeepEqual(calls[2], { method: 'get', url: '/v1/large-work-items/123/tasks', config: undefined })
    assertDeepEqual(calls[3], { method: 'get', url: '/v1/large-work-tasks/my-todos', config: undefined })
    assertDeepEqual(calls[4], { method: 'patch', url: '/v1/large-work-tasks/456/start', data: undefined, config: undefined })
    assertDeepEqual(calls[5], { method: 'post', url: '/v1/large-work-tasks/456/photos', data: photoRequest, config: undefined })
    assertDeepEqual(calls[6], { method: 'patch', url: '/v1/large-work-tasks/456/complete', data: completeRequest, config: undefined })
    assertDeepEqual(calls[7], { method: 'patch', url: '/v1/large-work-tasks/456/block', data: blockRequest, config: undefined })

    console.log('All large-work type/service tests passed ✓')
  } finally {
    apiClient.get = original.get
    apiClient.post = original.post
    apiClient.patch = original.patch
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
