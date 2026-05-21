'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CalendarDays, ClipboardList, Loader2, MapPin, Plus, RefreshCw, Users } from 'lucide-react'
import { useAuthContext } from '@/lib/auth/auth-context'
import { canCreateLargeWork, isSuperAdmin } from '@/lib/auth/role-policy'
import { useLargeWork, useLargeWorks, useTeams } from '@/hooks/useQueries'
import { useCreateLargeWork, useUpdateLargeWork } from '@/hooks/mutations/useLargeWorkMutations'
import { LargeWorkOperationsDialog } from '@/features/large-work/components/LargeWorkOperationsDialog'
import { LargeWorkPlanningBoard } from '@/features/large-work/components/LargeWorkPlanningBoard'
import { WorkerTodoQueue } from '@/features/large-work/components/WorkerTodoQueue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { LargeWorkRequest, LargeWorkResponse, UpdateLargeWorkRequest } from '@/types/large-work'
import type { Team } from '@/types/query-types'

type LargeWorkTab = 'plans' | 'my-todos'
type LargeWorkFormState = Omit<LargeWorkRequest, 'ownerTeamId' | 'participantTeamIds'> & {
  ownerTeamId: string
  participantTeamIds: string[]
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'ร่าง',
  planned: 'วางแผนแล้ว',
  in_progress: 'กำลังดำเนินการ',
  completed: 'เสร็จสิ้น',
  cancelled: 'ยกเลิก',
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function todayKey(): string {
  const now = new Date()
  return toDateKey(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

function defaultLargeWorkForm(teamId?: number | null): LargeWorkFormState {
  return {
    ownerTeamId: teamId ? String(teamId) : '',
    participantTeamIds: [],
    title: '',
    workType: '',
    startDate: todayKey(),
    endDate: '',
    workTime: '',
    locationText: '',
    notes: '',
  }
}

function nullableText(value: string | null | undefined): string | null {
  const trimmed = (value ?? '').trim()
  return trimmed.length > 0 ? trimmed : null
}

function formatRange(startDate: string, endDate?: string | null): string {
  if (!endDate || endDate === startDate) return startDate
  return `${startDate} ถึง ${endDate}`
}

function ownerTeam(item: LargeWorkResponse): LargeWorkResponse['teams'][number] | undefined {
  return item.teams.find((team) => team.role === 'owner')
}

function LargeWorkDialog({
  open,
  item,
  teams,
  currentTeamId,
  onClose,
  onSaved,
}: {
  open: boolean
  item: LargeWorkResponse | null
  teams?: Team[]
  currentTeamId?: number | null
  onClose: () => void
  onSaved?: (item: LargeWorkResponse) => void
}) {
  const { user } = useAuthContext()
  const [form, setForm] = useState<LargeWorkFormState>(() => defaultLargeWorkForm(currentTeamId))
  const createItem = useCreateLargeWork()
  const updateItem = useUpdateLargeWork()
  const canSelectAnyOwnerTeam = isSuperAdmin(user?.role)
  const visibleOwnerTeams = useMemo(
    () => (canSelectAnyOwnerTeam ? teams : teams?.filter((team) => team.id === currentTeamId)),
    [canSelectAnyOwnerTeam, currentTeamId, teams],
  )

  useEffect(() => {
    if (item) {
      const owner = ownerTeam(item)
      setForm({
        ownerTeamId: String(item.ownerTeamId ?? owner?.id ?? currentTeamId ?? ''),
        participantTeamIds: item.teams.filter((team) => team.role === 'participant').map((team) => String(team.id)),
        title: item.title,
        workType: item.workType ?? '',
        startDate: item.startDate,
        endDate: item.endDate ?? '',
        workTime: item.workTime ?? '',
        locationText: item.locationText,
        notes: item.notes ?? '',
      })
      return
    }
    setForm(defaultLargeWorkForm(currentTeamId))
  }, [currentTeamId, item, open])

  const isSaving = createItem.isPending || updateItem.isPending
  const isValid = form.ownerTeamId && form.title.trim() && form.startDate && form.locationText.trim()

  const handleToggleParticipant = (id: number) => {
    const value = String(id)
    setForm((prev) => ({
      ...prev,
      participantTeamIds: prev.participantTeamIds.includes(value)
        ? prev.participantTeamIds.filter((teamId) => teamId !== value)
        : [...prev.participantTeamIds, value],
    }))
  }

  const handleSubmit = () => {
    if (!isValid) return
    const ownerTeamId = Number(form.ownerTeamId)
    const participantTeamIds = form.participantTeamIds
      .map(Number)
      .filter((id) => id > 0 && id !== ownerTeamId)

    const payload: LargeWorkRequest = {
      ownerTeamId,
      participantTeamIds,
      title: form.title.trim(),
      workType: nullableText(form.workType),
      startDate: form.startDate,
      endDate: nullableText(form.endDate),
      workTime: nullableText(form.workTime),
      locationText: form.locationText.trim(),
      notes: nullableText(form.notes),
    }

    if (item) {
      updateItem.mutate(
        { id: item.id, data: payload satisfies UpdateLargeWorkRequest },
        { onSuccess: (savedItem) => { onSaved?.(savedItem); onClose() } },
      )
      return
    }

    createItem.mutate(payload, { onSuccess: (savedItem) => { onSaved?.(savedItem); onClose() } })
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item ? 'แก้ไขงานระดมทีม' : 'สร้างงานระดมทีม'}</DialogTitle>
          <DialogDescription>
            สร้างงานหลักก่อน แล้วแตกงานย่อยในบอร์ดเพื่อมอบหมายให้แต่ละทีม
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <Field label="ทีมเจ้าของ" required>
            <select
              aria-label="ทีมเจ้าของ"
              name="ownerTeamId"
              value={form.ownerTeamId}
              onChange={(event) => setForm((prev) => ({ ...prev, ownerTeamId: event.target.value }))}
              disabled={!canSelectAnyOwnerTeam}
              className="min-h-11 w-full rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-amber-500"
            >
              <option value="">เลือกทีมเจ้าของ</option>
              {visibleOwnerTeams?.map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
            {!canSelectAnyOwnerTeam && <p className="text-xs text-gray-500">ทีมเจ้าของถูกล็อกตามทีมของผู้ใช้งาน</p>}
          </Field>
          <Field label="ประเภทงาน">
            <Input value={form.workType ?? ''} onChange={(event) => setForm((prev) => ({ ...prev, workType: event.target.value }))} placeholder="เช่น งานเร่งด่วน / งานระดม" />
          </Field>
          <Field label="หัวข้องาน" required className="sm:col-span-2">
            <Input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="ระบุชื่องานระดมทีม" />
          </Field>
          <Field label="วันที่เริ่ม" required>
            <Input type="date" value={form.startDate} onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))} />
          </Field>
          <Field label="วันที่สิ้นสุด">
            <Input type="date" value={form.endDate ?? ''} onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))} />
          </Field>
          <Field label="เวลา">
            <Input value={form.workTime ?? ''} onChange={(event) => setForm((prev) => ({ ...prev, workTime: event.target.value }))} placeholder="08:30-16:30" />
          </Field>
          <Field label="พื้นที่/จุดปฏิบัติงาน" required>
            <Input value={form.locationText} onChange={(event) => setForm((prev) => ({ ...prev, locationText: event.target.value }))} placeholder="สถานี/ฟีดเดอร์/พื้นที่" />
          </Field>
          <Field label="ทีมร่วม" className="sm:col-span-2">
            <div className="grid gap-2 sm:grid-cols-2">
              {teams?.map((team) => {
                const value = String(team.id)
                const checked = form.participantTeamIds.includes(value)
                const isOwner = form.ownerTeamId === value
                return (
                  <label
                    key={team.id}
                    className={cn(
                      'flex items-center gap-2 rounded-xl border px-3 py-2 text-sm',
                      checked ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-gray-200 bg-white text-gray-700',
                      isOwner && 'opacity-60',
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked && !isOwner}
                      disabled={isOwner}
                      onChange={() => handleToggleParticipant(team.id)}
                      className="h-4 w-4 rounded border-gray-300 text-amber-600"
                    />
                    {team.name}
                    {isOwner && <span className="ml-auto text-[10px] text-amber-600">เจ้าของ</span>}
                  </label>
                )
              })}
            </div>
          </Field>
          <Field label="หมายเหตุ" className="sm:col-span-2">
            <Textarea value={form.notes ?? ''} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} placeholder="รายละเอียดเพิ่มเติม" />
          </Field>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>ยกเลิก</Button>
          <Button onClick={handleSubmit} disabled={!isValid || isSaving} className="bg-amber-600 text-white hover:bg-amber-700">
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {item ? 'บันทึก' : 'สร้างและแตกงาน'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string
  required?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500"> *</span>}
      </label>
      {children}
    </div>
  )
}

