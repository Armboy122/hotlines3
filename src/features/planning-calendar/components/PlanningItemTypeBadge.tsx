'use client'

import { getPlanningItemTypeLabel, type PlanningItemType } from '@/types/planning-calendar'
import { cn } from '@/lib/utils'

const TYPE_COLORS: Record<PlanningItemType, string> = {
  team_plan: 'bg-sky-100 text-sky-800 border-sky-300',
  monthly_plan: 'bg-teal-100 text-teal-800 border-teal-300',
  large_work: 'bg-blue-100 text-blue-800 border-blue-300',
}

const TYPE_DOT_COLORS: Record<PlanningItemType, string> = {
  team_plan: 'bg-sky-600',
  monthly_plan: 'bg-teal-600',
  large_work: 'bg-blue-600',
}

interface Props {
  type: PlanningItemType
  className?: string
}

export function PlanningItemTypeBadge({ type, className }: Props) {
  return (
    <span
      className={cn(
        'smart-home-chip py-0.5 font-semibold',
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
