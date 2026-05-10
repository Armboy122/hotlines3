import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { largeWorkService } from '@/lib/services/large-work.service'
import type { LargeWorkRequest, UpdateLargeWorkRequest } from '@/types/large-work'

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
