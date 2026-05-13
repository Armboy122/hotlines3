import assert from 'node:assert/strict'
import { invalidateLargeWorkTaskWorkflow } from './useLargeWorkMutations'

const calls: Array<{ queryKey: readonly unknown[]; refetchType?: string }> = []
const fakeQueryClient = {
  invalidateQueries: (args: { queryKey: readonly unknown[]; refetchType?: string }) => {
    calls.push(args)
  },
}

invalidateLargeWorkTaskWorkflow(fakeQueryClient, 42)

assert.deepEqual(
  calls.map((call) => call.queryKey),
  [
    ['largeWorkTasks', 42],
    ['largeWorkOverview', 42],
    ['largeWorkMyTodos'],
    ['largeWorks'],
  ],
  'large-work task workflow mutations must invalidate task lists, overview, worker queue, and owner list queries',
)

assert.ok(
  calls.every((call) => call.refetchType === 'active'),
  'large-work workflow invalidation should actively refetch mounted owner dialogs and worker queues without clearing unrelated caches',
)

console.log('All large-work mutation invalidation tests passed ✓')
