'use client'

import { cn } from '@/lib/utils'
import { getPlanningItemTypeLabel, type PlanningItemType } from '@/types/planning-calendar'
import { TYPE_DOT_COLORS } from './PlanningItemTypeBadge'

const ALL_TYPES: PlanningItemType[] = ['team_plan', 'monthly_plan', 'large_work']

interface Props {
  activeTypes: PlanningItemType[]
  onToggleType: (type: PlanningItemType) => void
}

export function CalendarFilterBar({ activeTypes, onToggleType }: Props) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-white/70 bg-white/55 p-2 shadow-inner shadow-emerald-900/5 backdrop-blur">
      {ALL_TYPES.map((type) => {
        const isActive = activeTypes.includes(type)
        return (
          <button
            key={type}
            type="button"
            onClick={() => onToggleType(type)}
            aria-pressed={isActive}
            aria-label={`${isActive ? 'ซ่อน' : 'แสดง'}${getPlanningItemTypeLabel(type)}ในปฏิทิน`}
            className={cn(
              'flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-semibold transition-all',
              isActive
                ? 'border-white/80 bg-white text-stone-900 shadow-md shadow-emerald-900/10 ring-1 ring-emerald-100'
                : 'border-stone-200 bg-stone-50/70 text-stone-400 line-through',
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'h-2.5 w-2.5 rounded-full shadow-sm transition-opacity',
                TYPE_DOT_COLORS[type],
                !isActive && 'opacity-40',
              )}
            />
            {getPlanningItemTypeLabel(type)}
          </button>
        )
      })}
    </div>
  )
}
