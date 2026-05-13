import { apiClient } from '@/lib/api-client'
import type {
  PlanningCalendarResponse,
  PlanningCalendarParams,
  PlanningCalendarItem,
  PlanningItemType,
} from '@/types/planning-calendar'

const DAILY_REPORT_SOURCE_TYPES = new Set<PlanningItemType>(['team_plan', 'large_work'])

type BackendPlanningMonth = {
  monthStart: string
  monthEnd: string
  days: Array<{
    date: string
    items: BackendPlanningItem[]
  }>
}

type BackendPlanningItem = {
  sourceType: PlanningItemType
  sourceId: number
  title: string
  team?: { id: number; name: string }
  teams?: Array<{ id: number; name: string }>
  workTime?: string | null
  location?: string
  status?: string
  dateRange: { startDate: string; endDate?: string | null }
  actions?: {
    canEdit?: boolean
    canDelete?: boolean
    canCancel?: boolean
    canDownload?: boolean
    canStartDailyReport?: boolean
  }
}

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

function normalizeCalendarResponse(month: BackendPlanningMonth): PlanningCalendarResponse {
  const days = Array.isArray(month.days) ? month.days : []
  const items = days.flatMap((day) =>
    (Array.isArray(day.items) ? day.items : []).map((item) => {
      const endDate = item.dateRange.endDate ?? item.dateRange.startDate
      const ownerTeams = item.team ? [{ ...item.team, role: 'owner' as const }] : []
      const participantTeams = (item.teams ?? []).map((team) => ({ ...team, role: 'participant' as const }))
      const teams = uniqueById([...ownerTeams, ...participantTeams])
      const canCancel = item.actions?.canCancel ?? item.actions?.canDelete ?? false
      const canStartDailyReport = item.actions?.canStartDailyReport ?? DAILY_REPORT_SOURCE_TYPES.has(item.sourceType)
      return {
        id: `${item.sourceType}:${item.sourceId}`,
        type: item.sourceType,
        sourceId: item.sourceId,
        title: item.title,
        startDate: item.dateRange.startDate,
        endDate,
        workTime: item.workTime ?? null,
        dateKeys: [day.date],
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
      } satisfies PlanningCalendarItem
    })
  )

  return {
    from: month.monthStart,
    to: month.monthEnd,
    items,
    summary: {
      total: items.length,
      byType: {
        team_plan: items.filter((item) => item.type === 'team_plan').length,
        monthly_plan: items.filter((item) => item.type === 'monthly_plan').length,
        large_work: items.filter((item) => item.type === 'large_work').length,
      },
    },
  }
}

export const planningCalendarService = {
  // ── Range query for visible calendar ────────────────────────
  async getRange(params: PlanningCalendarParams): Promise<PlanningCalendarResponse> {
    const { year, month } = parseYearMonth(params.from)
    const data = await apiClient.get<BackendPlanningMonth>(`/v1/planning/calendar/${year}/${month}`)
    return normalizeCalendarResponse(data)
  },

  // ── Convenience wrapper for one day ─────────────────────────
  async getDay(date: string): Promise<PlanningCalendarItem[]> {
    const { year, month } = parseYearMonth(date)
    const monthData = await apiClient.get<BackendPlanningMonth>(`/v1/planning/calendar/${year}/${month}`)
    return normalizeCalendarResponse(monthData).items.filter((item) => item.dateKeys.includes(date))
  },
}
