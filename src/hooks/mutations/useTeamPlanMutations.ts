import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { teamPlanService } from '@/lib/services/team-plan.service'
import type { TeamPlanRequest, UpdateTeamPlanRequest } from '@/types/team-plan'

// ── Error copy ───────────────────────────────────────────────
export function formatTeamPlanMutationError(error: Error): string {
  const message = error.message || 'เกิดข้อผิดพลาด'
  const normalized = message.toLowerCase()
  if (
    normalized.includes('403')
    || normalized.includes('forbidden')
    || normalized.includes('permission')
    || message.includes('ไม่มีสิทธิ์')
  ) {
    return 'ไม่มีสิทธิ์แก้ไขแผนทีม'
  }
  return 'เกิดข้อผิดพลาด: ' + message
}

// ── Create team plan ────────────────────────────────────────
export function useCreateTeamPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TeamPlanRequest) => teamPlanService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamPlans'] })
      queryClient.invalidateQueries({ queryKey: ['planningCalendar'] })
      toast.success('สร้างแผนทีมสำเร็จ')
    },
    onError: (error: Error) => {
      toast.error(formatTeamPlanMutationError(error))
    },
  })
}

// ── Update team plan ────────────────────────────────────────
export function useUpdateTeamPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTeamPlanRequest }) =>
      teamPlanService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamPlans'] })
      queryClient.invalidateQueries({ queryKey: ['planningCalendar'] })
      toast.success('อัปเดตแผนทีมสำเร็จ')
    },
    onError: (error: Error) => {
      toast.error(formatTeamPlanMutationError(error))
    },
  })
}

// ── Cancel team plan ────────────────────────────────────────
export function useCancelTeamPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => teamPlanService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamPlans'] })
      queryClient.invalidateQueries({ queryKey: ['planningCalendar'] })
      toast.success('ยกเลิกแผนทีมสำเร็จ')
    },
    onError: (error: Error) => {
      toast.error(formatTeamPlanMutationError(error))
    },
  })
}

// ── Remove (soft-delete) team plan ──────────────────────────
export function useRemoveTeamPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => teamPlanService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamPlans'] })
      queryClient.invalidateQueries({ queryKey: ['planningCalendar'] })
      toast.success('ลบแผนทีมสำเร็จ')
    },
    onError: (error: Error) => {
      toast.error(formatTeamPlanMutationError(error))
    },
  })
}
