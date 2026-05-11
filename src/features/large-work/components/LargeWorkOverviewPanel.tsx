'use client'

import { Loader2, Users } from 'lucide-react'
import { useLargeWorkOverview } from '@/hooks/useQueries'
import { computeProgressPercent } from '@/lib/large-work-helpers'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  id: number
  canAssignTasks: boolean
  onManageTasks: () => void
}

const TASK_STATUS_LABELS: Record<string, string> = {
  todo: 'รอ',
  in_progress: 'กำลังทำ',
  done: 'เสร็จ',
  blocked: 'ติดขัด',
  cancelled: 'ยกเลิก',
}

function StatusChip({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <div className={cn('flex flex-col items-center rounded-xl border px-3 py-2 min-w-[56px]', color)}>
      <span className="text-base font-black">{count}</span>
      <span className="text-[10px] font-medium">{label}</span>
    </div>
  )
}

export function LargeWorkOverviewPanel({ id, canAssignTasks, onManageTasks }: Props) {
  const { data: overview, isLoading, error } = useLargeWorkOverview(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
      </div>
    )
  }

  if (error || !overview) {
    return (
      <p className="text-xs text-red-500 py-2">ไม่สามารถโหลดข้อมูลสรุปได้</p>
    )
  }

  const pct = computeProgressPercent(overview.totalTasks, overview.doneCount)

  return (
    <div className="space-y-3 border-t border-amber-100 pt-3">
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>ความคืบหน้า</span>
          <span className="font-semibold text-gray-700">{pct}% ({overview.doneCount}/{overview.totalTasks} จุด)</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Status chips */}
      <div className="flex flex-wrap gap-2">
        <StatusChip count={overview.todoCount} label={TASK_STATUS_LABELS.todo} color="border-gray-200 bg-gray-50 text-gray-600" />
        <StatusChip count={overview.inProgressCount} label={TASK_STATUS_LABELS.in_progress} color="border-sky-200 bg-sky-50 text-sky-700" />
        <StatusChip count={overview.doneCount} label={TASK_STATUS_LABELS.done} color="border-emerald-200 bg-emerald-50 text-emerald-700" />
        {overview.blockedCount > 0 && (
          <StatusChip count={overview.blockedCount} label={TASK_STATUS_LABELS.blocked} color="border-red-200 bg-red-50 text-red-600" />
        )}
        {overview.cancelledCount > 0 && (
          <StatusChip count={overview.cancelledCount} label={TASK_STATUS_LABELS.cancelled} color="border-gray-200 bg-gray-50 text-gray-400" />
        )}
      </div>

      {/* Per-team progress */}
      {overview.teamProgress.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">สรุปรายทีม</p>
          {overview.teamProgress.map((team) => {
            const teamPct = computeProgressPercent(team.totalTasks, team.doneCount)
            return (
              <div key={team.teamId} className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                <span className="min-w-0 flex-1 truncate text-xs text-gray-700">{team.teamName}</span>
                <span className="shrink-0 text-xs text-gray-500">{team.doneCount}/{team.totalTasks}</span>
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100 shrink-0">
                  <div className="h-full rounded-full bg-emerald-400" style={{ width: `${teamPct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Manage tasks action */}
      {canAssignTasks && (
        <Button
          size="sm"
          onClick={onManageTasks}
          className="mt-1 min-h-[44px] w-full bg-amber-600 text-white hover:bg-amber-700 sm:w-auto"
        >
          เปิดโต๊ะวางแผนงาน
        </Button>
      )}
    </div>
  )
}
