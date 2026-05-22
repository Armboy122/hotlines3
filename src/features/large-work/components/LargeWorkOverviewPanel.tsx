'use client'

import { Loader2, Users } from 'lucide-react'
import { useLargeWorkOverview } from '@/hooks/useQueries'
import { computeProgressPercent } from '@/lib/large-work-helpers'
import { cn } from '@/lib/utils'

interface Props {
  id: number
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

export function LargeWorkOverviewPanel({ id }: Props) {
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

  const { progress, teamProgress, plan } = overview
  const pct = computeProgressPercent(progress.total, progress.done)

  return (
    <div className="space-y-3 border-t border-amber-100 pt-3">
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>ความคืบหน้า</span>
          <span className="font-semibold text-gray-700">{pct}% ({progress.done}/{progress.total} จุด)</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-700 to-sky-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Status chips */}
      <div className="flex flex-wrap gap-2">
        <StatusChip count={progress.todo} label={TASK_STATUS_LABELS.todo} color="border-gray-200 bg-gray-50 text-gray-600" />
        <StatusChip count={progress.inProgress} label={TASK_STATUS_LABELS.in_progress} color="border-sky-200 bg-sky-50 text-sky-700" />
        <StatusChip count={progress.done} label={TASK_STATUS_LABELS.done} color="border-sky-200 bg-sky-50 text-blue-700" />
        {progress.blocked > 0 && (
          <StatusChip count={progress.blocked} label={TASK_STATUS_LABELS.blocked} color="border-red-200 bg-red-50 text-red-600" />
        )}
        {progress.cancelled > 0 && (
          <StatusChip count={progress.cancelled} label={TASK_STATUS_LABELS.cancelled} color="border-gray-200 bg-gray-50 text-gray-400" />
        )}
      </div>

      {/* Per-team progress */}
      {teamProgress.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">สรุปรายทีม</p>
          {teamProgress.map((team) => {
            const teamPct = computeProgressPercent(team.total, team.done)
            const teamName = plan.teams.find((t) => t.id === team.assignedTeamId)?.name ?? `ทีม ${team.assignedTeamId}`
            return (
              <div key={team.assignedTeamId} className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                <span className="min-w-0 flex-1 truncate text-xs text-gray-700">{teamName}</span>
                <span className="shrink-0 text-xs text-gray-500">{team.done}/{team.total}</span>
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100 shrink-0">
                  <div className="h-full rounded-full bg-sky-500" style={{ width: `${teamPct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}
