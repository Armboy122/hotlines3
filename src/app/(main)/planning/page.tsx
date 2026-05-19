'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  CalendarDays,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Users,
} from 'lucide-react'
import { useAuthContext } from '@/lib/auth/auth-context'
import {
  useLargeWorks,
  usePlanningCalendar,
  useTeamPlans,
  useTeams,
} from '@/hooks/useQueries'
import {
  useCreateTeamPlan,
  useUpdateTeamPlan,
} from '@/hooks/mutations/useTeamPlanMutations'
import {
  useCreateLargeWork,
  useUpdateLargeWork,
} from '@/hooks/mutations/useLargeWorkMutations'
import {
  canCreateTeamPlan,
  canViewPlanningCalendar,
  isSuperAdmin,
} from '@/lib/auth/role-policy'
import { groupItemsByDateKey } from '@/types/planning-calendar'
import type { Team } from '@/types/query-types'
import type {
  TeamPlanRequest,
  TeamPlanResponse,
  UpdateTeamPlanRequest,
} from '@/types/team-plan'
import type {
  LargeWorkRequest,
  LargeWorkResponse,
  UpdateLargeWorkRequest,
} from '@/types/large-work'
import { LargeWorkOperationsDialog } from '@/features/large-work/components/LargeWorkOperationsDialog'
import { LargeWorkPlanningBoard } from '@/features/large-work/components/LargeWorkPlanningBoard'
import { CalendarMonthSelector } from '@/features/planning-calendar/components/CalendarMonthSelector'
import { CalendarGrid } from '@/features/planning-calendar/components/CalendarGrid'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

