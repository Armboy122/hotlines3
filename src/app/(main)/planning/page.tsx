'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import {
  CalendarDays,
  ClipboardList,
  Edit3,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react'
import { useAuthContext } from '@/lib/auth/auth-context'
import {
  useLargeWorks,
  usePlanningCalendar,
  useTeamPlans,
  useTeams,
} from '@/hooks/useQueries'
import {
  useCancelTeamPlan,
  useCreateTeamPlan,
  useRemoveTeamPlan,
  useUpdateTeamPlan,
} from '@/hooks/mutations/useTeamPlanMutations'
import {
  useCancelLargeWork,
  useCreateLargeWork,
  useUpdateLargeWork,
} from '@/hooks/mutations/useLargeWorkMutations'
import {
  canAssignLargeWorkTasks,
  canCreateLargeWork,
  canCreateTeamPlan,
  canDeleteTeamPlan,
  canEditLargeWork,
  canEditTeamPlan,
  canManageTeamLargeWork,
  canViewPlanningCalendar,
  isMonthlyPlanManager,
} from '@/lib/auth/role-policy'
import {
  groupItemsByDateKey,
  type PlanningItemType,
} from '@/types/planning-calendar'
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
import { LargeWorkOverviewPanel } from '@/features/large-work/components/LargeWorkOverviewPanel'
import { LargeWorkTasksDialog } from '@/features/large-work/components/LargeWorkTasksDialog'
import { WorkerTodoQueue } from '@/features/large-work/components/WorkerTodoQueue'
import { CalendarMonthSelector } from '@/features/planning-calendar/components/CalendarMonthSelector'
import { CalendarGrid } from '@/features/planning-calendar/components/CalendarGrid'
import { DayDetailDrawer } from '@/features/planning-calendar/components/DayDetailDrawer'
import { CalendarFilterBar } from '@/features/planning-calendar/components/CalendarFilterBar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

type PlanningTab = 'calendar' | 'team-plan' | 'large-work' | 'worker-todos'
type TeamPlanFormState = Omit<TeamPlanRequest, 'teamId'> & { teamId: string }
type LargeWorkFormState = Omit<LargeWorkRequest, 'ownerTeamId' | 'participantTeamIds'> & {
  ownerTeamId: string
  participantTeamIds: string[]
}

const THAI_STATUS_LABELS: Record<string, string> = {
  draft: 'ร่าง',
  planned: 'วางแผนแล้ว',
  in_progress: 'กำลังดำเนินการ',
  cancelled: 'ยกเลิก',
  completed: 'เสร็จสิ้น',
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
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    case 'cancelled':
      return 'border-red-200 bg-red-50 text-red-600'
    default:
      return 'border-amber-200 bg-amber-50 text-amber-700'
  }
}

function formatRange(startDate: string, endDate?: string | null): string {
  if (!endDate || endDate === startDate) return startDate
  return `${startDate} ถึง ${endDate}`
}

function teamName(teams: Team[] | undefined, id: number | string | null | undefined): string {
  if (id == null || id === '') return 'ไม่ระบุทีม'
  const numericId = typeof id === 'string' ? Number(id) : id
  return teams?.find((team) => team.id === numericId)?.name ?? `ทีม #${numericId}`
}

function SectionHeader({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="card-glass rounded-2xl p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            {icon}
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 sm:text-xl">{title}</h1>
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          </div>
        </div>
        {action}
      </div>
    </div>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white/70 p-8 text-center">
      <p className="text-sm font-semibold text-gray-800">{title}</p>
      <p className="mt-1 text-xs text-gray-500">{description}</p>
    </div>
  )
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
  const canSelectAnyTeam = isMonthlyPlanManager(useAuthContext().user?.role)
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
}: {
  open: boolean
  item: LargeWorkResponse | null
  teams?: Team[]
  currentTeamId?: number | null
  onClose: () => void
}) {
  const [form, setForm] = useState<LargeWorkFormState>(() => defaultLargeWorkForm(currentTeamId))
  const createItem = useCreateLargeWork()
  const updateItem = useUpdateLargeWork()
  const canSelectAnyOwnerTeam = isMonthlyPlanManager(useAuthContext().user?.role)
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
        { onSuccess: onClose },
      )
    } else {
      createItem.mutate(payload, { onSuccess: onClose })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item ? 'แก้ไขงานระดมทีม' : 'เพิ่มงานระดมทีม'}</DialogTitle>
          <DialogDescription>
            ใช้สำหรับงานใหญ่ที่มีทีมเจ้าของและทีมร่วมปฏิบัติงานหลายทีม
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