function LargeWorkCard({
  item,
  onEdit,
  onOpenBoard,
  onOpenOperations,
}: {
  item: LargeWorkResponse
  onEdit: (item: LargeWorkResponse) => void
  onOpenBoard: (item: LargeWorkResponse) => void
  onOpenOperations: (item: LargeWorkResponse) => void
}) {
  const owner = ownerTeam(item)
  const participantNames = item.teams.filter((team) => team.role === 'participant').map((team) => team.name)
  const assignBlockedReason = item.status === 'completed'
    ? 'งานเสร็จสิ้นแล้ว ไม่สามารถแจกจ่ายงานเพิ่มได้'
    : item.status === 'cancelled'
      ? 'งานถูกยกเลิกแล้ว ไม่สามารถแจกจ่ายงานได้'
      : null
  const canAssign = item.actions.canEdit && !assignBlockedReason

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">งานระดมทีม</span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">{STATUS_LABELS[item.status] ?? item.status}</span>
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-950">{item.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{item.notes || 'ยังไม่มีหมายเหตุเพิ่มเติม'}</p>
          </div>
          <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
            <Meta icon={<CalendarDays className="h-4 w-4" />} text={formatRange(item.startDate, item.endDate)} />
            <Meta icon={<MapPin className="h-4 w-4" />} text={item.locationText} />
            <Meta icon={<Users className="h-4 w-4" />} text={`เจ้าของ: ${owner?.name ?? 'ไม่ระบุ'}`} />
            <Meta icon={<ClipboardList className="h-4 w-4" />} text={participantNames.length > 0 ? `ทีมร่วม: ${participantNames.join(', ')}` : 'ยังไม่มีทีมร่วม'} />
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
          <Button variant="outline" className="min-h-11 w-full rounded-xl sm:w-auto" onClick={() => onOpenOperations(item)}>
            ดูการปฏิบัติงานของทีมทั้งหมด
          </Button>
          {canAssign ? (
            <Button className="min-h-11 w-full rounded-xl bg-amber-600 text-white hover:bg-amber-700 sm:w-auto" onClick={() => onOpenBoard(item)}>
              แจกจ่าย/แก้ไขจุดงาน
            </Button>
          ) : item.actions.canEdit ? (
            <Button disabled className="min-h-11 w-full rounded-xl bg-slate-200 text-slate-500 sm:w-auto" title={assignBlockedReason ?? undefined}>
              แจกจ่าย/แก้ไขจุดงาน
            </Button>
          ) : null}
          {item.actions.canEdit && (
            <Button variant="outline" className="min-h-11 w-full rounded-xl sm:w-auto" onClick={() => onEdit(item)}>
              แก้ไขงานหลัก
            </Button>
          )}
        </div>
      </div>
      {assignBlockedReason && <p className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">{assignBlockedReason}</p>}
    </article>
  )
}

