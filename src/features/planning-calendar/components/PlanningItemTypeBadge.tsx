'use client'

import { getPlanningItemTypeLabel, type PlanningItemType } from '@/types/planning-calendar'
import { cn } from '@/lib/utils'

const TYPE_COLORS: Record<PlanningItemType, string> = {
  team_plan: 'bg-sky-100 text-sky-800 border-sky-300',
  monthly_plan: 'bg-teal-100 text-teal-800 border-teal-300',
  large_work: 'bg-slate-100 text-slate-800 border-slate-300',
}

const TYPE_DOT_COLORS: Record<PlanningItemType, string> = {
  team_plan: 'bg-sky-600',
  monthly_plan: 'bg-teal-600',
  large_work: 'bg-slate-500',
}

interface Props {
  type: PlanningItemType
  className?: string
}

export function PlanningItemTypeBadge({ type, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border',
        TYPE_COLORS[type],
        className,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', TYPE_DOT_COLORS[type])} />
      {getPlanningItemTypeLabel(type)}
    </span>
  )
}

export { TYPE_DOT_COLORS }
