'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AlertTriangle, CalendarDays, Loader2, Save, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { queryKeys, useMonthlyPlanSettings } from '@/hooks/useQueries'
import { monthlyPlanService } from '@/lib/services/monthly-plan.service'
import type { UpdateSettingsRequest } from '@/types/monthly-plan'

type SettingsForm = {
  lockDay: string
  adminCanUploadAfterLock: boolean
}

const initialForm: SettingsForm = {
  lockDay: '25',
  adminCanUploadAfterLock: false,
}

const toRequest = (form: SettingsForm): UpdateSettingsRequest => ({
  lockDay: Number(form.lockDay),
  adminCanUploadAfterLock: form.adminCanUploadAfterLock,
})

export default function AdminSettingsClient() {
  const queryClient = useQueryClient()
  const settingsQuery = useMonthlyPlanSettings()
  const [form, setForm] = useState<SettingsForm>(initialForm)
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    if (!settingsQuery.data) return
    setForm({
      lockDay: String(settingsQuery.data.lockDay),
      adminCanUploadAfterLock: settingsQuery.data.adminCanUploadAfterLock,
    })
  }, [settingsQuery.data])

  const preview = useMemo(() => {
    const lockDay = Number(form.lockDay)
    return [
      `ระบบจะล็อกการส่งแผนประจำเดือนในวันที่ ${Number.isFinite(lockDay) ? lockDay : '-'} ของเดือน`,
      form.adminCanUploadAfterLock ? 'ผู้ดูแลระบบสูงสุดยังอัปโหลดหลังวันล็อกได้' : 'หลังวันล็อกจะไม่อนุญาตให้อัปโหลดเพิ่มเติม',
      'ตรวจสอบช่วงเวลาที่กำหนดก่อนบันทึกการตั้งค่า',
    ]
  }, [form])

  const updateMutation = useMutation({
    mutationFn: (body: UpdateSettingsRequest) => monthlyPlanService.updateSettings(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.monthlyPlanSettings })
      toast.success('บันทึกการตั้งค่าสำเร็จ')
      setConfirmOpen(false)
    },
    onError: (error: Error) => toast.error(`เกิดข้อผิดพลาด: ${error.message}`),
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setConfirmOpen(true)
  }

  const lockDay = Number(form.lockDay)
  const lockDayInvalid = !Number.isInteger(lockDay) || lockDay < 1 || lockDay > 31
  const saveDisabled = lockDayInvalid || updateMutation.isPending

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 px-3 py-4 pb-28 sm:px-5 sm:py-6 md:pb-10 lg:px-8">
      <section className="smart-home-hero p-5 md:p-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-white/20" />
        <div className="relative z-10 flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/40 bg-white/20 text-white shadow-inner backdrop-blur-md">
            <Settings className="h-5 w-5" />
          </span>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white md:text-3xl">ตั้งค่าระบบ</h1>
            <p className="text-sm font-medium leading-6 text-white/90">
              ตั้งค่ารอบแผนประจำเดือนและตรวจทานผลกระทบก่อนบันทึก
            </p>
          </div>
        </div>
      </section>

      {settingsQuery.isLoading && (
        <section className="smart-home-card flex min-h-40 items-center justify-center text-sm font-medium text-slate-600">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          กำลังโหลดการตั้งค่า
        </section>
      )}

      {settingsQuery.error && (
        <section className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
          เกิดข้อผิดพลาด: {settingsQuery.error.message}
          <div className="mt-3">
            <Button variant="outline" className="smart-home-control min-h-11 rounded-2xl" onClick={() => settingsQuery.refetch()}>ลองใหม่</Button>
          </div>
        </section>
      )}

      {!settingsQuery.isLoading && !settingsQuery.error && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <form className="smart-home-card p-4 md:p-5" onSubmit={handleSubmit}>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-blue-700 shadow-inner">
                <CalendarDays className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-950">แผนประจำเดือน</h2>
                <p className="text-sm leading-6 text-slate-600">ตั้งค่าการล็อกและสิทธิ์อัปโหลดหลังวันล็อกสำหรับ Monthly Plan</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>วันล็อกการอัปโหลด *</span>
                <input
                  className="smart-home-control min-h-11 w-full px-3 text-slate-950 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  inputMode="numeric"
                  min={1}
                  max={31}
                  type="number"
                  value={form.lockDay}
                  onChange={(event) => setForm((current) => ({ ...current, lockDay: event.target.value }))}
                  required
                />
                {lockDayInvalid && <span className="block text-xs text-red-600">กรุณาระบุวันที่ 1-31</span>}
              </label>

              <label className="smart-home-panel flex min-h-11 items-start gap-3 p-3 text-sm text-slate-700">
                <input
                  className="mt-1 h-5 w-5 rounded border-sky-300 accent-blue-600"
                  type="checkbox"
                  checked={form.adminCanUploadAfterLock}
                  onChange={(event) => setForm((current) => ({ ...current, adminCanUploadAfterLock: event.target.checked }))}
                />
                <span>
                  อนุญาตให้ผู้ดูแลระบบสูงสุดอัปโหลดหลังวันล็อก
                  <span className="block text-xs leading-5 text-slate-500">เป็นการตั้งค่าที่มีผลต่อ policy การรับไฟล์ จึงต้องยืนยันก่อนบันทึก</span>
                </span>
              </label>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" className="smart-home-control min-h-11 rounded-2xl" onClick={() => settingsQuery.refetch()}>
                โหลดค่าล่าสุด
              </Button>
              <Button type="submit" className="min-h-11 rounded-2xl bg-blue-600 hover:bg-blue-700" disabled={saveDisabled}>
                <Save className="mr-2 h-4 w-4" />
                ตรวจทานก่อนบันทึก
              </Button>
            </div>
          </form>

          <aside className="rounded-2xl border border-amber-200/80 bg-amber-50/90 p-4 text-sm leading-6 text-amber-950 shadow-[0_12px_30px_rgba(217,119,6,0.10)] backdrop-blur-xl">
            <div className="flex items-start gap-2 font-bold">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              ตัวอย่างผลกระทบ
            </div>
            <ul className="mt-3 space-y-2">
              {preview.map((item) => <li key={item} className="rounded-2xl bg-white/70 p-3">{item}</li>)}
            </ul>
          </aside>
        </div>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="smart-home-card max-h-[92dvh] w-[calc(100vw-1rem)] overflow-y-auto rounded-3xl sm:w-full sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>ยืนยันบันทึกการตั้งค่า</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm leading-6 text-slate-700">
            <p>โปรดตรวจทานผลกระทบก่อนบันทึก เพราะการตั้งค่านี้มีผลต่อการอัปโหลดแผนประจำเดือนของผู้ใช้</p>
            <ul className="space-y-2">
              {preview.map((item) => <li key={item} className="smart-home-panel p-3" >{item}</li>)}
            </ul>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" className="smart-home-control min-h-11 rounded-2xl" onClick={() => setConfirmOpen(false)}>ยกเลิก</Button>
            <Button className="min-h-11 rounded-2xl bg-blue-600 hover:bg-blue-700" disabled={updateMutation.isPending} onClick={() => updateMutation.mutate(toRequest(form))}>
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              ยืนยันบันทึก
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
