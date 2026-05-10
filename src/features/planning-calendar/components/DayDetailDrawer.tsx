'use client'

import { X, MapPin, Clock, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PlanningItemTypeBadge } from './PlanningItemTypeBadge'
import type { PlanningCalendarItem } from '@/types/planning-calendar'

interface Props {
  dateKey: string | null
  items: PlanningCalendarItem[]
  onClose: () => void
}

const THAI_DAY_NAMES = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.',
  'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.',
  'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
]

function formatThaiDate(dateKey: string): string {
  const d = new Date(dateKey + 'T00:00:00')
  if (isNaN(d.getTime())) return dateKey
  const day = d.getDate()
  const dayName = THAI_DAY_NAMES[d.getDay()]
  const month = THAI_MONTHS_SHORT[d.getMonth()]
  const year = d.getFullYear() + 543
  return `${dayName} ${day} ${month} ${year}`
}

export function DayDetailDrawer({ dateKey, items, onClose }: Props) {
  if (!dateKey) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer: bottom sheet on mobile, side panel on md+ */}
      <div
        className={cn(
          'fixed z-50 bg-white shadow-xl',
          // Mobile: bottom sheet
          'bottom-0 left-0 right-0 max-h-[70vh] rounded-t-2xl',
          // Desktop: side panel
          'md:bottom-auto md:top-16 md:right-4 md:left-auto md:w-[400px] md:max-h-[calc(100vh-5rem)] md:rounded-2xl md:border md:border-stone-200',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200">
          <h3 className="text-sm sm:text-base font-semibold text-stone-900">
            {formatThaiDate(dateKey)}
          </h3>
          <button
            onClick={onClose}
            aria-label="ปิด"
            className="flex items-center justify-center w-8 h-8 rounded-lg text-stone-500 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(70vh-52px)] md:max-h-[calc(100vh-5rem-52px)] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:pb-3">
          {items.length === 0 ? (
            <p className="text-sm text-stone-500 text-center py-8">
              ไม่มีแผนงานในวันนี้
            </p>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.id}>
                  <DayItemCard item={item} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}

function DayItemCard({ item }: { item: PlanningCalendarItem }) {
  const teamNames = item.teams.map((t) => t.name).join(', ') || '—'

  return (
    <div className="p-3 border border-stone-200 rounded-xl bg-stone-50/50">
      {/* Type badge */}
      <PlanningItemTypeBadge type={item.type} className="mb-2" />

      {/* Title */}
      <p className="text-sm font-medium text-stone-900 mb-1.5">
        {item.title}
      </p>

      {/* Meta info */}
      <div className="flex flex-col gap-1">
        {item.workTime && (
          <div className="flex items-center gap-1.5 text-xs text-stone-600">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>{item.workTime}</span>
          </div>
        )}
        {item.locationText && (
          <div className="flex items-center gap-1.5 text-xs text-stone-600">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{item.locationText}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs text-stone-600">
          <Users className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{teamNames}</span>
        </div>
      </div>
    </div>
  )
}
