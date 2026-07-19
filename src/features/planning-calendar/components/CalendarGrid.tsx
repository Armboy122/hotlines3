'use client'

import { cn } from '@/lib/utils'
import { TYPE_DOT_COLORS } from './PlanningItemTypeBadge'
import { getCellSummary, type PlanningItemType, type PlanningCalendarItem } from '@/types/planning-calendar'

const THAI_DAY_HEADERS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.',
  'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.',
  'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
]

interface Props {
  year: number
  month: number // 1-12
  itemsByDate: Map<string, PlanningCalendarItem[]>
  selectedDate: string | null
  onSelectDate: (dateKey: string) => void
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay()
}

/** Count items per type for a given day */
function typeDotsForDay(items: PlanningCalendarItem[]): PlanningItemType[] {
  const seen = new Set<PlanningItemType>()
  for (const item of items) {
    if (!seen.has(item.type)) seen.add(item.type)
  }
  // stable order
  const order: PlanningItemType[] = ['team_plan', 'monthly_plan', 'large_work']
  return order.filter((t) => seen.has(t))
}

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function buildAriaLabel(
  day: number,
  month: number,
  year: number,
  items: PlanningCalendarItem[],
  summary: ReturnType<typeof getCellSummary>,
): string {
  const thaiMonth = THAI_MONTHS_SHORT[month - 1]
  const buddhistYear = year + 543
  const count = items.length
  if (count === 0) {
    return `${day} ${thaiMonth} ${buddhistYear}`
  }
  const loc = summary.primaryLocation ?? 'ไม่ระบุสถานที่'
  return `${day} ${thaiMonth} ${buddhistYear} มี ${count} แผน ที่ ${loc}`
}

export function CalendarGrid({ year, month, itemsByDate, selectedDate, onSelectDate }: Props) {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfWeek(year, month) // 0=Sun..6=Sat
  const today = new Date()
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  // Build grid cells: null = empty, number = day
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  // pad to complete last week row
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
      {/* Day headers */}
      <div className="grid min-w-0 grid-cols-7 border-b border-slate-200 bg-slate-50">
        {THAI_DAY_HEADERS.map((label, i) => (
          <div
            key={i}
            className={cn(
              'py-2.5 text-center text-xs font-bold tracking-wide',
              i === 0 ? 'text-red-500' : 'text-slate-600',
            )}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid min-w-0 grid-cols-7 bg-white">
        {cells.map((day, idx) => {
          if (day === null) {
            return (
              <div
                key={`empty-${idx}`}
                className="min-h-[76px] min-w-0 border-t border-slate-100 bg-slate-50/70 sm:min-h-[94px]"
              />
            )
          }

          const dateKey = toDateKey(year, month, day)
          const items = itemsByDate.get(dateKey) ?? []
          const dots = typeDotsForDay(items)
          const summary = getCellSummary(items)
          const isToday = dateKey === todayKey
          const isSelected = dateKey === selectedDate
          const isSunday = idx % 7 === 0

          return (
            <button
              key={dateKey}
              onClick={() => onSelectDate(dateKey)}
              aria-label={buildAriaLabel(day, month, year, items, summary)}
              aria-pressed={isSelected || undefined}
              aria-current={isToday ? 'date' : undefined}
              className={cn(
                'group relative flex min-h-[76px] min-w-0 flex-col items-center gap-1 overflow-hidden border-t border-slate-100 p-1.5 text-left transition-colors focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600 sm:min-h-[94px] sm:p-2',
                items.length > 0 && 'bg-blue-50/45',
                isSelected
                  ? 'z-10 bg-blue-50 ring-2 ring-inset ring-blue-600'
                  : 'hover:z-10 hover:bg-slate-50 active:bg-blue-50',
              )}
            >
              {/* Day number — top left */}
              <span
                className={cn(
                  'flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold leading-none self-start transition-colors sm:h-6 sm:min-w-6 sm:text-sm',
                  isSunday ? 'text-red-500' : 'text-slate-800',
                  isToday && !isSelected && 'bg-blue-700 text-white',
                  isSelected && 'bg-blue-950 text-white',
                )}
              >
                {day}
              </span>

              {/* Colored dots */}
              {dots.length > 0 && (
                <div className="flex items-center gap-1 rounded-full bg-white px-1.5 py-1 ring-1 ring-slate-200">
                  {dots.map((type) => (
                    <span
                      key={type}
                      className={cn('h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2', TYPE_DOT_COLORS[type])}
                    />
                  ))}
                </div>
              )}

              {/* Location hint — 1 line, truncated */}
              {summary.primaryLocation && (
                <span className="line-clamp-2 w-full overflow-hidden rounded-md bg-white px-1 py-1 text-center text-[11px] font-semibold leading-tight text-slate-800 ring-1 ring-slate-200 sm:text-xs">
                  {summary.primaryLocation}
                </span>
              )}

              {/* +N indicator — bottom right */}
              {summary.extraCount > 0 && (
                <span className="absolute bottom-1 right-1 rounded-full bg-amber-300 px-1.5 py-0.5 text-[10px] font-bold leading-none text-stone-900 ring-1 ring-white sm:text-xs">
                  +{summary.extraCount}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
