'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Trash2,
  Users,
  Zap,
} from 'lucide-react'
import { useAuthContext } from '@/lib/auth/auth-context'
import {
  useFeeders,
  useJobDetails,
  useJobTypes,
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
  useCancelLargeWork,
  useCreateLargeWork,
  useUpdateLargeWork,
} from '@/hooks/mutations/useLargeWorkMutations'
import {
  canViewPlanningCalendar,
  isSuperAdmin,
} from '@/lib/auth/role-policy'
import {
  buildTeamPlanDialogSubmitPayload,
  canAddPlanningWork as canUserAddPlanningWork,
  defaultTeamPlanEditForm,
  filterPlanningItems,
  getPlanningCardActions,
  mapTeamPlanToEditForm,
  mapTeamPlanToPlanningItem,
  normalizePlanningStatus,
  planningStatusFilterOptions,
  planningStatusLabel,
  statusBadgeClass,
  validateTeamPlanEditDates,
} from '@/lib/planning-ui'
import type { PlanningSourceFilter, PlanningStatusFilter, TeamPlanEditFormState } from '@/lib/planning-ui'
import { groupItemsByDateKey } from '@/types/planning-calendar'
import type { PlanningCalendarItem } from '@/types/planning-calendar'
import type { FeederWithStation, JobDetailWithCount, JobTypeWithCount, Team } from '@/types/query-types'
import type { TeamPlanResponse } from '@/types/team-plan'
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
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { cn } from '@/lib/utils'

type PlanningTab = 'calendar' | 'board'
type TeamPlanFormState = TeamPlanEditFormState
type LargeWorkFormState = Omit<LargeWorkRequest, 'ownerTeamId' | 'participantTeamIds'> & {
  ownerTeamId: string
  participantTeamIds: string[]
}

const SMART_SELECT_CLASS =
  'min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500'

const SMART_INLINE_ACTION_CLASS =
  'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2'

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

function feederOptionLabel(feeder: FeederWithStation): string {
  const stationName = feeder.station?.name
  return stationName ? `${feeder.code} - ${stationName}` : feeder.code
}

function feederLocationText(feeder?: FeederWithStation): string {
  if (!feeder) return ''
  const parts = [
    feeder.station?.name,
    feeder.code,
    feeder.station?.operationCenter?.name,
  ].filter(Boolean)
  return parts.join(' / ')
}

function formatRange(startDate?: string | null, endDate?: string | null): string {
  if (!startDate) return 'รอวางแผน'
  if (!endDate || endDate === startDate) return startDate
  return `${startDate} ถึง ${endDate}`
}

function PlanningFormSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white text-blue-700 ring-1 ring-slate-200">
          {icon}
        </span>
        {title}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  )
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
  jobTypes,
  jobDetails,
  feeders,
  currentTeamId,
  onClose,
}: {
  open: boolean
  plan: TeamPlanResponse | null
  teams?: Team[]
  jobTypes?: JobTypeWithCount[]
  jobDetails?: JobDetailWithCount[]
  feeders?: FeederWithStation[]
  currentTeamId?: number | null
  onClose: () => void
}) {
  const [form, setForm] = useState<TeamPlanFormState>(() => defaultTeamPlanEditForm(currentTeamId))
  const [formError, setFormError] = useState<string | null>(null)
  const createPlan = useCreateTeamPlan()
  const updatePlan = useUpdateTeamPlan()
  const canSelectAnyTeam = isSuperAdmin(useAuthContext().user?.role)
  const visibleTeams = useMemo(
    () => (canSelectAnyTeam ? teams : teams?.filter((team) => team.id === currentTeamId)),
    [canSelectAnyTeam, teams, currentTeamId],
  )
  const selectedJobType = useMemo(
    () => jobTypes?.find((jobType) => String(jobType.id) === form.jobTypeId),
    [form.jobTypeId, jobTypes],
  )
  const selectedJobDetail = useMemo(
    () => jobDetails?.find((jobDetail) => String(jobDetail.id) === form.jobDetailId),
    [form.jobDetailId, jobDetails],
  )
  const selectedFeeder = useMemo(
    () => feeders?.find((feeder) => String(feeder.id) === form.feederId),
    [feeders, form.feederId],
  )
  const filteredJobDetails = useMemo(() => {
    if (!form.jobTypeId) return jobDetails ?? []
    const jobTypeId = Number(form.jobTypeId)
    return (jobDetails ?? []).filter((jobDetail) => !jobDetail.jobTypeId || jobDetail.jobTypeId === jobTypeId)
  }, [form.jobTypeId, jobDetails])

  useEffect(() => {
    if (plan) {
      setForm(mapTeamPlanToEditForm(plan))
    } else {
      setForm(defaultTeamPlanEditForm(currentTeamId))
    }
    setFormError(null)
  }, [plan, currentTeamId, open])

  const isSaving = createPlan.isPending || updatePlan.isPending
  const isValid = Boolean(form.teamId)

  const handleJobTypeChange = (value: string) => {
    const nextJobType = jobTypes?.find((jobType) => String(jobType.id) === value)
    setForm((prev) => ({
      ...prev,
      jobTypeId: value,
      jobDetailId: '',
      workType: nextJobType?.name ?? '',
    }))
  }

  const handleJobDetailChange = (value: string) => {
    const nextJobDetail = jobDetails?.find((jobDetail) => String(jobDetail.id) === value)
    setForm((prev) => ({
      ...prev,
      jobDetailId: value,
      title: nextJobDetail?.name ?? prev.title,
    }))
  }

  const handleFeederChange = (value: string) => {
    const nextFeeder = feeders?.find((feeder) => String(feeder.id) === value)
    setForm((prev) => ({
      ...prev,
      feederId: value,
      locationText: prev.locationText.trim() ? prev.locationText : feederLocationText(nextFeeder),
    }))
  }

  const handleSubmit = () => {
    if (!isValid) return
    const validationError = validateTeamPlanEditDates(form, plan)
    if (validationError) {
      setFormError(validationError)
      return
    }
    setFormError(null)

    const submitForm = {
      ...form,
      locationText: form.locationText.trim() || feederLocationText(selectedFeeder),
    }

    if (plan) {
      const updatePayload = buildTeamPlanDialogSubmitPayload({
        plan,
        form: submitForm,
        selectedFeeder,
      })
      updatePlan.mutate(
        { id: plan.id, data: updatePayload },
        { onSuccess: onClose },
      )
    } else {
      const payload = buildTeamPlanDialogSubmitPayload({
        plan: null,
        form: submitForm,
        selectedJobTypeName: selectedJobType?.name,
        selectedJobDetailName: selectedJobDetail?.name,
        selectedFeeder,
      })
      createPlan.mutate(payload, { onSuccess: onClose })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{plan ? 'แก้ไขงานแผนทีม' : 'เพิ่มงาน'}</DialogTitle>
          <DialogDescription>
            ข้อมูลหน้างานสำหรับเก็บในแผนทีม
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <PlanningFormSection icon={<CalendarDays className="h-4 w-4" />} title="ข้อมูลพื้นฐาน">
            <Field label="ทีม" required>
              <select
                aria-label="ทีม"
                name="teamId"
              value={form.teamId}
              onChange={(event) => setForm((prev) => ({ ...prev, teamId: event.target.value }))}
              disabled={!canSelectAnyTeam}
                className={SMART_SELECT_CLASS}
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
            <Field label="เวลา">
              <Input name="workTime" value={form.workTime ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, workTime: e.target.value }))} placeholder="08:30-16:30" />
            </Field>
            <Field label="วันที่เริ่ม">
              <Input name="startDate" type="date" value={form.startDate} onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))} />
              <p className="text-xs text-gray-500">เว้นว่างได้ งานจะอยู่ในบอร์ด “รอวางแผน”</p>
            </Field>
            <Field label="วันที่สิ้นสุด">
              <Input name="endDate" type="date" value={form.endDate ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))} disabled={!form.startDate} />
            </Field>
          </PlanningFormSection>

          {formError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700" role="alert">
              {formError}
            </div>
          )}

          <PlanningFormSection icon={<BriefcaseBusiness className="h-4 w-4" />} title="ประเภทงาน">
            <Field label="ประเภทงาน">
              <select
                aria-label="ประเภทงาน"
              name="jobTypeId"
              value={form.jobTypeId}
              onChange={(event) => handleJobTypeChange(event.target.value)}
                className={SMART_SELECT_CLASS}
              >
                <option value="">ไม่เลือก</option>
                {jobTypes?.map((jobType) => (
                  <option key={jobType.id} value={jobType.id}>{jobType.name}</option>
                ))}
              </select>
            </Field>
            <Field label="รายละเอียดงาน">
              <select
                aria-label="รายละเอียดงาน"
              name="jobDetailId"
              value={form.jobDetailId}
              onChange={(event) => handleJobDetailChange(event.target.value)}
                className={SMART_SELECT_CLASS}
              >
                <option value="">ไม่เลือก</option>
                {filteredJobDetails.map((jobDetail) => (
                  <option key={jobDetail.id} value={jobDetail.id}>{jobDetail.name}</option>
                ))}
              </select>
            </Field>
            <Field label="หัวข้องาน" className="sm:col-span-2">
              <Input name="title" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="ระบุเอง หรือเลือกจากรายละเอียดงานด้านบน" />
            </Field>
          </PlanningFormSection>

          <PlanningFormSection icon={<Zap className="h-4 w-4" />} title="ข้อมูลสถานที่">
            <Field label="ฟีดเดอร์">
              <select
                aria-label="ฟีดเดอร์"
              name="feederId"
              value={form.feederId}
              onChange={(event) => handleFeederChange(event.target.value)}
                className={SMART_SELECT_CLASS}
              >
                <option value="">ไม่เลือก</option>
                {feeders?.map((feeder) => (
                  <option key={feeder.id} value={feeder.id}>{feederOptionLabel(feeder)}</option>
                ))}
              </select>
            </Field>
            <Field label="พื้นที่/จุดปฏิบัติงาน">
              <Input name="locationText" value={form.locationText} onChange={(e) => setForm((prev) => ({ ...prev, locationText: e.target.value }))} placeholder="สถานี/ฟีดเดอร์/พื้นที่" />
            </Field>
          </PlanningFormSection>

          <PlanningFormSection icon={<FileText className="h-4 w-4" />} title="รายละเอียดเพิ่มเติม">
            <Field label="หมายเหตุ" className="sm:col-span-2">
              <Textarea value={form.notes ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} placeholder="รายละเอียดเพิ่มเติม" />
            </Field>
          </PlanningFormSection>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>ยกเลิก</Button>
          <Button onClick={handleSubmit} disabled={!isValid || isSaving}>
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
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white sm:max-w-2xl">
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
              className={SMART_SELECT_CLASS}
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
                      checked ? 'border-sky-200 bg-sky-50 text-blue-800' : 'border-white/70 bg-white/75 text-slate-700',
                      isOwner && 'opacity-60',
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked && !isOwner}
                      disabled={isOwner}
                      onChange={() => handleToggleParticipant(team.id)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600"
                    />
                    {team.name}
                    {isOwner && <span className="ml-auto text-[10px] text-blue-600">เจ้าของ</span>}
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
          <Button onClick={handleSubmit} disabled={!isValid || isSaving}>
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
      <label className="text-sm font-semibold text-slate-700">
        {label}{required && <span className="text-red-500"> *</span>}
      </label>
      {children}
    </div>
  )
}

