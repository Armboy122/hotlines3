import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { dailyReportDraftService } from '@/lib/services/daily-report-draft.service'
import type { DailyReportDraftParams } from '@/types/daily-report-draft'

// ── Generate drafts from monthly plan ───────────────────────
export function useGenerateDraftsFromPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: DailyReportDraftParams) =>
      dailyReportDraftService.fromPlan(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyReportDrafts'] })
      toast.success('สร้างร่างรายงานจากแผนเดือนสำเร็จ')
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด: ' + error.message)
    },
  })
}
