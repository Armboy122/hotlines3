import { canCreateTeamPlan } from './auth/role-policy'
import type { UserRole } from '../types/auth'
import { expandDateKeys } from '../types/planning-calendar'
import type { PlanningCalendarItem, PlanningItemType } from '../types/planning-calendar'
import type { TeamPlanRequest, TeamPlanResponse, TeamPlanStatus, UpdateTeamPlanRequest } from '../types/team-plan'

export type PlanningStatusFilter = 'all' | 'not_started' | 'planned' | 'in_progress' | 'completed' | 'cancelled'
export type NormalizedPlanningStatus = Exclude<PlanningStatusFilter, 'all'>
export type PlanningSourceFilter = 'all' | PlanningItemType
export type PlanningTeamScope = {
  role: UserRole | string | null | undefined
  teamId: number | null | undefined
}

export const planningStatusFilterOptions: readonly { value: PlanningStatusFilter; label: string }[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'not_started', label: 'รอวางแผน' },
  { value: 'planned', label: 'กำหนดวันแล้ว' },
  { value: 'in_progress', label: 'กำลังทำ' },
  { value: 'completed', label: 'เสร็จแล้ว' },
  { value: 'cancelled', label: 'ยกเลิก' },
]

export function normalizePlanningStatus(status: string): NormalizedPlanningStatus {
  if (status === 'planned') return 'planned'
  if (status === 'in_progress') return 'in_progress'
  if (status === 'completed') return 'completed'
  if (status === 'cancelled') return 'cancelled'
  return 'not_started'
}

export function planningStatusLabel(status: string): string {
  const normalized = normalizePlanningStatus(status)
  if (normalized === 'planned') return 'กำหนดวันแล้ว'
  if (normalized === 'in_progress') return 'กำลังทำ'
  if (normalized === 'completed') return 'เสร็จแล้ว'
  if (normalized === 'cancelled') return 'ยกเลิก'
  return 'รอวางแผน'
}

export function statusBadgeClass(status: string): string {
  switch (normalizePlanningStatus(status)) {
    case 'planned':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    case 'in_progress':
      return 'border-amber-200 bg-amber-50 text-amber-700'
    case 'completed':
      return 'border-slate-200 bg-slate-50 text-slate-700'
    case 'cancelled':
      return 'border-red-200 bg-red-50 text-red-600'
    case 'not_started':
      return 'border-gray-200 bg-gray-50 text-gray-700'
  }
}

export function filterPlanningItems(
  items: PlanningCalendarItem[],
  filters: {
    sourceFilter: PlanningSourceFilter
    statusFilter: PlanningStatusFilter
    teamScope?: PlanningTeamScope
  },
): PlanningCalendarItem[] {
  return items.filter((item) => {
    const sourceMatches = filters.sourceFilter === 'all' || item.type === filters.sourceFilter
    const statusMatches = filters.statusFilter === 'all' || normalizePlanningStatus(item.status) === filters.statusFilter
    const teamMatches = isPlanningItemVisibleForTeamScope(item, filters.teamScope)
    return sourceMatches && statusMatches && teamMatches
  })
}

export function isPlanningItemVisibleForTeamScope(
  item: PlanningCalendarItem,
  scope?: PlanningTeamScope,
): boolean {
  if (!scope) return true
  if (scope.role === 'super_admin' || scope.role === 'viewer') return true
  if ((scope.role === 'team_lead' || scope.role === 'user') && scope.teamId != null) {
    return item.teamIds.includes(scope.teamId)
  }
  return false
}

export type PlanningCardAction = {
  id: 'view' | 'edit' | 'delete' | 'schedule'
  label: string
  href?: string
  disabled?: boolean
  disabledReason?: string
}

export function getPlanningCardActions(item: PlanningCalendarItem): PlanningCardAction[] {
  const actions: PlanningCardAction[] = []

  if (item.actions.canView !== false && item.type !== 'team_plan' && item.source.route) {
    actions.push({ id: 'view', label: 'ดูรายละเอียด', href: item.source.route })
  }

  if (item.actions.canEdit && item.type !== 'monthly_plan') {
    actions.push({ id: 'edit', label: 'แก้ไข' })
  }

  if (item.actions.canCancel && (item.type === 'team_plan' || item.type === 'large_work')) {
    actions.push({ id: 'delete', label: 'ลบงาน' })
  }

  if (normalizePlanningStatus(item.status) === 'not_started' && item.actions.canEdit) {
    actions.push({
      id: 'schedule',
      label: 'กำหนดวันใน Calendar',
      disabled: true,
      disabledReason: 'ยังไม่มีหน้าจอย้ายงานเข้าปฏิทินโดยตรง',
    })
  }

  return actions
}

export type TeamPlanEditFormState = Omit<TeamPlanRequest, 'teamId' | 'startDate' | 'endDate' | 'peaId' | 'operationCenterId' | 'feederId' | 'stationId'> & {
  teamId: string
  startDate: string
  endDate: string
  jobTypeId: string
  jobDetailId: string
  feederId: string
}

export const TEAM_PLAN_DATE_RANGE_ERROR = 'วันที่สิ้นสุดต้องไม่อยู่ก่อนวันที่เริ่ม'
export const TEAM_PLAN_DATE_CLEAR_ERROR = 'ไม่สามารถล้างวันที่ของแผนที่กำหนดวันแล้วได้'

function textOrEmpty(value: string | null | undefined): string {
  return value ?? ''
}

function nullableText(value: string | null | undefined): string | null {
  const trimmed = (value ?? '').trim()
  return trimmed.length > 0 ? trimmed : null
}