type PlanningTab = 'calendar' | 'board'
type TeamPlanFormState = Omit<TeamPlanRequest, 'teamId'> & { teamId: string }
type LargeWorkFormState = Omit<LargeWorkRequest, 'ownerTeamId' | 'participantTeamIds'> & {
  ownerTeamId: string
  participantTeamIds: string[]
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

function defaultTeamPlanForm(teamId?: number | null): TeamPlanFormState {
  const today = todayKey()
  return {
    teamId: teamId ? String(teamId) : '',
    title: '',
    workType: '',
    startDate: today,
    endDate: '',
    workTime: '',
    locationText: '',
    notes: '',
  }
}

function defaultLargeWorkForm(teamId?: number | null): LargeWorkFormState {
  const today = todayKey()
  return {
    ownerTeamId: teamId ? String(teamId) : '',
    participantTeamIds: [],
    title: '',
    workType: '',
    startDate: today,
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

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'in_progress':
      return 'border-sky-200 bg-sky-50 text-sky-700'
    case 'completed':
      return 'border-slate-200 bg-slate-50 text-slate-700'
    case 'cancelled':
      return 'border-red-200 bg-red-50 text-red-600'
    default:
      return 'border-amber-200 bg-amber-50 text-amber-700'
  }
}

function normalizePlanningStatus(status: string): 'not_started' | 'in_progress' | 'completed' | 'cancelled' {
  if (status === 'in_progress') return 'in_progress'
  if (status === 'completed') return 'completed'
  if (status === 'cancelled') return 'cancelled'
  return 'not_started'
}

function planningStatusLabel(status: string): string {
  const normalized = normalizePlanningStatus(status)
  if (normalized === 'in_progress') return 'กำลังทำ'
  if (normalized === 'completed') return 'เสร็จแล้ว'
  if (normalized === 'cancelled') return 'ยกเลิก'
  return status === 'planned' ? 'กำหนดวันแล้ว' : 'ยังไม่เริ่ม'
}

function formatRange(startDate: string, endDate?: string | null): string {
  if (!endDate || endDate === startDate) return startDate
  return `${startDate} ถึง ${endDate}`
}

function TeamPlanDialog({
  open,
  plan,
  teams,
  currentTeamId,
  onClose,
}: {
  open: boolean
  plan: TeamPlanResponse | null
  teams?: Team[]
  currentTeamId?: number | null
  onClose: () => void
}) {
  const [form, setForm] = useState<TeamPlanFormState>(() => defaultTeamPlanForm(currentTeamId))
  const createPlan = useCreateTeamPlan()
  const updatePlan = useUpdateTeamPlan()
  const canSelectAnyTeam = isSuperAdmin(useAuthContext().user?.role)
  const visibleTeams = useMemo(
    () => (canSelectAnyTeam ? teams : teams?.filter((team) => team.id === currentTeamId)),
    [canSelectAnyTeam, teams, currentTeamId],
  )

  useEffect(() => {
    if (plan) {
      setForm({
        teamId: String(plan.teamId),
        title: plan.title,
        workType: plan.workType ?? '',
        startDate: plan.startDate,
        endDate: plan.endDate ?? '',
        workTime: plan.workTime ?? '',
        locationText: plan.locationText,
        notes: plan.notes ?? '',
      })
    } else {
      setForm(defaultTeamPlanForm(currentTeamId))
    }
  }, [plan, currentTeamId, open])

  const isSaving = createPlan.isPending || updatePlan.isPending
  const isValid = form.teamId && form.title.trim() && form.startDate && form.locationText.trim()

  const handleSubmit = () => {
    if (!isValid) return
    const payload: TeamPlanRequest = {
      teamId: Number(form.teamId),
      title: form.title.trim(),
      workType: nullableText(form.workType),
      startDate: form.startDate,
      endDate: nullableText(form.endDate),
      workTime: nullableText(form.workTime),
      locationText: form.locationText.trim(),
      notes: nullableText(form.notes),
    }

    if (plan) {
      updatePlan.mutate(
        { id: plan.id, data: payload satisfies UpdateTeamPlanRequest },
        { onSuccess: onClose },
      )
    } else {
      createPlan.mutate(payload, { onSuccess: onClose })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{plan ? 'แก้ไขแผนทีม' : 'เพิ่มแผนทีม'}</DialogTitle>
          <DialogDescription>
            แผนทีมคือแผนงานของพื้นที่ตัวเอง ไม่ต้องผ่าน approval
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <Field label="ทีม" required>
            <select
              value={form.teamId}
              onChange={(event) => setForm((prev) => ({ ...prev, teamId: event.target.value }))}
              disabled={!canSelectAnyTeam}
              className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-emerald-500"
            >
              <option value="">เลือกทีม</option>
              {visibleTeams?.map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
            {!canSelectAnyTeam && (
              <p className="text-xs text-gray-500">ผู้ใช้ทั่วไปสร้างได้เฉพาะแผนของทีมตัวเอง</p>
            )}
          </Field>
          <Field label="ประเภทงาน">
            <Input value={form.workType ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, workType: e.target.value }))} placeholder="เช่น PM, ตรวจแก้" />
          </Field>
          <Field label="หัวข้องาน" required className="sm:col-span-2">
            <Input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="ระบุงานที่ต้องทำ" />
          </Field>
          <Field label="วันที่เริ่ม" required>
            <Input type="date" value={form.startDate} onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))} />
          </Field>
          <Field label="วันที่สิ้นสุด">
            <Input type="date" value={form.endDate ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))} />
          </Field>
          <Field label="เวลา">
            <Input value={form.workTime ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, workTime: e.target.value }))} placeholder="08:30-16:30" />
          </Field>
          <Field label="พื้นที่/จุดปฏิบัติงาน" required>
            <Input value={form.locationText} onChange={(e) => setForm((prev) => ({ ...prev, locationText: e.target.value }))} placeholder="สถานี/ฟีดเดอร์/พื้นที่" />
          </Field>
          <Field label="หมายเหตุ" className="sm:col-span-2">
            <Textarea value={form.notes ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} placeholder="รายละเอียดเพิ่มเติม" />
          </Field>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>ยกเลิก</Button>
          <Button onClick={handleSubmit} disabled={!isValid || isSaving} className="bg-emerald-600 text-white hover:bg-emerald-700">
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            บันทึก
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
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
  const [form, setForm] = useState<LargeWorkFormState>(() => defaultLargeWorkForm(currentTeamId))
  const createItem = useCreateLargeWork()
  const updateItem = useUpdateLargeWork()
  const canSelectAnyOwnerTeam = isSuperAdmin(useAuthContext().user?.role)
  const visibleOwnerTeams = useMemo(
    () => (canSelectAnyOwnerTeam ? teams : teams?.filter((team) => team.id === currentTeamId)),
    [canSelectAnyOwnerTeam, teams, currentTeamId],
  )

  useEffect(() => {
    if (item) {
      const owner = item.teams.find((team) => team.role === 'owner')
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
    } else {
      setForm(defaultLargeWorkForm(currentTeamId))
    }
  }, [item, currentTeamId, open])

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
    } else {
      createItem.mutate(payload, { onSuccess: (savedItem) => { onSaved?.(savedItem); onClose() } })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item ? 'แก้ไขงานระดมทีม' : 'เพิ่มงานระดมทีม'}</DialogTitle>
          <DialogDescription>
            ใช้สำหรับงานระดมทีมที่มีทีมเจ้าของและทีมร่วมปฏิบัติงานหลายทีม
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <Field label="ทีมเจ้าของ" required>
            <select
              value={form.ownerTeamId}
              onChange={(event) => setForm((prev) => ({ ...prev, ownerTeamId: event.target.value }))}
              disabled={!canSelectAnyOwnerTeam}
              className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-emerald-500"
            >
              <option value="">เลือกทีมเจ้าของ</option>
              {visibleOwnerTeams?.map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
            {!canSelectAnyOwnerTeam && (
              <p className="text-xs text-gray-500">ทีมเจ้าของถูกล็อคตามทีมของผู้ใช้งาน</p>
            )}
          </Field>
          <Field label="ประเภทงาน">
            <Input value={form.workType ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, workType: e.target.value }))} placeholder="เช่น งานระดม/งานเร่งด่วน" />
          </Field>
          <Field label="หัวข้องาน" required className="sm:col-span-2">
            <Input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="ระบุชื่องานระดมทีม" />
          </Field>
          <Field label="วันที่เริ่ม" required>
            <Input type="date" value={form.startDate} onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))} />
          </Field>
          <Field label="วันที่สิ้นสุด">
            <Input type="date" value={form.endDate ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))} />
          </Field>
          <Field label="เวลา">
            <Input value={form.workTime ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, workTime: e.target.value }))} placeholder="08:30-16:30" />
          </Field>
          <Field label="พื้นที่/จุดปฏิบัติงาน" required>
            <Input value={form.locationText} onChange={(e) => setForm((prev) => ({ ...prev, locationText: e.target.value }))} placeholder="สถานี/ฟีดเดอร์/พื้นที่" />
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
                      checked ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-gray-200 bg-white text-gray-700',
                      isOwner && 'opacity-60',
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked && !isOwner}
                      disabled={isOwner}
                      onChange={() => handleToggleParticipant(team.id)}
                      className="h-4 w-4 rounded border-gray-300 text-emerald-600"
                    />
                    {team.name}
                    {isOwner && <span className="ml-auto text-[10px] text-emerald-600">เจ้าของ</span>}
                  </label>
                )
              })}
            </div>
          </Field>
          <Field label="หมายเหตุ" className="sm:col-span-2">
            <Textarea value={form.notes ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} placeholder="รายละเอียดเพิ่มเติม" />
          </Field>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>ยกเลิก</Button>
          <Button onClick={handleSubmit} disabled={!isValid || isSaving} className="bg-amber-600 text-white hover:bg-amber-700">
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            บันทึก
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

