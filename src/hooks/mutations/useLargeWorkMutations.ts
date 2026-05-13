import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { largeWorkService } from '@/lib/services/large-work.service'
import type {
  LargeWorkRequest,
  UpdateLargeWorkRequest,
  LargeWorkAddTasksRequest,
  LargeWorkTaskCompleteRequest,
  LargeWorkTaskBlockRequest,
  LargeWorkTaskPhotoRequest,
} from '@/types/large-work'

interface LargeWorkQueryInvalidator {
  invalidateQueries: (filters: { queryKey: readonly unknown[]; refetchType?: 'active' }) => unknown
}

export function invalidateLargeWorkTaskWorkflow(
  queryClient: LargeWorkQueryInvalidator,
  largeWorkItemId: number,
) {
  const options = { refetchType: 'active' as const }

  queryClient.invalidateQueries({ queryKey: ['largeWorkTasks', largeWorkItemId], ...options })
  queryClient.invalidateQueries({ queryKey: ['largeWorkOverview', largeWorkItemId], ...options })
  queryClient.invalidateQueries({ queryKey: ['largeWorkMyTodos'], ...options })
  queryClient.invalidateQueries({ queryKey: ['largeWorks'], ...options })
}

// ── Create large work ───────────────────────────────────────
export function useCreateLargeWork() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LargeWorkRequest) => largeWorkService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['largeWorks'] })
      toast.success('เพิ่มงานใหญ่สำเร็จ')
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message)
    },
  })
}

// ── Update large work ───────────────────────────────────────
export function useUpdateLargeWork() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLargeWorkRequest }) =>
      largeWorkService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['largeWorks'] })
      toast.success('อัปเดตงานใหญ่สำเร็จ')
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message)
    },
  })
}

// ── Cancel large work ───────────────────────────────────────
export function useCancelLargeWork() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => largeWorkService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['largeWorks'] })
      toast.success('ยกเลิกงานใหญ่สำเร็จ')
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message)
    },
  })
}

// ── Add tasks to large work (team_lead/admin) ───────────────
export function useAddLargeWorkTasks() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: LargeWorkAddTasksRequest }) =>
      largeWorkService.addTasks(id, data),
    onSuccess: (_result, variables) => {
      invalidateLargeWorkTaskWorkflow(queryClient, variables.id)
      toast.success('เพิ่มจุดงานสำเร็จ')
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message)
    },
  })
}

// ── Start task execution ────────────────────────────────────
export function useStartLargeWorkTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskId: number) => largeWorkService.startTask(taskId),
    onSuccess: (result) => {
      invalidateLargeWorkTaskWorkflow(queryClient, result.largeWorkItemId)
      toast.success('เริ่มงานสำเร็จ')
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message)
    },
  })
}

// ── Complete task execution ─────────────────────────────────
export function useCompleteLargeWorkTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: number; data: LargeWorkTaskCompleteRequest }) =>
      largeWorkService.completeTask(taskId, data),
    onSuccess: (result) => {
      invalidateLargeWorkTaskWorkflow(queryClient, result.largeWorkItemId)
      toast.success('บันทึกผลงานสำเร็จ')
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message)
    },
  })
}

// ── Block task ──────────────────────────────────────────────
export function useBlockLargeWorkTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: number; data: LargeWorkTaskBlockRequest }) =>
      largeWorkService.blockTask(taskId, data),
    onSuccess: (result) => {
      invalidateLargeWorkTaskWorkflow(queryClient, result.largeWorkItemId)
      toast.success('บันทึกติดขัดสำเร็จ')
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message)
    },
  })
}

// ── Add task photos ─────────────────────────────────────────
export function useAddLargeWorkTaskPhotos() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: number; data: LargeWorkTaskPhotoRequest }) =>
      largeWorkService.addTaskPhotos(taskId, data),
    onSuccess: (result) => {
      invalidateLargeWorkTaskWorkflow(queryClient, result.largeWorkItemId)
      toast.success('บันทึกรูปภาพสำเร็จ')
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message)
    },
  })
}
