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
    <div className="flex min-h-12 items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-2 py-2 sm:px-3">
      <button
        onClick={goPrev}
        aria-label="เดือนก่อนหน้า"
        className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 text-blue-700 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="min-w-[150px] text-center sm:min-w-[200px]">
        <div className="text-xs font-medium text-slate-600">แผนงานประจำเดือน</div>
        <div className="mt-0.5 text-base font-bold text-slate-950 sm:text-lg">
          {THAI_MONTHS[month - 1]} {buddhistYear}
        </div>
      </div>

      <button
        onClick={goNext}
        aria-label="เดือนถัดไป"
        className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 text-blue-700 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}
