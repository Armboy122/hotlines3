'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2, CheckCircle2, Settings, Lock, CalendarDays, Bell, HardDrive } from 'lucide-react'
import { useMonthlyPlanSettings } from '@/hooks/useQueries'
import { useUpdateSettings } from '@/hooks/mutations/useMonthlyPlanMutations'
import type { MonthlyPlanSettings } from '@/types/monthly-plan'

interface FormState {
  lockDay: number
  autoCreateDay: number
  reminderStartDay: number
  maxFileSizeMB: string
  adminCanUploadAfterLock: boolean
}

const DEFAULT_FORM: FormState = {
  lockDay: 23,
  autoCreateDay: 1,
  reminderStartDay: 20,
  maxFileSizeMB: '',
  adminCanUploadAfterLock: true,
}

function settingsToForm(s: MonthlyPlanSettings): FormState {
  return {
    lockDay: s.lockDay,
    autoCreateDay: s.autoCreateDay,
    reminderStartDay: s.reminderStartDay,
    maxFileSizeMB: s.maxFileSizeMB !== null ? String(s.maxFileSizeMB) : '',
    adminCanUploadAfterLock: s.adminCanUploadAfterLock,
  }
}

export function AdminSettingsEditor() {
  const { data: settings, isLoading } = useMonthlyPlanSettings()
  const updateSettings = useUpdateSettings()

  const [form, setForm] = useState<FormState>(DEFAULT_FORM)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (settings) setForm(settingsToForm(settings))
  }, [settings])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    await updateSettings.mutateAsync({
      lockDay: form.lockDay,
      autoCreateDay: form.autoCreateDay,
      reminderStartDay: form.reminderStartDay,
      maxFileSizeMB: form.maxFileSizeMB.trim() === '' ? null : Number(form.maxFileSizeMB),
      adminCanUploadAfterLock: form.adminCanUploadAfterLock,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (isLoading) {
    return (
      <div className="card-glass rounded-2xl p-6 flex items-center justify-center gap-2 text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">กำลังโหลดการตั้งค่า...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card-glass rounded-2xl p-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 icon-glass-gray">
            <Settings className="h-4 w-4 text-gray-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">ตั้งค่าระบบแผนงาน</h3>
            <p className="text-xs text-gray-500">การเปลี่ยนแปลงมีผลทันที</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={updateSettings.isPending}
          className="flex items-center gap-2 btn-gradient-green text-white px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updateSettings.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>{saved ? 'บันทึกแล้ว' : 'บันทึก'}</span>
        </button>
      </div>

      {/* Settings fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* lockDay */}
        <div className="card-glass rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-50 border border-red-100 rounded-lg">
              <Lock className="h-3.5 w-3.5 text-red-500" />
            </div>
            <span className="text-sm font-bold text-gray-800">วันล็อคระบบ</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={28}
              value={form.lockDay}
              onChange={(e) => set('lockDay', Number(e.target.value))}
              className="input-glass w-20 h-11 rounded-xl text-center text-lg font-bold focus:outline-none"
            />
            <p className="text-sm text-gray-500">ของทุกเดือน — หลังจากนี้ทีมอัพโหลดไม่ได้</p>
          </div>
        </div>

        {/* autoCreateDay */}
        <div className="card-glass rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 icon-glass-green">
              <CalendarDays className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <span className="text-sm font-bold text-gray-800">วันสร้างพื้นที่เดือนถัดไป</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={28}
              value={form.autoCreateDay}
              onChange={(e) => set('autoCreateDay', Number(e.target.value))}
              className="input-glass w-20 h-11 rounded-xl text-center text-lg font-bold focus:outline-none"
            />
            <p className="text-sm text-gray-500">ของทุกเดือน — สร้างพื้นที่อัตโนมัติ</p>
          </div>
        </div>

        {/* reminderStartDay */}
        <div className="card-glass rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 icon-glass-yellow">
              <Bell className="h-3.5 w-3.5 text-amber-600" />
            </div>
            <span className="text-sm font-bold text-gray-800">วันเริ่มแจ้งเตือน</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={28}
              value={form.reminderStartDay}
              onChange={(e) => set('reminderStartDay', Number(e.target.value))}
              className="input-glass w-20 h-11 rounded-xl text-center text-lg font-bold focus:outline-none"
            />
            <p className="text-sm text-gray-500">ของทุกเดือน — เริ่มแสดง banner เตือน</p>
          </div>
        </div>

        {/* maxFileSizeMB */}
        <div className="card-glass rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 icon-glass-gray">
              <HardDrive className="h-3.5 w-3.5 text-gray-600" />
            </div>
            <span className="text-sm font-bold text-gray-800">ขนาดไฟล์สูงสุด</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              value={form.maxFileSizeMB}
              onChange={(e) => set('maxFileSizeMB', e.target.value)}
              placeholder="—"
              className="input-glass w-20 h-11 rounded-xl text-center text-lg font-bold focus:outline-none"
            />
            <p className="text-sm text-gray-500">MB — ปล่อยว่างไว้ถ้าไม่จำกัด</p>
          </div>
        </div>

      </div>

      {/* adminCanUploadAfterLock toggle */}
      <div className="card-glass rounded-2xl p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 icon-glass-green">
              <Lock className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Admin อัพโหลดได้หลังล็อค</p>
              <p className="text-xs text-gray-500 mt-0.5">เปิดให้ Admin อัพโหลดแผนรวมได้แม้เลย deadline แล้ว</p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.adminCanUploadAfterLock}
            onClick={() => set('adminCanUploadAfterLock', !form.adminCanUploadAfterLock)}
            className={`
              relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200
              ${form.adminCanUploadAfterLock ? 'bg-emerald-500' : 'bg-gray-300'}
            `}
          >
            <span
              className={`
                inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200
                ${form.adminCanUploadAfterLock ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