function TeamPlanCard({
  plan,
  teams,
  canEdit,
  canDelete,
  onEdit,
  onCancel,
  onRemove,
}: {
  plan: TeamPlanResponse
  teams?: Team[]
  canEdit: boolean
  canDelete: boolean
  onEdit: (plan: TeamPlanResponse) => void
  onCancel: (id: number) => void
  onRemove: (id: number) => void
}) {
  return (
    <div className="card-glass rounded-2xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-semibold', statusBadgeClass(plan.status))}>
              {THAI_STATUS_LABELS[plan.status] ?? plan.status}
            </span>
            {plan.workType && <span className="rounded-full border border-gray-200 bg-white/70 px-2 py-0.5 text-[11px] text-gray-500">{plan.workType}</span>}
          </div>
          <h3 className="mt-2 text-base font-bold text-gray-900">{plan.title}</h3>
          <p className="mt-1 text-xs text-gray-500">{teamName(teams, plan.teamId)} · {formatRange(plan.startDate, plan.endDate)}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          {canEdit && (
            <button onClick={() => onEdit(plan)} className="rounded-lg p-2 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600" aria-label="แก้ไขแผนทีม">
              <Edit3 className="h-4 w-4" />
            </button>
          )}
          {canDelete && (
            <button onClick={() => onRemove(plan.id)} className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600" aria-label="ลบแผนทีม">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <div className="grid gap-2 text-xs text-gray-600 sm:grid-cols-2">
        {plan.locationText && <Meta icon={<MapPin className="h-3.5 w-3.5" />} text={plan.locationText} />}
        {plan.workTime && <Meta icon={<CalendarDays className="h-3.5 w-3.5" />} text={plan.workTime} />}
        {plan.createdBy?.displayName || plan.createdBy?.username ? <Meta icon={<Users className="h-3.5 w-3.5" />} text={`ผู้สร้าง: ${plan.createdBy.displayName ?? plan.createdBy.username}`} /> : null}
      </div>
      {plan.notes && <p className="rounded-xl bg-white/70 p-3 text-xs text-gray-600">{plan.notes}</p>}
      {plan.status === 'planned' && canEdit && (
        <Button variant="outline" size="sm" onClick={() => onCancel(plan.id)} className="w-full sm:w-auto">
          <XCircle className="h-4 w-4" /> ยกเลิกแผน
        </Button>
      )}
    </div>
  )
}

function LargeWorkCard({
  item,
  teams,
  canEdit,
  canCancel,
  canAssign,
  expanded,
  onEdit,
  onCancel,
  onToggleExpand,
  onManageTasks,
}: {
  item: LargeWorkResponse
  teams?: Team[]
  canEdit: boolean
  canCancel: boolean
  canAssign: boolean
  expanded: boolean
  onEdit: (item: LargeWorkResponse) => void
  onCancel: (id: number) => void
  onToggleExpand: () => void
  onManageTasks: () => void
}) {
  const owner = item.teams.find((team) => team.role === 'owner')
  const participants = item.teams.filter((team) => team.role === 'participant')

  return (
    <div className="card-glass rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4 space-y-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-semibold', statusBadgeClass(item.status))}>
              {THAI_STATUS_LABELS[item.status] ?? item.status}
            </span>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">งานระดมทีม</span>
            {item.workType && <span className="rounded-full border border-gray-200 bg-white/70 px-2 py-0.5 text-[11px] text-gray-500">{item.workType}</span>}
          </div>
          <h3 className="mt-2 text-base font-bold text-gray-900">{item.title}</h3>
          <p className="mt-1 text-xs text-gray-500">{owner?.name ?? teamName(teams, item.ownerTeamId)} · {formatRange(item.startDate, item.endDate)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {canEdit && (
            <button onClick={() => onEdit(item)} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-gray-500 hover:bg-emerald-50 hover:text-emerald-600" aria-label="แก้ไขงานระดมทีม">
              <Edit3 className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onToggleExpand}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-gray-500 hover:bg-amber-50 hover:text-amber-700"
            aria-label={expanded ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียดและความคืบหน้า'}
          >
            <span className="text-xs font-semibold">{expanded ? '▲' : '▼'}</span>
          </button>
        </div>
      </div>
      <div className="grid gap-2 text-xs text-gray-600 sm:grid-cols-2">
        {item.locationText && <Meta icon={<MapPin className="h-3.5 w-3.5" />} text={item.locationText} />}
        {item.workTime && <Meta icon={<CalendarDays className="h-3.5 w-3.5" />} text={item.workTime} />}
        <Meta icon={<Users className="h-3.5 w-3.5" />} text={`ทีมร่วม: ${participants.map((team) => team.name).join(', ') || 'ยังไม่ระบุ'}`} />
      </div>
      {item.notes && <p className="rounded-xl bg-white/70 p-3 text-xs text-gray-600">{item.notes}</p>}
      {expanded && (
        <LargeWorkOverviewPanel
          id={item.id}
          canAssignTasks={canAssign}
          onManageTasks={onManageTasks}
        />
      )}
      {item.status === 'planned' && canCancel && (
        <Button variant="outline" size="sm" onClick={() => onCancel(item.id)} className="w-full sm:w-auto">
          <XCircle className="h-4 w-4" /> ยกเลิกงาน
        </Button>
      )}
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

export default function PlanningCalendarPage() {
  const { user } = useAuthContext()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [activeTypes, setActiveTypes] = useState<PlanningItemType[]>(['team_plan', 'monthly_plan', 'large_work'])
  const [activeTab, setActiveTab] = useState<PlanningTab>('calendar')
  const [teamPlanDialogOpen, setTeamPlanDialogOpen] = useState(false)
  const [largeWorkDialogOpen, setLargeWorkDialogOpen] = useState(false)
  const [editingTeamPlan, setEditingTeamPlan] = useState<TeamPlanResponse | null>(null)
  const [editingLargeWork, setEditingLargeWork] = useState<LargeWorkResponse | null>(null)
  const [expandedLargeWorkId, setExpandedLargeWorkId] = useState<number | null>(null)
  const [taskDialogId, setTaskDialogId] = useState<number | null>(null)

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
  const cancelTeamPlan = useCancelTeamPlan()
  const removeTeamPlan = useRemoveTeamPlan()
  const cancelLargeWork = useCancelLargeWork()

  const filteredItems = useMemo(() => {
    if (!calendarQuery.data?.items) return []
    return calendarQuery.data.items.filter((item) => activeTypes.includes(item.type))
  }, [calendarQuery.data?.items, activeTypes])

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

  const handleToggleType = useCallback((type: PlanningItemType) => {
    setActiveTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }, [])

  const canCreateTeam = canCreateTeamPlan(user?.role, user?.teamId != null)
  const canCreateLarge = canCreateLargeWork(user?.role, user?.teamId != null)
  const activePlanDays = itemsByDate.size
  const teamPlanCount = teamPlansQuery.data?.length ?? 0
  const largeWorkCount = largeWorksQuery.data?.length ?? 0

  if (!canViewPlanningCalendar(user?.role)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-stone-500">
        <CalendarDays className="mb-3 h-12 w-12 text-stone-300" />
        <p className="text-sm">ไม่มีสิทธิ์เข้าถึง</p>
      </div>
    )
  }

  return (
    <div className="relative mx-auto max-w-5xl space-y-4 overflow-hidden pb-24 md:pb-8">
      <div className="pointer-events-none absolute -right-28 top-8 h-56 w-56 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-28 top-56 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl" />

      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-gradient-to-br from-emerald-950 via-emerald-800 to-stone-900 p-4 text-white shadow-2xl shadow-emerald-950/25 sm:p-5">
        <div className="absolute -right-14 -top-14 h-44 w-44 rounded-full bg-amber-300/20 blur-2xl" />
        <div className="absolute bottom-0 right-0 h-24 w-40 rounded-tl-full bg-emerald-400/15" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-50 backdrop-blur">
              <CalendarDays className="h-3.5 w-3.5 text-amber-300" />
              ศูนย์ควบคุมแผนงาน
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                ปฏิทินแผนงาน
              </h1>
              <p className="mt-1 max-w-xl text-sm leading-6 text-emerald-50/80">
                รวมแผนเดือน แผนทีม และงานระดมทีมในมุมมองเดียว — ดูได้ทันทีว่าวันนี้ทีมต้องไปไหน
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              calendarQuery.refetch()
              teamPlansQuery.refetch()
              largeWorksQuery.refetch()
            }}
            className="min-h-11 border-white/20 bg-white/10 text-white shadow-lg shadow-black/10 backdrop-blur hover:bg-white/20 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" /> รีเฟรช
          </Button>
        </div>

        <div className="relative mt-5 grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur">
            <p className="text-[11px] font-semibold text-emerald-50/70">แผนทั้งหมด</p>
            <p className="mt-1 text-2xl font-black text-white">{filteredItems.length}</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur">
            <p className="text-[11px] font-semibold text-emerald-50/70">วันที่มีงาน</p>
            <p className="mt-1 text-2xl font-black text-amber-200">{activePlanDays}</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur">
            <p className="text-[11px] font-semibold text-emerald-50/70">งานระดมทีม</p>
            <p className="mt-1 text-2xl font-black text-white">{largeWorkCount}</p>
          </div>
        </div>
      </div>

      <div className="relative grid grid-cols-2 gap-1 rounded-2xl border border-white/70 bg-white/75 p-1 shadow-lg shadow-emerald-900/5 ring-1 ring-emerald-100/70 backdrop-blur sm:grid-cols-4 sm:gap-2">
        {([
          ['calendar', 'ปฏิทิน'],
          ['team-plan', 'แผนทีม'],
          ['large-work', 'งานระดมทีม'],
          ['worker-todos', 'คิวงานฉัน'],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setActiveTab(value)}
            className={cn(
              'min-h-11 rounded-xl px-2 py-2.5 text-xs font-bold transition-all whitespace-nowrap sm:text-sm',
              activeTab === value ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-600/25' : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'calendar' && (
        <div className="relative space-y-3 rounded-[1.75rem] border border-white/80 bg-white/65 p-3 shadow-xl shadow-emerald-900/10 backdrop-blur sm:space-y-4 sm:p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
            <CalendarMonthSelector year={year} month={month} onChange={handleMonthChange} />
            <div className="grid grid-cols-2 gap-2 lg:w-[240px]">
              <div className="rounded-2xl border border-emerald-100 bg-white/80 p-3 shadow-sm">
                <p className="text-[11px] font-semibold text-gray-500">แผนทีม</p>
                <p className="text-xl font-black text-emerald-700">{teamPlanCount}</p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-white/80 p-3 shadow-sm">
                <p className="text-[11px] font-semibold text-gray-500">รวมวัน</p>
                <p className="text-xl font-black text-amber-600">{activePlanDays}</p>
              </div>
            </div>
          </div>
          <CalendarFilterBar activeTypes={activeTypes} onToggleType={handleToggleType} />
          {calendarQuery.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
            </div>
          ) : calendarQuery.error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
              ไม่สามารถโหลดข้อมูลได้
            </div>
          ) : (
            <CalendarGrid year={year} month={month} itemsByDate={itemsByDate} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          )}
          <DayDetailDrawer dateKey={selectedDate} items={selectedItems} onClose={() => setSelectedDate(null)} />
        </div>
      )}

      {activeTab === 'team-plan' && (
        <div className="space-y-4">
          <SectionHeader
            icon={<ClipboardList className="h-5 w-5" />}
            title="แผนงานทีม"
            description="เพิ่ม แก้ไข ยกเลิก หรือลบแผนงานของทีมตามสิทธิ์ผู้ใช้"
            action={canCreateTeam && (
              <Button onClick={() => { setEditingTeamPlan(null); setTeamPlanDialogOpen(true) }} className="bg-emerald-600 text-white hover:bg-emerald-700">
                <Plus className="h-4 w-4" /> เพิ่มแผนทีม
              </Button>
            )}
          />
          {teamPlansQuery.isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-emerald-500" /></div>
          ) : teamPlansQuery.error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">ไม่สามารถโหลดแผนทีมได้</div>
          ) : teamPlansQuery.data?.length ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {teamPlansQuery.data.map((plan) => (
                <TeamPlanCard
                  key={plan.id}
                  plan={plan}
                  teams={teams}
                  canEdit={plan.actions?.canEdit || canEditTeamPlan(user?.role, user?.id, plan.createdByUserId)}
                  canDelete={plan.actions?.canDelete || canDeleteTeamPlan(user?.role, user?.teamId, plan.teamId)}
                  onEdit={(nextPlan) => { setEditingTeamPlan(nextPlan); setTeamPlanDialogOpen(true) }}
                  onCancel={(id) => {
                    if (window.confirm('ยืนยันยกเลิกแผนทีมนี้?')) cancelTeamPlan.mutate(id)
                  }}
                  onRemove={(id) => {
                    if (window.confirm('ยืนยันลบแผนทีมนี้?')) removeTeamPlan.mutate(id)
                  }}
                />
              ))}
            </div>
          ) : (
            <EmptyState title="ยังไม่มีแผนทีมในเดือนนี้" description="เพิ่มแผนทีมเพื่อแสดงบนปฏิทินและใช้เป็นแหล่ง prefill รายงานประจำวัน" />
          )}
        </div>
      )}

      {activeTab === 'large-work' && (
        <div className="space-y-4">
          <SectionHeader
            icon={<Users className="h-5 w-5" />}
            title="งานระดมทีม"
            description="วางแผนงานใหญ่ที่มีทีมเจ้าของและทีมร่วมหลายทีม พร้อมเชื่อมกลับปฏิทิน"
            action={canCreateLarge && (
              <Button onClick={() => { setEditingLargeWork(null); setLargeWorkDialogOpen(true) }} className="bg-amber-600 text-white hover:bg-amber-700">
                <Plus className="h-4 w-4" /> เพิ่มงานระดมทีม
              </Button>
            )}
          />
          {largeWorksQuery.isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-emerald-500" /></div>
          ) : largeWorksQuery.error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">ไม่สามารถโหลดงานระดมทีมได้</div>
          ) : largeWorksQuery.data?.length ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {largeWorksQuery.data.map((item) => {
                const owner = item.teams.find((team) => team.role === 'owner')
                const ownerTeamId = owner?.id ?? item.ownerTeamId
                const roleCanEditLargeWork = canEditLargeWork(user?.role, user?.id, item.createdByUserId, user?.teamId, ownerTeamId)
                const roleCanCancelLargeWork = canManageTeamLargeWork(user?.role, user?.teamId, ownerTeamId)
                const roleCanAssign = canAssignLargeWorkTasks(user?.role, user?.teamId, ownerTeamId)
                const canEditItem = roleCanEditLargeWork && (item.actions?.canEdit ?? true)
                const canCancelItem = roleCanCancelLargeWork && (item.actions?.canCancel ?? true)
                return (
                  <LargeWorkCard
                    key={item.id}
                    item={item}
                    teams={teams}
                    canEdit={canEditItem}
                    canCancel={canCancelItem}
                    canAssign={roleCanAssign}
                    expanded={expandedLargeWorkId === item.id}
                    onEdit={(nextItem) => { setEditingLargeWork(nextItem); setLargeWorkDialogOpen(true) }}
                    onCancel={(id) => {
                      if (window.confirm('ยืนยันยกเลิกงานระดมทีมนี้?')) cancelLargeWork.mutate(id)
                    }}
                    onToggleExpand={() => setExpandedLargeWorkId((prev) => prev === item.id ? null : item.id)}
                    onManageTasks={() => setTaskDialogId(item.id)}
                  />
                )
              })}
            </div>
          ) : (
            <EmptyState title="ยังไม่มีงานระดมทีมในเดือนนี้" description="สร้างงานระดมทีมเมื่อมีงานใหญ่ที่ต้องใช้หลายทีมร่วมกัน" />
          )}
        </div>
      )}

      {activeTab === 'worker-todos' && (
        <div className="space-y-4">
          <SectionHeader
            icon={<ClipboardList className="h-5 w-5" />}
            title="คิวงานระดมทีมของฉัน"
            description="ทีมผู้รับมอบหมายทำงานทีละจุด: เริ่มงาน บันทึกรูปก่อน/หลัง และบันทึกผลโดยไม่แก้แผนหลัก"
          />
          <WorkerTodoQueue />
        </div>
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
      />
      {taskDialogId != null && (
        <LargeWorkTasksDialog
          id={taskDialogId}
          teams={teams}
          open={taskDialogId != null}
          onClose={() => setTaskDialogId(null)}
        />
      )}
    </div>
  )
}
