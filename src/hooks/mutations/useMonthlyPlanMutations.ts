import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { monthlyPlanService } from '@/lib/services/monthly-plan.service'
import { queryKeys } from '@/hooks/useQueries'
import type { ConfirmUploadRequest, UpdateSettingsRequest } from '@/types/monthly-plan'

// ── Confirm Upload (team file or master plan via isMasterPlan flag) ─
export function useConfirmUpload(year?: number, month?: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ConfirmUploadRequest) => {
      if (!year || !month) throw new Error('year/month required')
      return monthlyPlanService.confirmUpload(year, month, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlyPlanFiles', year, month] })
      queryClient.invalidateQueries({ queryKey: ['monthlyPlanStatus', year, month] })
      toast.success('อัพโหลดไฟล์สำเร็จ')
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message)
    },
  })
}

// ── Soft Delete ───────────────────────────────────────────────
export function useSoftDeleteFile(year?: number, month?: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (fileId: number) => monthlyPlanService.softDeleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlyPlanFiles', year, month] })
      queryClient.invalidateQueries({ queryKey: ['monthlyPlanStatus', year, month] })
      toast.success('ยกเลิกไฟล์แล้ว')
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message)
    },
  })
}

// ── Hard Delete (admin) ───────────────────────────────────────
export function useHardDeleteFile(year?: number, month?: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (fileId: number) => monthlyPlanService.hardDeleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlyPlanFiles', year, month] })
      queryClient.invalidateQueries({ queryKey: ['monthlyPlanStatus', year, month] })
      toast.success('ลบไฟล์ถาวรแล้ว')
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message)
    },
  })
}

// ── Restore (admin) ───────────────────────────────────────────
export function useRestoreFile(year?: number, month?: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (fileId: number) => monthlyPlanService.restoreFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlyPlanFiles', year, month] })
      toast.success('คืนค่าไฟล์แล้ว')
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message)
    },
  })
}

// ── Settings (admin) ──────────────────────────────────────────
export function useUpdateSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateSettingsRequest) => monthlyPlanService.updateSettings(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.monthlyPlanSettings })
      toast.success('บันทึก config แล้ว')
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message)
    },
  })
}
