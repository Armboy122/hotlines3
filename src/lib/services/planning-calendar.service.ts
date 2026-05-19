import { apiClient } from '@/lib/api-client'
import type {
  PlanningCalendarResponse,
  PlanningCalendarParams,
  PlanningCalendarItem,
  PlanningItemType,
} from '@/types/planning-calendar'

const DAILY_REPORT_SOURCE_TYPES = new Set<PlanningItemType>(['team_plan', 'large_work'])

type PlanningCalendarItemInput = {
  sourceType: PlanningItemType
  sourceId: number
  title: string
  team?: { id: number; name: string }
  teams?: Array<{ id: number; name: string }>
  workTime?: string | null
  location?: string
  status?: string
  dateRange?: { startDate: string; endDate?: string | null }
  dateKeys?: string[]
  actions?: {
    canEdit?: boolean
    canDelete?: boolean
    canCancel?: boolean
    canDownload?: boolean
    canStartDailyReport?: boolean
  }
}

type PlanningCalendarDaysResponse = {
  monthStart: string
  monthEnd: string
  days: Array<{
    date: string
    items: PlanningCalendarItemInput[]
  }>
}

type PlanningCalendarItemsResponse = {
  from: string
  to: string
  items: PlanningCalendarItemInput[]
  summary?: {
    total?: number
    byType?: Partial<Record<PlanningItemType, number>>
  }
}

export type PlanningCalendarApiResponse = PlanningCalendarDaysResponse | PlanningCalendarItemsResponse

function uniqueById<T extends { id: number }>(items: T[]): T[] {
  const seen = new Set<number>()
  return items.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

function parseYearMonth(dateKey: string): { year: number; month: number } {
  const [year, month] = dateKey.split('-').map(Number)
  return { year, month }
}

function itemRoute(type: PlanningItemType, sourceId: number): string {
  switch (type) {
    case 'team_plan':
      return `/planning?teamPlanId=${sourceId}`
    case 'monthly_plan':
      return '/monthly-plan'
    case 'large_work':
      return `/planning?largeWorkId=${sourceId}&view=operations`
  }
}

function expandDateKeys(startDate: string, endDate: string | null | undefined): string[] {
  const start = new Date(`${startDate}T00:00:00`)
  const end = endDate ? new Date(`${endDate}T00:00:00`) : start

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return []
  }

  const keys: string[] = []
  const current = new Date(start)
  while (current <= end) {
    const y = current.getFullYear()
    const m = String(current.getMonth() + 1).padStart(2, '0')
    const d = String(current.getDate()).padStart(2, '0')
    keys.push(`${y}-${m}-${d}`)
    current.setDate(current.getDate() + 1)
  }
  return keys
}

function normalizePlanningItem(item: PlanningCalendarItemInput, fallbackDate?: string): PlanningCalendarItem {
  const endDate = item.dateRange?.endDate ?? item.dateRange?.startDate ?? null
  const ownerTeams = item.team ? [{ ...item.team, role: 'owner' as const }] : []
  const participantTeams = (item.teams ?? []).map((team) => ({ ...team, role: 'participant' as const }))
  const teams = uniqueById([...ownerTeams, ...participantTeams])
  const dateKeys =
    item.dateKeys && item.dateKeys.length > 0
      ? item.dateKeys
      : fallbackDate
        ? [fallbackDate]
        : item.dateRange?.startDate
          ? expandDateKeys(item.dateRange.startDate, item.dateRange.endDate)
          : []
  const canCancel = item.actions?.canCancel ?? item.actions?.canDelete ?? false
  const canStartDailyReport = item.actions?.canStartDailyReport ?? DAILY_REPORT_SOURCE_TYPES.has(item.sourceType)

  return {
    id: `${item.sourceType}:${item.sourceId}`,
    type: item.sourceType,
    sourceId: item.sourceId,
    title: item.title,
    startDate: item.dateRange?.startDate ?? fallbackDate ?? '',
    endDate,
    workTime: item.workTime ?? null,
    dateKeys,
    teamIds: teams.map((team) => team.id),
    teams,
    locationText: item.location ?? null,
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
    status: item.status ?? 'planned',
    source: {
      route: itemRoute(item.sourceType, item.sourceId),
      dailyReportPrefillRoute: `/daily-report?sourceType=${item.sourceType}&sourceId=${item.sourceId}`,
    },
    actions: {
      canView: true,
      canEdit: !!item.actions?.canEdit,
      canCancel: !!canCancel,
      canUpload: !!item.actions?.canEdit,
      canDownload: !!item.actions?.canDownload,
      canStartDailyReport,
    },
  }
}

export function normalizeCalendarResponse(month: PlanningCalendarApiResponse): PlanningCalendarResponse {
  const items = 'days' in month
    ? month.days.flatMap((day) => (Array.isArray(day.items) ? day.items : []).map((item) => normalizePlanningItem(item, day.date)))
    : month.items.map((item) => normalizePlanningItem(item))

  const summary =
    'summary' in month && month.summary
      ? {
          total: month.summary.total ?? items.length,
          byType: {
            team_plan: month.summary.byType?.team_plan ?? items.filter((item) => item.type === 'team_plan').length,
            monthly_plan: month.summary.byType?.monthly_plan ?? items.filter((item) => item.type === 'monthly_plan').length,
            large_work: month.summary.byType?.large_work ?? items.filter((item) => item.type === 'large_work').length,
          },
        }
      : {
          total: items.length,
          byType: {
            team_plan: items.filter((item) => item.type === 'team_plan').length,
            monthly_plan: items.filter((item) => item.type === 'monthly_plan').length,
            large_work: items.filter((item) => item.type === 'large_work').length,
          },
        }

  return {
    from: 'from' in month ? month.from : month.monthStart,
    to: 'to' in month ? month.to : month.monthEnd,
    items,
    summary,
  }
}

export const planningCalendarService = {
  // ── Range query for visible calendar ────────────────────────
  async getRange(params: PlanningCalendarParams): Promise<PlanningCalendarResponse> {
    const { year, month } = parseYearMonth(params.from)
    const data = await apiClient.get<PlanningCalendarApiResponse>(`/v1/planning/calendar/${year}/${month}`)
    return normalizeCalendarResponse(data)
  },

  // ── Convenience wrapper for one day ─────────────────────────
  async getDay(date: string): Promise<PlanningCalendarItem[]> {
    const { year, month } = parseYearMonth(date)
    const monthData = await apiClient.get<PlanningCalendarApiResponse>(`/v1/planning/calendar/${year}/${month}`)
    return normalizeCalendarResponse(monthData).items.filter((item) => item.dateKeys.includes(date))
  },
}