function Meta({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <span className="text-blue-500">{icon}</span>
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
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
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
    ? 'border-teal-200 bg-teal-50 text-teal-700'
    : item.type === 'large_work'
      ? 'border-blue-200 bg-blue-50 text-blue-700'
      : 'border-sky-200 bg-sky-50 text-sky-800'
  const actions = getPlanningCardActions(item)

  return (
    <article className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-4">
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
                  className={SMART_INLINE_ACTION_CLASS}
                >
                  <FileText className="h-4 w-4" />
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
                  className={cn(SMART_INLINE_ACTION_CLASS, 'text-slate-700')}
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
                  className="inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-xl border border-slate-200 bg-white/50 px-3 text-sm font-semibold text-slate-500"
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
    <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 lg:sticky lg:top-20 lg:self-start">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-950">{title}</h2>
          <p className="text-sm text-slate-600">{subtitle}</p>
        </div>
      </div>
      {isLoading ? (
        <div className="space-y-3" aria-label="กำลังโหลดรายการงาน">
          {[0, 1, 2].map((item) => (
            <div key={item} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 h-5 w-2/3 animate-pulse rounded-full bg-sky-100" />
              <div className="h-4 w-full animate-pulse rounded-full bg-sky-100" />
              <div className="mt-2 h-4 w-3/4 animate-pulse rounded-full bg-sky-100" />
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

function PlanningFilterControls({
  sourceFilter,
  statusFilter,
  onSourceFilterChange,
  onStatusFilterChange,
  onToday,
}: {
  sourceFilter: PlanningSourceFilter
  statusFilter: PlanningStatusFilter
  onSourceFilterChange: (value: PlanningSourceFilter) => void
  onStatusFilterChange: (value: PlanningStatusFilter) => void
  onToday: () => void
}) {
  const appliedCount = Number(sourceFilter !== 'all') + Number(statusFilter !== 'all')
  const fields = (
    <>
      <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
        <span>แหล่งที่มา</span>
        <select name="sourceFilter" value={sourceFilter} onChange={(event) => onSourceFilterChange(event.target.value as PlanningSourceFilter)} className={SMART_SELECT_CLASS}>
          <option value="all">ทั้งหมด</option>
          <option value="team_plan">งานแผนของทีม</option>
          <option value="monthly_plan">งานจากแผนรายเดือน</option>
          <option value="large_work">งานระดมทีม</option>
        </select>
      </label>
      <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
        <span>สถานะ</span>
        <select name="statusFilter" value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value as PlanningStatusFilter)} className={SMART_SELECT_CLASS}>
          {planningStatusFilterOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
    </>
  )

  return (
    <>
      <div className="hidden items-end gap-3 md:grid md:grid-cols-[minmax(10rem,1fr)_minmax(10rem,1fr)_auto]">
        {fields}
        <Button type="button" variant="outline" onClick={onToday} className="min-h-11 border-slate-300 bg-white text-slate-700 hover:bg-slate-50">
          วันนี้
        </Button>
      </div>
      <div className="flex items-center gap-2 md:hidden">
        <Drawer>
          <DrawerTrigger asChild>
            <Button type="button" variant="outline" className="min-h-11 flex-1 border-slate-300 bg-white text-slate-700 hover:bg-slate-50">
              <SlidersHorizontal className="h-4 w-4" />
              ตัวกรอง{appliedCount > 0 ? ` (${appliedCount})` : ''}
            </Button>
          </DrawerTrigger>
          <DrawerContent className="border-slate-200 bg-white shadow-2xl">
            <DrawerHeader className="text-left">
              <DrawerTitle>ตัวกรองแผนงาน</DrawerTitle>
              <DrawerDescription>เลือกเฉพาะงานที่ต้องการติดตาม</DrawerDescription>
            </DrawerHeader>
            <div className="grid gap-4 overflow-y-auto px-4 pb-2">
              {fields}
            </div>
            <DrawerFooter>
              <Button type="button" variant="outline" onClick={onToday} className="min-h-11 border-slate-300">กลับไปวันนี้</Button>
              <DrawerClose asChild><Button type="button" className="min-h-11">ดูแผนงาน</Button></DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </>
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
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h2 className="text-lg font-bold text-slate-950">บอร์ดงาน</h2>
        <p className="text-sm text-slate-600">ใช้เก็บงานที่ยังไม่กำหนดวันเวลา และติดตามสถานะงานด้วยเลนหลัก 4 ช่อง</p>
      </div>
      <div className="grid gap-3 lg:grid-cols-4">
        {lanes.map((lane) => {
          const laneCards = cardsForLane(lane.id)
          return (
            <div key={lane.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">{lane.title}</h3>
                <span className="rounded-md bg-white px-2 py-1 text-sm font-medium text-slate-600 ring-1 ring-slate-200">{laneCards.length}</span>
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
                  <div className="rounded-xl border border-dashed border-sky-200 bg-white/70 px-3 py-6 text-center text-sm text-slate-500">ยังไม่มีงานในช่องนี้</div>
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
  const { data: jobTypes } = useJobTypes()
  const { data: jobDetails } = useJobDetails()
  const { data: feeders } = useFeeders()
  const calendarQuery = usePlanningCalendar(params)
  const teamPlansQuery = useTeamPlans(params)
  const teamPlanBacklogQuery = useTeamPlans({ status: 'draft', limit: 100 })
  const largeWorksQuery = useLargeWorks(params)
  const removeTeamPlan = useRemoveTeamPlan()
  const cancelLargeWork = useCancelLargeWork()
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
      .map(mapTeamPlanToPlanningItem)
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
    if (!item.actions.canCancel) return
    if (item.type === 'team_plan') {
      if (!window.confirm(`ยืนยันลบงาน “${item.title}” หรือไม่? งานนี้จะถูกนำออกจากแผนปฏิบัติงานและไม่สามารถย้อนกลับจากหน้าจอนี้ได้`)) return
      removeTeamPlan.mutate(item.sourceId, {
        onSuccess: () => {
          if (selectedDate && item.dateKeys.includes(selectedDate)) {
            setSelectedDate(null)
          }
        },
      })
      return
    }

    if (item.type === 'large_work') {
      if (!window.confirm(`ยืนยันลบงานระดมทีม “${item.title}” หรือไม่? ระบบจะยกเลิกงานนี้และนำออกจากแผนปฏิบัติงาน`)) return
      cancelLargeWork.mutate(item.sourceId, {
        onSuccess: () => {
          if (selectedDate && item.dateKeys.includes(selectedDate)) {
            setSelectedDate(null)
          }
        },
      })
    }
  }, [cancelLargeWork, removeTeamPlan, selectedDate])

  if (!canViewPlanningCalendar(user?.role)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-stone-500">
        <CalendarDays className="mb-3 h-12 w-12 text-stone-300" />
        <p className="text-sm">ไม่มีสิทธิ์เข้าถึง</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <header className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-[28px]">ระบบวางแผนงาน</h1>
          <p className="mt-1 text-sm text-slate-600">ดูแผนรายเดือน เลือกวัน และติดตามงานที่รอดำเนินการ</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {canAddPlanningWork ? (
            <Button onClick={() => { setEditingTeamPlan(null); setTeamPlanDialogOpen(true) }} className="min-h-11">
              <Plus className="h-4 w-4" /> เพิ่มงาน
            </Button>
          ) : user?.role === 'viewer' ? null : (
            <Button disabled className="min-h-11">
              <Plus className="h-4 w-4" /> เพิ่มงาน · ไม่มีสิทธิ์
            </Button>
          )}
          <Button
            variant="outline"
            aria-label="รีเฟรชข้อมูลแผนงาน"
            onClick={() => {
              calendarQuery.refetch()
              teamPlansQuery.refetch()
              teamPlanBacklogQuery.refetch()
              largeWorksQuery.refetch()
            }}
            className="min-h-11 border-slate-300 bg-white px-3 text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" /><span className="sr-only sm:not-sr-only">รีเฟรช</span>
          </Button>
        </div>
      </header>

      <section aria-label="เลือกเดือนและมุมมอง" className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <CalendarMonthSelector year={year} month={month} onChange={handleMonthChange} />
          <div className="hidden w-full grid-cols-2 gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 md:grid lg:w-auto lg:min-w-56">
        {([
          ['calendar', 'ปฏิทิน'],
          ['board', 'บอร์ด'],
        ] as const).map(([value, label]) => (
            <button
              type="button"
              key={value}
            onClick={() => setActiveTab(value)}
            className={cn(
              'min-h-11 rounded-md px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2',
              activeTab === value ? 'bg-white text-blue-800 shadow-sm' : 'text-slate-600 hover:bg-slate-50',
            )}
          >
            {label}
          </button>
        ))}
          </div>
        </div>
        <div className="hidden md:block">
          <PlanningFilterControls
            sourceFilter={sourceFilter}
            statusFilter={statusFilter}
            onSourceFilterChange={setSourceFilter}
            onStatusFilterChange={setStatusFilter}
            onToday={() => {
              const nowDate = new Date()
              setYear(nowDate.getFullYear())
              setMonth(nowDate.getMonth() + 1)
              setSelectedDate(todayKey())
            }}
          />
        </div>
      </section>

      {activeTab === 'calendar' && (
        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)]">
          <section aria-label="ปฏิทินแผนงาน" className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
            {calendarQuery.isLoading ? (
              <div className="grid gap-2">
                <div className="h-10 animate-pulse rounded-xl bg-sky-100" />
                <div className="h-[420px] animate-pulse rounded-2xl bg-sky-100" />
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
          <PlanningAgenda
            selectedDate={selectedDate}
            items={selectedDate ? selectedItems : filteredCalendarItems.slice(0, 8)}
            monthItemCount={filteredCalendarItems.length}
            isLoading={calendarQuery.isLoading}
            isError={Boolean(calendarQuery.error)}
            onEdit={handleEditPlanningItem}
            onDelete={handleDeletePlanningItem}
            isDeleting={removeTeamPlan.isPending || cancelLargeWork.isPending}
          />
        </div>
      )}

      {activeTab === 'board' && (
        calendarQuery.isLoading ? (
          <div className="grid gap-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((item) => <div key={item} className="h-72 animate-pulse rounded-2xl bg-sky-100" />)}
          </div>
        ) : calendarQuery.error ? (
          <PlanningStateMessage title="โหลดข้อมูลงานไม่สำเร็จ" description="กรุณากดลองใหม่เพื่อโหลดข้อมูลล่าสุด" />
        ) : (
          <PlanningBoardView
            items={boardItems}
            onEdit={handleEditPlanningItem}
            onDelete={handleDeletePlanningItem}
            isDeleting={removeTeamPlan.isPending || cancelLargeWork.isPending}
          />
        )
      )}

      <div className="grid grid-cols-2 gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 md:hidden">
        {([
          ['calendar', 'ปฏิทิน'],
          ['board', 'บอร์ด'],
        ] as const).map(([value, label]) => (
          <button
            type="button"
            key={`mobile-${value}`}
            onClick={() => setActiveTab(value)}
            className={cn(
              'min-h-11 rounded-md px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2',
              activeTab === value ? 'bg-white text-blue-800 shadow-sm' : 'text-slate-600 hover:bg-slate-50',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="md:hidden">
        <PlanningFilterControls
          sourceFilter={sourceFilter}
          statusFilter={statusFilter}
          onSourceFilterChange={setSourceFilter}
          onStatusFilterChange={setStatusFilter}
          onToday={() => {
            const nowDate = new Date()
            setYear(nowDate.getFullYear())
            setMonth(nowDate.getMonth() + 1)
            setSelectedDate(todayKey())
          }}
        />
      </div>

      {boardItems.length > 0 && (
        <section aria-label="สรุปแผนงาน" className="grid grid-cols-3 divide-x divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="p-3 text-center"><p className="text-xs text-slate-600">งานทั้งหมด</p><p className="mt-1 text-lg font-bold text-slate-950">{boardItems.length}</p></div>
          <div className="p-3 text-center"><p className="text-xs text-slate-600">วันที่มีงาน</p><p className="mt-1 text-lg font-bold text-slate-950">{activePlanDays}</p></div>
          <div className="p-3 text-center"><p className="text-xs text-slate-600">แผนทีม</p><p className="mt-1 text-lg font-bold text-slate-950">{teamPlanCount}</p></div>
        </section>
      )}

      <TeamPlanDialog
        open={teamPlanDialogOpen}
        plan={editingTeamPlan}
        teams={teams}
        jobTypes={jobTypes}
        jobDetails={jobDetails}
        feeders={feeders}
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
