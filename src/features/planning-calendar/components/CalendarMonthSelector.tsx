'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
  'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
  'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
]

interface Props {
  year: number
  month: number // 1-12
  onChange: (year: number, month: number) => void
}

export function CalendarMonthSelector({ year, month, onChange }: Props) {
  const buddhistYear = year + 543

  function goPrev() {
    if (month === 1) {
      onChange(year - 1, 12)
    } else {
      onChange(year, month - 1)
    }
  }

  function goNext() {
    if (month === 12) {
      onChange(year + 1, 1)
    } else {
      onChange(year, month + 1)
    }
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-2xl border border-emerald-100/70 bg-gradient-to-r from-white via-emerald-50/70 to-amber-50/60 px-3 py-3 shadow-sm shadow-emerald-900/5 sm:px-4">
      <button
        onClick={goPrev}
        aria-label="เดือนก่อนหน้า"
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/70 bg-white/80 text-stone-600 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-50 hover:text-emerald-700 active:translate-y-0 active:bg-emerald-100"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="min-w-[160px] text-center sm:min-w-[200px]">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700/80">
          แผนงานประจำเดือน
        </div>
        <div className="mt-0.5 text-lg font-black text-stone-950 sm:text-xl">
          {THAI_MONTHS[month - 1]} {buddhistYear}
        </div>
      </div>

      <button
        onClick={goNext}
        aria-label="เดือนถัดไป"
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/70 bg-white/80 text-stone-600 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-50 hover:text-emerald-700 active:translate-y-0 active:bg-emerald-100"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}
