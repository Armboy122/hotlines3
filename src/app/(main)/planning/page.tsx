'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  CalendarDays,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Trash2,
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
  useRemoveTeamPlan,
  useUpdateTeamPlan,
} from '@/hooks/mutations/useTeamPlanMutations'
import {
  useCreateLargeWork,
  useUpdateLargeWork,
} from '@/hooks/mutations/useLargeWorkMutations'
import {
  canViewPlanningCalendar,
  isSuperAdmin,
} from '@/lib/auth/role-policy'
import {
  canAddPlanningWork as canUserAddPlanningWork,
  filterPlanningItems,
  getPlanningCardActions,
  normalizePlanningStatus,
  planningStatusFilterOptions,
  planningStatusLabel,
  statusBadgeClass,
} from '@/lib/planning-ui'
import type { PlanningSourceFilter, PlanningStatusFilter } from '@/lib/planning-ui'
import { expandDateKeys, groupItemsByDateKey } from '@/types/planning-calendar'
import type { PlanningCalendarItem } from '@/types/planning-calendar'
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
type TeamPlanFormState = Omit<TeamPlanRequest, 'teamId' | 'startDate' | 'endDate'> & {
  teamId: string
  startDate: string
  endDate: string
}
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
  return {
    teamId: teamId ? String(teamId) : '',
    title: '',
    workType: '',
    startDate: '',
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

function formatRange(startDate?: string | null, endDate?: string | null): string {
  if (!startDate) return 'รอวางแผน'
  if (!endDate || endDate === startDate) return startDate
  return `${startDate} ถึง ${endDate}`
}

function formatThaiDateLabel(dateKey: string): string {
  const parsed = new Date(`${dateKey}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return dateKey
  return parsed.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
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
        startDate: plan.startDate ?? '',
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
  const isValid = form.teamId && form.title.trim() && form.locationText.trim()

  const handleSubmit = () => {
    if (!isValid) return
    const payload: TeamPlanRequest = {
      teamId: Number(form.teamId),
      title: form.title.trim(),
      workType: nullableText(form.workType),
      startDate: nullableText(form.startDate),
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
              aria-label="ทีม"
              name="teamId"
              value={form.teamId}
              onChange={(event) => setForm((prev) => ({ ...prev, teamId: event.target.value }))}
              disabled={!canSelectAnyTeam}
              className="min-h-11 w-full rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-emerald-500"
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
            <Input name="workType" value={form.workType ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, workType: e.target.value }))} placeholder="เช่น PM, ตรวจแก้" />
          </Field>
          <Field label="หัวข้องาน" required className="sm:col-span-2">
            <Input name="title" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="ระบุงานที่ต้องทำ" />
          </Field>
          <Field label="วันที่เริ่ม">
            <Input name="startDate" type="date" value={form.startDate} onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))} />
            <p className="text-xs text-gray-500">เว้นว่างได้เพื่อเก็บไว้ในบอร์ด “รอวางแผน” ก่อนกำหนดวัน</p>
          </Field>
          <Field label="วันที่สิ้นสุด">
            <Input name="endDate" type="date" value={form.endDate ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))} />
          </Field>
          <Field label="เวลา">
            <Input name="workTime" value={form.workTime ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, workTime: e.target.value }))} placeholder="08:30-16:30" />
          </Field>
          <Field label="พื้นที่/จุดปฏิบัติงาน" required>
            <Input name="locationText" value={form.locationText} onChange={(e) => setForm((prev) => ({ ...prev, locationText: e.target.value }))} placeholder="สถานี/ฟีดเดอร์/พื้นที่" />
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
              aria-label="ทีมเจ้าของ"
              name="ownerTeamId"
              value={form.ownerTeamId}
              onChange={(event) => setForm((prev) => ({ ...prev, ownerTeamId: event.target.value }))}
              disabled={!canSelectAnyOwnerTeam}
              className="min-h-11 w-full rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-emerald-500"
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
            <Input name="largeWorkType" value={form.workType ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, workType: e.target.value }))} placeholder="เช่น งานระดม/งานเร่งด่วน" />
          </Field>
          <Field label="หัวข้องาน" required className="sm:col-span-2">
            <Input name="largeWorkTitle" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="ระบุชื่องานระดมทีม" />
          </Field>
          <Field label="วันที่เริ่ม" required>
            <Input name="largeWorkStartDate" type="date" value={form.startDate} onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))} />
          </Field>
          <Field label="วันที่สิ้นสุด">
            <Input name="largeWorkEndDate" type="date" value={form.endDate ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))} />
          </Field>
          <Field label="เวลา">
            <Input name="largeWorkTime" value={form.workTime ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, workTime: e.target.value }))} placeholder="08:30-16:30" />
          </Field>
          <Field label="พื้นที่/จุดปฏิบัติงาน" required>
            <Input name="largeWorkLocationText" value={form.locationText} onChange={(e) => setForm((prev) => ({ ...prev, locationText: e.target.value }))} placeholder="สถานี/ฟีดเดอร์/พื้นที่" />
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
    <div className="flex min-w-0 items-center gap-1.5">
      <span className="text-gray-400">{icon}</span>
      <span className="truncate">{text}</span>
    </div>
  )
}

function teamPlanToPlanningItem(plan: TeamPlanResponse): PlanningCalendarItem {
  const dateKeys = plan.startDate ? expandDateKeys(plan.startDate, plan.endDate ?? null) : []
  return {
    id: `team_plan:${plan.id}`,
    type: 'team_plan',
    sourceId: plan.id,
    title: plan.title,
    startDate: plan.startDate ?? '',
    endDate: plan.endDate ?? null,
    workTime: plan.workTime ?? null,
    dateKeys,
    teamIds: [plan.teamId],
    teams: plan.team ? [{ id: plan.team.id, name: plan.team.name, role: 'owner' }] : [{ id: plan.teamId, name: `ทีม #${plan.teamId}`, role: 'owner' }],
    locationText: plan.locationText,
    electricArea: {
      peaId: null,
      peaName: null,
      operationCenterId: null,
      operationCenterName: null,
      feederId: null,
      feederCode: null,
      stationId: null,
      stationName: null,
    },
    status: plan.status,
    source: {
      route: `/planning?teamPlanId=${plan.id}`,
      dailyReportPrefillRoute: null,
    },
    actions: {
      canView: true,
      canEdit: plan.actions.canEdit,
      canCancel: plan.actions.canDelete,
      canUpload: false,
      canDownload: false,
      canStartDailyReport: false,
    },
  }
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

function PlanningItemCard({
  item,
  onEdit,
  onDelete,
  isDeleting,
}: {
  item: import('@/types/planning-calendar').PlanningCalendarItem
  onEdit?: (item: import('@/types/planning-calendar').PlanningCalendarItem) => void
  onDelete?: (item: import('@/types/planning-calendar').PlanningCalendarItem) => void
  isDeleting?: boolean
}) {
  const teamNames = item.teams.map((team) => team.name).join(', ') || 'ไม่ระบุทีม'
  const sourceLabel = item.type === 'monthly_plan'
    ? 'งานจากแผนรายเดือน'
    : item.type === 'large_work'
      ? 'งานระดมทีม'
      : 'งานแผนของทีม'
  const sourceClass = item.type === 'monthly_plan'
    ? 'border-amber-200 bg-amber-50 text-amber-700'
    : item.type === 'large_work'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : 'border-gray-200 bg-gray-50 text-gray-700'
  const actions = getPlanningCardActions(item)

  return (
    <article className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap gap-2">
            <span className={cn('rounded-full border px-2.5 py-1 text-xs font-bold', sourceClass)}>{sourceLabel}</span>
            <span className={cn('rounded-full border px-2.5 py-1 text-xs font-bold', statusBadgeClass(item.status))}>{planningStatusLabel(item.status)}</span>
          </div>
          <h3 className="break-words text-base font-bold text-slate-950">{item.title}</h3>
          <div className="grid gap-1.5 text-sm text-slate-600 sm:grid-cols-2">
            <Meta icon={<MapPin className="h-4 w-4" />} text={item.locationText ?? 'ไม่ระบุสถานที่'} />
            <Meta icon={<CalendarDays className="h-4 w-4" />} text={formatRange(item.startDate, item.endDate)} />
            {item.workTime && <Meta icon={<CalendarDays className="h-4 w-4" />} text={item.workTime} />}
            <Meta icon={<Users className="h-4 w-4" />} text={teamNames} />
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          {actions.map((action) => {
            if (action.id === 'edit') {
              return onEdit ? (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => onEdit(item)}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
                >
                  {action.label}
                </button>
              ) : null
            }

            if (action.id === 'delete') {
              return onDelete ? (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => onDelete(item)}
                  disabled={isDeleting}
                  className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeleting ? 'กำลังลบ' : action.label}
                </button>
              ) : null
            }

            if (action.href) {
              return (
                <a
                  key={action.id}
                  href={action.href}
                  className={cn(
                    'inline-flex min-h-11 items-center justify-center rounded-xl border px-3 text-sm font-semibold',
                    'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                  )}
                >
                  {action.label}
                </a>
              )
            }

            if (action.disabled) {
              return (
                <span
                  key={action.id}
                  title={action.disabledReason}
                  aria-disabled="true"
                  className="inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-500"
                >
                  {action.label} · ยังไม่พร้อม
                </span>
              )
            }

            return null
          })}
        </div>
      </div>
    </article>
  )
}

function PlanningAgenda({
  selectedDate,
  items,
  monthItemCount,
  isLoading,
  isError,
  onEdit,
  onDelete,
  isDeleting,
}: {
  selectedDate: string | null
  items: import('@/types/planning-calendar').PlanningCalendarItem[]
  monthItemCount: number
  isLoading: boolean
  isError: boolean
  onEdit: (item: import('@/types/planning-calendar').PlanningCalendarItem) => void
  onDelete: (item: import('@/types/planning-calendar').PlanningCalendarItem) => void
  isDeleting: boolean
}) {
  const title = selectedDate ? 'รายการวันที่เลือก' : 'รายการงานเดือนนี้'
  const subtitle = selectedDate
    ? `งานวันที่ ${formatThaiDateLabel(selectedDate)}`
    : monthItemCount > 8
      ? `แสดง 8 รายการแรกจากทั้งหมด ${monthItemCount} งานในเดือนนี้`
      : `งานทั้งหมด ${monthItemCount} รายการในเดือนนี้`

  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-20 lg:self-start">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-950">{title}</h2>
          <p className="text-sm text-slate-600">{subtitle}</p>
        </div>
      </div>
      {isLoading ? (
        <div className="space-y-3" aria-label="กำลังโหลดรายการงาน">
          {[0, 1, 2].map((item) => (
            <div key={item} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="mb-3 h-5 w-2/3 animate-pulse rounded-full bg-slate-200" />
              <div className="h-4 w-full animate-pulse rounded-full bg-slate-200" />
              <div className="mt-2 h-4 w-3/4 animate-pulse rounded-full bg-slate-200" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <PlanningStateMessage
          title="ยังไม่แสดงรายการงาน"
          description="โหลดข้อมูลปฏิทินไม่สำเร็จ กดปุ่มลองใหม่ / รีเฟรชด้านบนเพื่อดูรายการล่าสุด"
        />
      ) : items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => <PlanningItemCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} isDeleting={isDeleting} />)}
        </div>
      ) : (
        <PlanningStateMessage
          title={selectedDate ? 'วันที่นี้ยังไม่มีงาน' : 'เดือนนี้ยังไม่มีงานตามเงื่อนไข'}
          description={selectedDate ? 'เลือกวันอื่นบนปฏิทิน หรือใช้ปุ่มเพิ่มงานด้านบนเมื่อมีสิทธิ์สร้างแผนงาน' : 'ปฏิทินยังคงแสดงทั้งเดือนเพื่อให้เห็นโครงสร้างงาน หากต้องสร้างแผนใหม่ให้ใช้ปุ่มเพิ่มงานด้านบน'}
        />
      )}
    </section>
  )
}

