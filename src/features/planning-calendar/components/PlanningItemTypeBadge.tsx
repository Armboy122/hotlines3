'use client'

import { getPlanningItemTypeLabel, type PlanningItemType } from '@/types/planning-calendar'
import { cn } from '@/lib/utils'

const TYPE_COLORS: Record<PlanningItemType, string> = {
  team_plan: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  monthly_plan: 'bg-amber-100 text-amber-800 border-amber-300',
  large_work: 'bg-amber-100 text-amber-900 border-amber-400',
}

const TYPE_DOT_COLORS: Record<PlanningItemType, string> = {
  team_plan: 'bg-emerald-500',
  monthly_plan: 'bg-amber-500',
  large_work: 'bg-amber-700',
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
