import { canCreateTeamPlan } from './auth/role-policy'
import type { UserRole } from '../types/auth'
import type { PlanningCalendarItem, PlanningItemType } from '../types/planning-calendar'

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

export function canAddPlanningWork(role: UserRole | null | undefined, hasTeam: boolean): boolean {
  return canCreateTeamPlan(role, hasTeam)
}