function nullableNumber(value: string | null | undefined): number | null {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

export function mapTeamPlanToEditForm(plan: TeamPlanResponse): TeamPlanEditFormState {
  return {
    teamId: String(plan.teamId),
    jobTypeId: '',
    jobDetailId: '',
    title: plan.title,
    workType: textOrEmpty(plan.workType),
    startDate: textOrEmpty(plan.startDate),
    endDate: textOrEmpty(plan.endDate),
    workTime: textOrEmpty(plan.workTime),
    feederId: plan.feederId ? String(plan.feederId) : '',
    locationText: plan.locationText,
    notes: textOrEmpty(plan.notes),
  }
}

export function defaultTeamPlanEditForm(teamId?: number | null): TeamPlanEditFormState {
  return {
    teamId: teamId ? String(teamId) : '',
    jobTypeId: '',
    jobDetailId: '',
    title: '',
    workType: '',
    startDate: '',
    endDate: '',
    workTime: '',
    feederId: '',
    locationText: '',
    notes: '',
  }
}

export function validateTeamPlanEditDates(
  form: Pick<TeamPlanEditFormState, 'startDate' | 'endDate'>,
  existingPlan?: Pick<TeamPlanResponse, 'startDate' | 'endDate'> | null,
): string | null {
  const startDate = nullableText(form.startDate)
  const endDate = nullableText(form.endDate)
  const wasScheduled = Boolean(existingPlan?.startDate)
  const clearsExistingDate = wasScheduled && (!startDate || (Boolean(existingPlan?.endDate) && !endDate))

  if (clearsExistingDate) return TEAM_PLAN_DATE_CLEAR_ERROR
  if (startDate && endDate && endDate < startDate) return TEAM_PLAN_DATE_RANGE_ERROR
  return null
}

export function buildTeamPlanEditPayload(
  existingPlan: TeamPlanResponse,
  form: TeamPlanEditFormState,
): UpdateTeamPlanRequest {
  const startDate = nullableText(form.startDate)
  const status: TeamPlanStatus = existingPlan.status === 'draft' || existingPlan.status === 'planned'
    ? startDate ? 'planned' : 'draft'
    : existingPlan.status

  return {
    teamId: nullableNumber(form.teamId) ?? existingPlan.teamId,
    title: nullableText(form.title) ?? existingPlan.title,
    workType: nullableText(form.workType) ?? existingPlan.workType ?? null,
    startDate,
    endDate: startDate ? nullableText(form.endDate) : null,
    workTime: nullableText(form.workTime),
    locationText: nullableText(form.locationText) ?? existingPlan.locationText,
    peaId: existingPlan.peaId ?? null,
    operationCenterId: existingPlan.operationCenterId ?? null,
    feederId: nullableNumber(form.feederId) ?? existingPlan.feederId ?? null,
    stationId: existingPlan.stationId ?? null,
    notes: nullableText(form.notes) ?? existingPlan.notes ?? null,
    status,
  }
}

type TeamPlanDialogSubmitFeeder = {
  id: number
  station?: {
    id: number
    operationCenter?: { id: number } | null
  } | null
}

type TeamPlanDialogSubmitArgs = {
  form: TeamPlanEditFormState
  selectedJobTypeName?: string | null
  selectedJobDetailName?: string | null
  selectedFeeder?: TeamPlanDialogSubmitFeeder | null
}

export function buildTeamPlanDialogSubmitPayload(args: TeamPlanDialogSubmitArgs & { plan: TeamPlanResponse }): UpdateTeamPlanRequest
export function buildTeamPlanDialogSubmitPayload(args: TeamPlanDialogSubmitArgs & { plan?: null }): TeamPlanRequest
export function buildTeamPlanDialogSubmitPayload(
  args: TeamPlanDialogSubmitArgs & { plan?: TeamPlanResponse | null },
): TeamPlanRequest | UpdateTeamPlanRequest {
  const { form, plan, selectedFeeder, selectedJobDetailName, selectedJobTypeName } = args

  if (plan) {
    const payload = buildTeamPlanEditPayload(plan, form)
    const selectedFeederId = nullableNumber(form.feederId)
    if (selectedFeeder && selectedFeederId === selectedFeeder.id) {
      return {
        ...payload,
        feederId: selectedFeeder.id,
        ...(selectedFeeder.station
          ? {
              stationId: selectedFeeder.station.id,
              operationCenterId: selectedFeeder.station.operationCenter?.id ?? null,
            }
          : {}),
      }
    }
    return payload
  }

  const title = nullableText(form.title) ?? nullableText(selectedJobDetailName) ?? nullableText(selectedJobTypeName) ?? 'งานรอวางแผน'
  const locationText = nullableText(form.locationText) ?? 'รอระบุพื้นที่'
  const startDate = nullableText(form.startDate)

  return {
    teamId: Number(form.teamId),
    title,
    workType: nullableText(form.workType) ?? nullableText(selectedJobTypeName),
    startDate,
    endDate: startDate ? nullableText(form.endDate) : null,
    workTime: nullableText(form.workTime),
    locationText,
    operationCenterId: selectedFeeder?.station?.operationCenter?.id ?? null,
    feederId: nullableNumber(form.feederId),
    stationId: selectedFeeder?.station?.id ?? null,
    notes: nullableText(form.notes),
  }
}

export function mapTeamPlanToPlanningItem(plan: TeamPlanResponse): PlanningCalendarItem {
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
      peaId: plan.peaId ?? null,
      peaName: null,
      operationCenterId: plan.operationCenterId ?? null,
      operationCenterName: null,
      feederId: plan.feederId ?? null,
      feederCode: null,
      stationId: plan.stationId ?? null,
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

export function canAddPlanningWork(role: UserRole | null | undefined, hasTeam: boolean): boolean {
  return canCreateTeamPlan(role, hasTeam)
}