function Meta({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-gray-400">{icon}</span>
      <span className="truncate">{text}</span>
    </div>
  )
}


function PlanningStateMessage({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center shadow-sm">
      <p className="text-sm font-bold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

function PlanningItemCard({ item }: { item: import('@/types/planning-calendar').PlanningCalendarItem }) {
  const teamNames = item.teams.map((team) => team.name).join(', ') || 'ไม่ระบุทีม'
  const sourceLabel = item.type === 'monthly_plan' ? 'งานจาก monthly plan' : 'งานแผนของทีม'
  const sourceClass = item.type === 'monthly_plan'
    ? 'border-teal-200 bg-teal-50 text-teal-700'
    : 'border-sky-200 bg-sky-50 text-sky-700'

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap gap-2">
            <span className={cn('rounded-full border px-2.5 py-1 text-xs font-bold', sourceClass)}>{sourceLabel}</span>
            <span className={cn('rounded-full border px-2.5 py-1 text-xs font-bold', statusBadgeClass(normalizePlanningStatus(item.status)))}>{planningStatusLabel(item.status)}</span>
          </div>
          <h3 className="text-base font-bold text-slate-950">{item.title}</h3>
          <div className="grid gap-1.5 text-sm text-slate-600 sm:grid-cols-2">
            <Meta icon={<MapPin className="h-4 w-4" />} text={item.locationText ?? 'ไม่ระบุสถานที่'} />
            <Meta icon={<CalendarDays className="h-4 w-4" />} text={formatRange(item.startDate, item.endDate)} />
            {item.workTime && <Meta icon={<CalendarDays className="h-4 w-4" />} text={item.workTime} />}
            <Meta icon={<Users className="h-4 w-4" />} text={teamNames} />
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          <a href={item.source.route} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            ดูรายละเอียด
          </a>
          {item.actions.canEdit && (
            <a href={item.source.route} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 px-3 text-sm font-semibold text-sky-700 hover:bg-sky-100">
              แก้ไข
            </a>
          )}
          {item.actions.canStartDailyReport && item.source.dailyReportPrefillRoute && (
            <a href={item.source.dailyReportPrefillRoute} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-900 bg-slate-900 px-3 text-sm font-semibold text-white hover:bg-slate-800">
              สร้างบันทึกงาน
            </a>
          )}
          {normalizePlanningStatus(item.status) === 'not_started' && item.actions.canEdit && (
            <a href={item.source.route} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-teal-200 bg-teal-50 px-3 text-sm font-semibold text-teal-700 hover:bg-teal-100">
              ย้ายลง Calendar
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

function PlanningAgenda({
  selectedDate,
  items,
  canAddPlanningWork,
  onAdd,
}: {
  selectedDate: string | null
  items: import('@/types/planning-calendar').PlanningCalendarItem[]
  canAddPlanningWork: boolean
  onAdd: () => void
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-950">Agenda / List</h2>
          <p className="text-sm text-slate-600">{selectedDate ? `งานวันที่ ${selectedDate}` : 'เลือกวันที่บนปฏิทินเพื่อดูรายการงาน'}</p>
        </div>
      </div>
      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => <PlanningItemCard key={item.id} item={item} />)}
        </div>
      ) : (
        <PlanningStateMessage
          title="ยังไม่มีงานในเดือนนี้"
          description={canAddPlanningWork ? 'เลือกเพิ่มงานแรกเพื่อสร้างแผนงานของทีม' : 'ยังไม่มีงานที่ได้รับมอบหมาย'}
          action={canAddPlanningWork ? <Button onClick={onAdd} className="bg-slate-900 text-white hover:bg-slate-800">เพิ่มงานแรก</Button> : undefined}
        />
      )}
    </section>
  )
}

function PlanningBoardView({ items }: { items: import('@/types/planning-calendar').PlanningCalendarItem[] }) {
  const lanes = [
    { id: 'not_started', title: 'รอวางแผน' },
    { id: 'planned', title: 'กำหนดวันแล้ว' },
    { id: 'in_progress', title: 'กำลังทำ' },
    { id: 'completed', title: 'เสร็จแล้ว' },
  ] as const
  const cardsForLane = (laneId: (typeof lanes)[number]['id']) => items.filter((item) => {
    if (laneId === 'planned') return item.status === 'planned' || item.status === 'draft'
    return normalizePlanningStatus(item.status) === laneId
  })

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">Board</h2>
        <p className="text-sm text-slate-600">ใช้เก็บงานที่ยังไม่กำหนดวันเวลา และติดตามสถานะงานด้วยเลนหลัก 4 ช่อง</p>
      </div>
      <div className="grid gap-3 lg:grid-cols-4">
        {lanes.map((lane) => {
          const laneCards = cardsForLane(lane.id)
          return (
            <div key={lane.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">{lane.title}</h3>
                <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-600">{laneCards.length}</span>
              </div>
              <div className="space-y-3">
                {laneCards.length > 0 ? laneCards.map((item) => <PlanningItemCard key={`${lane.id}-${item.id}`} item={item} />) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-6 text-center text-sm text-slate-500">ยังไม่มีงานในช่องนี้</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default function PlanningCalendarPage() {
  const { user } = useAuthContext()
  const searchParams = useSearchParams()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [sourceFilter, setSourceFilter] = useState<'all' | 'team_plan' | 'monthly_plan'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'not_started' | 'in_progress' | 'completed' | 'cancelled'>('all')
  const [activeTab, setActiveTab] = useState<PlanningTab>('calendar')
  const [teamPlanDialogOpen, setTeamPlanDialogOpen] = useState(false)
  const [largeWorkDialogOpen, setLargeWorkDialogOpen] = useState(false)
  const [editingTeamPlan, setEditingTeamPlan] = useState<TeamPlanResponse | null>(null)
  const [editingLargeWork] = useState<LargeWorkResponse | null>(null)
  const [operationsItem, setOperationsItem] = useState<LargeWorkResponse | null>(null)
  const [planningBoardItem, setPlanningBoardItem] = useState<LargeWorkResponse | null>(null)

  const params = useMemo(
    () => ({
      from: toDateKey(year, month, 1),
      to: toDateKey(year, month, getDaysInMonth(year, month)),
    }),
    [year, month],
  )

  const { data: teams } = useTeams()
  const calendarQuery = usePlanningCalendar(params)
  const teamPlansQuery = useTeamPlans(params)
  const largeWorksQuery = useLargeWorks(params)

  const filteredItems = useMemo(() => {
    if (!calendarQuery.data?.items) return []
    return calendarQuery.data.items.filter((item) => {
      const sourceMatches = sourceFilter === 'all' || item.type === sourceFilter
      const normalizedStatus = normalizePlanningStatus(item.status)
      const statusMatches = statusFilter === 'all' || normalizedStatus === statusFilter
      return sourceMatches && statusMatches
    })
  }, [calendarQuery.data?.items, sourceFilter, statusFilter])

  const itemsByDate = useMemo(() => groupItemsByDateKey(filteredItems), [filteredItems])
  const selectedItems = useMemo(
    () => (selectedDate ? (itemsByDate.get(selectedDate) ?? []) : []),
    [selectedDate, itemsByDate],
  )

  const handleMonthChange = useCallback((newYear: number, newMonth: number) => {
    setYear(newYear)
    setMonth(newMonth)
    setSelectedDate(null)
  }, [])


  const canCreateTeam = canCreateTeamPlan(user?.role, user?.teamId != null)
  const canAddPlanningWork = canCreateTeam && user?.role !== 'user'
  const activePlanDays = itemsByDate.size
  const teamPlanCount = teamPlansQuery.data?.length ?? 0

  useEffect(() => {
    const requestedLargeWorkId = Number(searchParams.get('largeWorkId') ?? 0)
    const shouldOpenOperations = searchParams.get('view') === 'operations'
    if (!shouldOpenOperations || requestedLargeWorkId <= 0 || operationsItem?.id === requestedLargeWorkId) return

    const routedItem = largeWorksQuery.data?.find((item) => item.id === requestedLargeWorkId)
    if (!routedItem) return

    setActiveTab('board')
    setOperationsItem(routedItem)
  }, [largeWorksQuery.data, operationsItem?.id, searchParams])

  const showLargeWorkOperations = useCallback((item: LargeWorkResponse) => {
    setActiveTab('board')
    setOperationsItem(item)
  }, [])

  if (!canViewPlanningCalendar(user?.role)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-stone-500">
        <CalendarDays className="mb-3 h-12 w-12 text-stone-300" />
        <p className="text-sm">ไม่มีสิทธิ์เข้าถึง</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4 pb-24 md:pb-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
              <CalendarDays className="h-3.5 w-3.5 text-sky-700" />
              ระบบวางแผนงาน
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">ระบบวางแผนงาน</h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              วางแผนงานรายเดือนด้วย Calendar และเก็บงานที่ยังไม่กำหนดวันเวลาไว้ใน Board ตามสิทธิ์ของทีม
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
            {canAddPlanningWork ? (
              <Button onClick={() => { setEditingTeamPlan(null); setTeamPlanDialogOpen(true) }} className="min-h-11 bg-slate-900 text-white hover:bg-slate-800">
                <Plus className="h-4 w-4" /> เพิ่มงาน
              </Button>
            ) : user?.role === 'viewer' ? null : (
              <Button disabled className="min-h-11 bg-slate-200 text-slate-500">
                <Plus className="h-4 w-4" /> เพิ่มงาน · ไม่มีสิทธิ์
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                calendarQuery.refetch()
                teamPlansQuery.refetch()
                largeWorksQuery.refetch()
              }}
              className="min-h-11 border-slate-200 text-slate-700"
            >
              <RefreshCw className="h-4 w-4" /> ลองใหม่ / รีเฟรช
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[auto_1fr_auto] lg:items-end">
          <CalendarMonthSelector year={year} month={month} onChange={handleMonthChange} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="space-y-1 text-sm font-semibold text-slate-700">
              <span>แหล่งที่มา</span>
              <select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value as typeof sourceFilter)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-sky-500">
                <option value="all">ทั้งหมด</option>
                <option value="team_plan">งานแผนของทีม</option>
                <option value="monthly_plan">งานจาก monthly plan</option>
              </select>
            </label>
            <label className="space-y-1 text-sm font-semibold text-slate-700">
              <span>สถานะ</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-sky-500">
                <option value="all">ทั้งหมด</option>
                <option value="not_started">ยังไม่เริ่ม</option>
                <option value="in_progress">กำลังทำ</option>
                <option value="completed">เสร็จแล้ว</option>
                <option value="cancelled">ยกเลิก</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => {
                const nowDate = new Date()
                setYear(nowDate.getFullYear())
                setMonth(nowDate.getMonth() + 1)
                setSelectedDate(todayKey())
              }}
              className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              วันนี้
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold text-slate-500">งานทั้งหมด</p>
              <p className="text-xl font-black text-slate-950">{filteredItems.length}</p>
            </div>
            <div className="rounded-2xl border border-sky-100 bg-sky-50 p-3">
              <p className="text-xs font-semibold text-slate-500">วันที่มีงาน</p>
              <p className="text-xl font-black text-sky-700">{activePlanDays}</p>
            </div>
            <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
              <p className="text-xs font-semibold text-slate-500">แผนทีม</p>
              <p className="text-xl font-black text-teal-700">{teamPlanCount}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
        {([
          ['calendar', 'Calendar'],
          ['board', 'Board'],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setActiveTab(value)}
            className={cn(
              'min-h-11 rounded-xl px-3 py-2 text-sm font-bold transition',
              activeTab === value ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'calendar' && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)]">
          <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
            {calendarQuery.isLoading ? (
              <div className="grid gap-2">
                <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-[420px] animate-pulse rounded-2xl bg-slate-100" />
              </div>
            ) : calendarQuery.error ? (
              <PlanningStateMessage title="โหลดข้อมูลงานไม่สำเร็จ" description="กรุณากดลองใหม่เพื่อโหลดข้อมูลล่าสุด" />
            ) : filteredItems.length === 0 ? (
              <PlanningStateMessage
                title="ยังไม่มีงานในเดือนนี้"
                description={canAddPlanningWork ? 'เพิ่มงานแรกเพื่อเริ่มวางแผนเดือนนี้' : 'ยังไม่มีงานที่ได้รับมอบหมาย'}
                action={canAddPlanningWork ? <Button onClick={() => { setEditingTeamPlan(null); setTeamPlanDialogOpen(true) }} className="bg-slate-900 text-white hover:bg-slate-800">เพิ่มงานแรก</Button> : undefined}
              />
            ) : (
              <CalendarGrid year={year} month={month} itemsByDate={itemsByDate} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
            )}
          </section>
          <PlanningAgenda
            selectedDate={selectedDate}
            items={selectedDate ? selectedItems : filteredItems.slice(0, 8)}
            canAddPlanningWork={canAddPlanningWork}
            onAdd={() => { setEditingTeamPlan(null); setTeamPlanDialogOpen(true) }}
          />
        </div>
      )}

      {activeTab === 'board' && (
        calendarQuery.isLoading ? (
          <div className="grid gap-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((item) => <div key={item} className="h-72 animate-pulse rounded-2xl bg-slate-100" />)}
          </div>
        ) : calendarQuery.error ? (
          <PlanningStateMessage title="โหลดข้อมูลงานไม่สำเร็จ" description="กรุณากดลองใหม่เพื่อโหลดข้อมูลล่าสุด" />
        ) : (
          <PlanningBoardView items={filteredItems} />
        )
      )}

      <TeamPlanDialog
        open={teamPlanDialogOpen}
        plan={editingTeamPlan}
        teams={teams}
        currentTeamId={user?.teamId}
        onClose={() => setTeamPlanDialogOpen(false)}
      />
      <LargeWorkDialog
        open={largeWorkDialogOpen}
        item={editingLargeWork}
        teams={teams}
        currentTeamId={user?.teamId}
        onClose={() => setLargeWorkDialogOpen(false)}
        onSaved={showLargeWorkOperations}
      />
      {operationsItem != null && (
        <LargeWorkOperationsDialog
          item={operationsItem}
          open={operationsItem != null}
          onClose={() => setOperationsItem(null)}
        />
      )}
      {planningBoardItem != null && (
        <LargeWorkPlanningBoard
          item={planningBoardItem}
          open={planningBoardItem != null}
          onClose={() => setPlanningBoardItem(null)}
        />
      )}
    </div>
  )}
