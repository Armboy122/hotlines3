'use client'

import { Lock, AlertTriangle } from 'lucide-react'
import type { MonthlyPlanPeriod } from '@/types/monthly-plan'

interface LockBannerProps {
  period: MonthlyPlanPeriod
  missedTeams?: string[]
  isAdmin?: boolean
  effectiveLocked?: boolean
}

export function LockBanner({ period, missedTeams = [], isAdmin = false, effectiveLocked }: LockBannerProps) {
  const isLocked = effectiveLocked ?? period.isLocked
  if (!isLocked) {
    return (
      <div className="card-glass-yellow rounded-2xl p-4 flex items-start gap-3">
        <div className="p-2 icon-glass-yellow shrink-0">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-800">กำหนดส่งภายในวันที่ 23 ของเดือน</p>
          <p className="text-xs text-amber-700 mt-0.5">หลังจากนั้นระบบจะล็อคอัตโนมัติ ทีมจะไม่สามารถอัพโหลดไฟล์เพิ่มได้</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3 bg-red-50/80 border border-red-200/60 shadow-lg shadow-red-500/10" aria-live="polite">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-red-100 border border-red-200 rounded-xl shrink-0">
          <Lock className="h-4 w-4 text-red-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-red-800">ระบบล็อคแล้ว — เลยกำหนดส่ง</p>
          <p className="text-xs text-red-700 mt-0.5">
            {isAdmin
              ? 'Admin ยังสามารถอัพโหลดแผนรวมได้'
              : 'ไม่สามารถอัพโหลดไฟล์เพิ่มได้'}
          </p>
        </div>
      </div>

      {missedTeams.length > 0 && (
        <div className="bg-red-100/60 rounded-xl p-3">
          <p className="text-xs font-semibold text-red-800 mb-1.5">ทีมที่ไม่ได้ส่ง ({missedTeams.length} ทีม):</p>
          <div className="flex flex-wrap gap-1.5">
            {missedTeams.map((name) => (
              <span
                key={name}
                className="text-xs badge-glass-red rounded-full px-2 py-0.5"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
