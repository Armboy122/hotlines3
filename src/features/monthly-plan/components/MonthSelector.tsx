'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { MonthlyPlanPeriod } from '@/types/monthly-plan'
import { formatPeriodLabel } from '@/features/monthly-plan/utils'

interface MonthSelectorProps {
  periods: MonthlyPlanPeriod[]
  selectedPeriodId: number | null
  onSelect: (periodId: number) => void
}

export function MonthSelector({ periods, selectedPeriodId, onSelect }: MonthSelectorProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir === 'left' ? -160 : 160, behavior: 'smooth' })
  }

  return (
    <div className="relative flex items-center gap-2">
      <button
        onClick={() => scroll('left')}
        className="shrink-0 p-2 icon-glass-green hover-scale"
        aria-label="เลื่อนซ้าย"
      >
        <ChevronLeft className="h-4 w-4 text-emerald-600" />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-none flex-1 py-1 px-0.5"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {periods.map((period) => {
          const isSelected = period.id === selectedPeriodId
          return (
            <button
              key={period.id}
              onClick={() => onSelect(period.id)}
              className={`
                shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                ${isSelected
                  ? 'btn-gradient-green text-white shadow-lg shadow-emerald-500/30'
                  : 'card-glass text-gray-700 hover:text-emerald-700 hover:border-emerald-300/50'
                }
                ${period.isLocked ? 'opacity-70' : ''}
              `}
            >
              <span>{formatPeriodLabel(period)}</span>
              {period.isLocked && (
                <span className="ml-1 text-xs opacity-80">🔒</span>
              )}
            </button>
          )
        })}
      </div>

      <button
        onClick={() => scroll('right')}
        className="shrink-0 p-2 icon-glass-green hover-scale"
        aria-label="เลื่อนขวา"
      >
        <ChevronRight className="h-4 w-4 text-emerald-600" />
      </button>
    </div>
  )
}