function Meta({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-slate-400">{icon}</span>
      <span className="truncate">{text}</span>
    </div>
  )
}

function StateMessage({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
      <p className="text-base font-bold text-slate-950">{title}</p>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </div>
  )
}

export default function LargeWorkPage() {
  const { user } = useAuthContext()
  const searchParams = useSearchParams()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [activeTab, setActiveTab] = useState<LargeWorkTab>('plans')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<LargeWorkResponse | null>(null)
  const [operationsItem, setOperationsItem] = useState<LargeWorkResponse | null>(null)
  const [planningBoardItem, setPlanningBoardItem] = useState<LargeWorkResponse | null>(null)
  const [openedRouteKey, setOpenedRouteKey] = useState<string | null>(null)

  const params = useMemo(
    () => ({
      from: toDateKey(year, month, 1),
      to: toDateKey(year, month, getDaysInMonth(year, month)),
    }),
    [month, year],
  )
  const requestedLargeWorkId = Number(searchParams.get('largeWorkId') ?? 0)
  const viewMode = searchParams.get('view') ?? 'operations'
  const { data: teams } = useTeams()
  const largeWorksQuery = useLargeWorks(params)
  const routedLargeWorkQuery = useLargeWork(requestedLargeWorkId > 0 ? requestedLargeWorkId : undefined)

  const items = useMemo(() => largeWorksQuery.data ?? [], [largeWorksQuery.data])
  const canCreate = canCreateLargeWork(user?.role, user?.teamId != null)
  const canShowReliableLargeWorkStats = !largeWorksQuery.isLoading && !largeWorksQuery.isError && largeWorksQuery.data != null
  const completedCount = items.filter((item) => item.status === 'completed').length
  const activeCount = items.filter((item) => item.status === 'planned' || item.status === 'in_progress').length

  useEffect(() => {
    if (requestedLargeWorkId <= 0) return
    const routeKey = `${requestedLargeWorkId}:${viewMode}`
    if (openedRouteKey === routeKey) return
    const routedItem = items.find((item) => item.id === requestedLargeWorkId) ?? routedLargeWorkQuery.data
    if (!routedItem) return

    if (viewMode === 'board') {
      setPlanningBoardItem(routedItem)
    } else {
      setOperationsItem(routedItem)
    }
    setOpenedRouteKey(routeKey)
    setActiveTab('plans')
  }, [items, openedRouteKey, requestedLargeWorkId, routedLargeWorkQuery.data, viewMode])

  const openCreate = () => {
    setEditingItem(null)
    setDialogOpen(true)
  }

  const openBoard = useCallback((item: LargeWorkResponse) => {
    setPlanningBoardItem(item)
  }, [])

  const openOperations = useCallback((item: LargeWorkResponse) => {
    setOperationsItem(item)
  }, [])

  const shiftMonth = (delta: number) => {
    const next = new Date(year, month - 1 + delta, 1)
    setYear(next.getFullYear())
    setMonth(next.getMonth() + 1)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 overflow-x-hidden px-3 py-4 sm:px-4 lg:px-6">
      <section className="overflow-hidden rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-emerald-50 p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/70 px-3 py-1 text-xs font-black text-amber-700">
              <Users className="h-3.5 w-3.5" />
              งานระดมทีม
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">ศูนย์กลางงานระดมทีม</h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              สร้างงานหลัก แตกจุดงานเข้าบอร์ด มอบหมายทีม และให้ทีมปิดงานจากคิวของตัวเอง เมื่อปิดงานสำเร็จระบบจะสร้าง Daily Report ให้อัตโนมัติ
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
            {canCreate ? (
              <Button onClick={openCreate} className="min-h-11 rounded-2xl bg-amber-600 text-white hover:bg-amber-700">
                <Plus className="h-4 w-4" /> สร้างงานระดมทีม
              </Button>
            ) : user?.role === 'viewer' || user?.role === 'user' ? null : (
              <Button disabled className="min-h-11 rounded-2xl bg-slate-200 text-slate-500">
                <Plus className="h-4 w-4" /> ไม่มีสิทธิ์สร้าง
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => largeWorksQuery.refetch()}
              className="min-h-11 rounded-2xl border-slate-200 bg-white/80 text-slate-700"
            >
              <RefreshCw className="h-4 w-4" /> รีเฟรช
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="งานในเดือนนี้" value={canShowReliableLargeWorkStats ? items.length : '—'} />
        <StatCard label="กำลังวาง/ดำเนินการ" value={canShowReliableLargeWorkStats ? activeCount : '—'} tone="amber" />
        <StatCard label="เสร็จสิ้น" value={canShowReliableLargeWorkStats ? completedCount : '—'} tone="emerald" />
        <StatCard label="ขอบเขตของฉัน" value={isSuperAdmin(user?.role) ? 'ทุกทีม' : user?.teamId ? 'ทีมของฉัน' : 'ยังไม่ผูกทีม'} />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="grid gap-2 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Button variant="outline" className="min-h-11 rounded-2xl" onClick={() => shiftMonth(-1)}>เดือนก่อน</Button>
            <div className="flex min-h-11 min-w-0 items-center justify-center rounded-2xl bg-amber-50 px-3 text-center text-sm font-black text-amber-900">
              {new Date(year, month - 1, 1).toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
            </div>
            <Button variant="outline" className="min-h-11 rounded-2xl" onClick={() => shiftMonth(1)}>เดือนถัดไป</Button>
          </div>
          <div className="grid grid-cols-2 gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1">
            {([
              ['plans', 'แผนงานระดมทีม'],
              ['my-todos', 'คิวงานทีมฉัน'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setActiveTab(value)}
                className={cn(
                  'min-h-11 rounded-xl px-3 text-sm font-bold transition',
                  activeTab === value ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-white',
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <Button variant="outline" className="min-h-11 rounded-2xl" onClick={() => { const current = new Date(); setYear(current.getFullYear()); setMonth(current.getMonth() + 1) }}>
            เดือนนี้
          </Button>
        </div>
      </section>

      {activeTab === 'plans' ? (
        <section className="space-y-3">
          {largeWorksQuery.isLoading ? (
            <div className="grid gap-3">
              {[0, 1, 2].map((item) => <div key={item} className="h-40 animate-pulse rounded-3xl bg-slate-100" />)}
            </div>
          ) : largeWorksQuery.isError ? (
            <StateMessage title="โหลดงานระดมทีมไม่สำเร็จ" description="ตรวจสอบ Backend หรือกดรีเฟรชอีกครั้ง" />
          ) : items.length === 0 ? (
            <StateMessage title="เดือนนี้ยังไม่มีงานระดมทีม" description={canCreate ? 'เริ่มจากสร้างงานระดมทีม แล้วแตกจุดงานให้แต่ละทีมในบอร์ด' : 'เมื่อทีมของคุณได้รับมอบหมายงาน งานจะแสดงในคิวงานทีมฉัน'} />
          ) : (
            items.map((item) => (
              <LargeWorkCard
                key={item.id}
                item={item}
                onEdit={(next) => { setEditingItem(next); setDialogOpen(true) }}
                onOpenBoard={openBoard}
                onOpenOperations={openOperations}
              />
            ))
          )}
        </section>
      ) : (
        <section className="rounded-3xl border border-emerald-100 bg-emerald-50/40 p-3 shadow-sm sm:p-4">
          <div className="mb-4">
            <h2 className="text-lg font-black text-slate-950">คิวงานทีมฉัน</h2>
            <p className="text-sm text-slate-600">เริ่มงาน ปิดงาน และแนบรูปถ้ามี จากคิวที่ถูกมอบหมายให้ทีมของคุณ</p>
          </div>
          <WorkerTodoQueue />
        </section>
      )}

      <LargeWorkDialog
        open={dialogOpen}
        item={editingItem}
        teams={teams}
        currentTeamId={user?.teamId}
        onClose={() => { setEditingItem(null); setDialogOpen(false) }}
        onSaved={(savedItem) => setPlanningBoardItem(savedItem)}
      />
      {operationsItem && (
        <LargeWorkOperationsDialog
          item={operationsItem}
          open={operationsItem != null}
          onClose={() => setOperationsItem(null)}
        />
      )}
      {planningBoardItem && (
        <LargeWorkPlanningBoard
          item={planningBoardItem}
          open={planningBoardItem != null}
          onClose={() => setPlanningBoardItem(null)}
        />
      )}
    </div>
  )
}

function StatCard({ label, value, tone = 'slate' }: { label: string; value: number | string; tone?: 'slate' | 'amber' | 'emerald' }) {
  const toneClass = {
    slate: 'border-slate-200 bg-white text-slate-950',
    amber: 'border-amber-100 bg-amber-50 text-amber-900',
    emerald: 'border-emerald-100 bg-emerald-50 text-emerald-900',
  }[tone]

  return (
    <div className={cn('rounded-3xl border p-4 shadow-sm', toneClass)}>
      <p className="text-xs font-semibold text-current/60">{label}</p>
      <p className="mt-2 text-2xl font-black">{typeof value === 'number' ? value.toLocaleString('th-TH') : value}</p>
    </div>
  )
}