function PlanningBoardView({
  items,
  onEdit,
  onDelete,
  isDeleting,
}: {
  items: import('@/types/planning-calendar').PlanningCalendarItem[]
  onEdit: (item: import('@/types/planning-calendar').PlanningCalendarItem) => void
  onDelete: (item: import('@/types/planning-calendar').PlanningCalendarItem) => void
  isDeleting: boolean
}) {
  const lanes = [
    { id: 'not_started', title: 'รอวางแผน' },
    { id: 'planned', title: 'กำหนดวันแล้ว' },
    { id: 'in_progress', title: 'กำลังทำ' },
    { id: 'completed', title: 'เสร็จแล้ว' },
  ] as const
  const cardsForLane = (laneId: (typeof lanes)[number]['id']) => items.filter((item) => normalizePlanningStatus(item.status) === laneId)

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">บอร์ดงาน</h2>
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
                {laneCards.length > 0 ? laneCards.map((item) => (
                  <PlanningItemCard
                    key={`${lane.id}-${item.id}`}
                    item={item}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    isDeleting={isDeleting}
                  />
                )) : (
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
  const [sourceFilter, setSourceFilter] = useState<PlanningSourceFilter>('all')
  const [statusFilter, setStatusFilter] = useState<PlanningStatusFilter>('all')
  const [activeTab, setActiveTab] = useState<PlanningTab>('calendar')
  const [teamPlanDialogOpen, setTeamPlanDialogOpen] = useState(false)
  const [largeWorkDialogOpen, setLargeWorkDialogOpen] = useState(false)
  const [editingTeamPlan, setEditingTeamPlan] = useState<TeamPlanResponse | null>(null)
  const [editingLargeWork, setEditingLargeWork] = useState<LargeWorkResponse | null>(null)
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
  const teamPlanBacklogQuery = useTeamPlans({})
  const largeWorksQuery = useLargeWorks(params)
  const removeTeamPlan = useRemoveTeamPlan()
  const teamScope = useMemo(
    () => ({ role: user?.role, teamId: user?.teamId }),
    [user?.role, user?.teamId],
  )

  const filteredCalendarItems = useMemo(() => {
    if (!calendarQuery.data?.items) return []
    const filtered = filterPlanningItems(calendarQuery.data.items, { sourceFilter, statusFilter, teamScope })
    const seen = new Set<string>()
    return filtered.filter((item) => {
      if (seen.has(item.id)) return false
      seen.add(item.id)
      return true
    })
  }, [calendarQuery.data?.items, sourceFilter, statusFilter, teamScope])

  const filteredBacklogItems = useMemo(() => {
    const draftPlans = (teamPlanBacklogQuery.data ?? [])
      .filter((plan) => !plan.startDate)
      .map(teamPlanToPlanningItem)
    return filterPlanningItems(draftPlans, { sourceFilter, statusFilter, teamScope })
  }, [sourceFilter, statusFilter, teamPlanBacklogQuery.data, teamScope])

  const boardItems = useMemo(
    () => [...filteredBacklogItems, ...filteredCalendarItems],
    [filteredBacklogItems, filteredCalendarItems],
  )

  const itemsByDate = useMemo(() => groupItemsByDateKey(filteredCalendarItems), [filteredCalendarItems])
  const selectedItems = useMemo(
    () => (selectedDate ? (itemsByDate.get(selectedDate) ?? []) : []),
    [selectedDate, itemsByDate],
  )

  const handleMonthChange = useCallback((newYear: number, newMonth: number) => {
    setYear(newYear)
    setMonth(newMonth)
    setSelectedDate(null)
  }, [])


  const canAddPlanningWork = canUserAddPlanningWork(user?.role, user?.teamId != null)
  const activePlanDays = itemsByDate.size
  const teamPlanCount = (teamPlansQuery.data?.length ?? 0) + filteredBacklogItems.length

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

  const handleEditPlanningItem = useCallback((item: import('@/types/planning-calendar').PlanningCalendarItem) => {
    if (item.type === 'team_plan') {
      const plan = teamPlansQuery.data?.find((teamPlan) => teamPlan.id === item.sourceId)
        ?? teamPlanBacklogQuery.data?.find((teamPlan) => teamPlan.id === item.sourceId)
      if (!plan) return
      setEditingTeamPlan(plan)
      setTeamPlanDialogOpen(true)
      return
    }

    if (item.type === 'large_work') {
      const largeWork = largeWorksQuery.data?.find((entry) => entry.id === item.sourceId)
      if (!largeWork) return
      setEditingLargeWork(largeWork)
      setLargeWorkDialogOpen(true)
    }
  }, [largeWorksQuery.data, teamPlanBacklogQuery.data, teamPlansQuery.data])

  const handleDeletePlanningItem = useCallback((item: import('@/types/planning-calendar').PlanningCalendarItem) => {
    if (item.type !== 'team_plan' || !item.actions.canCancel) return
    if (!window.confirm(`ลบงาน “${item.title}” หรือไม่?`)) return
    removeTeamPlan.mutate(item.sourceId, {
      onSuccess: () => {
        if (selectedDate && item.dateKeys.includes(selectedDate)) {
          setSelectedDate(null)
        }
      },
    })
  }, [removeTeamPlan, selectedDate])

  if (!canViewPlanningCalendar(user?.role)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-stone-500">
        <CalendarDays className="mb-3 h-12 w-12 text-stone-300" />
        <p className="text-sm">ไม่มีสิทธิ์เข้าถึง</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-3 py-4 sm:px-4 lg:px-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
              <CalendarDays className="h-3.5 w-3.5 text-emerald-700" />
              ระบบวางแผนงาน
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">ระบบวางแผนงาน</h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              วางแผนงานรายเดือนด้วยปฏิทิน และเก็บงานที่ยังไม่กำหนดวันเวลาไว้ในบอร์ดตามสิทธิ์ของทีม
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
                teamPlanBacklogQuery.refetch()
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
              <select name="sourceFilter" value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value as PlanningSourceFilter)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-emerald-500">
                <option value="all">ทั้งหมด</option>
                <option value="team_plan">งานแผนของทีม</option>
                <option value="monthly_plan">งานจากแผนรายเดือน</option>
                <option value="large_work">งานระดมทีม</option>
              </select>
            </label>
            <label className="space-y-1 text-sm font-semibold text-slate-700">
              <span>สถานะ</span>
              <select name="statusFilter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as PlanningStatusFilter)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-emerald-500">
                {planningStatusFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
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
              <p className="text-xl font-black text-slate-950">{boardItems.length}</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
              <p className="text-xs font-semibold text-slate-500">วันที่มีงาน</p>
              <p className="text-xl font-black text-emerald-700">{activePlanDays}</p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-3">
              <p className="text-xs font-semibold text-slate-500">แผนทีม</p>
              <p className="text-xl font-black text-amber-700">{teamPlanCount}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
        {([
          ['calendar', 'ปฏิทิน'],
          ['board', 'บอร์ด'],
        ] as const).map(([value, label]) => (
            <button
              type="button"
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
        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)]">
          <PlanningAgenda
            selectedDate={selectedDate}
            items={selectedDate ? selectedItems : filteredCalendarItems.slice(0, 8)}
            monthItemCount={filteredCalendarItems.length}
            isLoading={calendarQuery.isLoading}
            isError={Boolean(calendarQuery.error)}
            onEdit={handleEditPlanningItem}
            onDelete={handleDeletePlanningItem}
            isDeleting={removeTeamPlan.isPending}
          />
          <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 lg:order-first">
            {calendarQuery.isLoading ? (
              <div className="grid gap-2">
                <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-[420px] animate-pulse rounded-2xl bg-slate-100" />
              </div>
            ) : (
              <div className="space-y-3">
                <CalendarGrid year={year} month={month} itemsByDate={itemsByDate} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
                {calendarQuery.error ? (
                  <PlanningStateMessage title="โหลดข้อมูลงานไม่สำเร็จ" description="กรุณากดลองใหม่ / รีเฟรชเพื่อโหลดข้อมูลล่าสุด" />
                ) : filteredCalendarItems.length === 0 ? (
                  <PlanningStateMessage
                    title="เดือนนี้ยังไม่มีงานตามเงื่อนไข"
                    description="ปฏิทินยังแสดงโครงสร้างทั้งเดือนเพื่อให้เลือกวันและตรวจสอบแผนงานได้ต่อเนื่อง"
                  />
                ) : null}
              </div>
            )}
          </section>
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
          <PlanningBoardView
            items={boardItems}
            onEdit={handleEditPlanningItem}
            onDelete={handleDeletePlanningItem}
            isDeleting={removeTeamPlan.isPending}
          />
        )
      )}

      <TeamPlanDialog
        open={teamPlanDialogOpen}
        plan={editingTeamPlan}
        teams={teams}
        currentTeamId={user?.teamId}
        onClose={() => { setEditingTeamPlan(null); setTeamPlanDialogOpen(false) }}
      />
      <LargeWorkDialog
        open={largeWorkDialogOpen}
        item={editingLargeWork}
        teams={teams}
        currentTeamId={user?.teamId}
        onClose={() => { setEditingLargeWork(null); setLargeWorkDialogOpen(false) }}
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
