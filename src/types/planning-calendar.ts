// ============================================================
// Planning Calendar Types — aligned with HNP-01 API contract
// ============================================================

export type PlanningItemType = 'team_plan' | 'monthly_plan' | 'large_work'

// ── Nested refs ──────────────────────────────────────────────

export interface PlanningCalendarTeamRef {
  id: number
  name: string
  role: 'owner' | 'participant' | 'target'
}

export interface PlanningElectricAreaRef {
  peaId: number | null
  peaName: string | null
  operationCenterId: number | null
  operationCenterName: string | null
  feederId: number | null
  feederCode: string | null
  stationId: number | null
  stationName: string | null
}

export interface PlanningCalendarActions {
  canView: boolean
  canEdit: boolean
  canCancel: boolean
  canUpload: boolean
  canDownload: boolean
  canStartDailyReport: boolean
}

// ── Calendar Item ────────────────────────────────────────────

export interface PlanningCalendarItem {
  id: string
  type: PlanningItemType
  sourceId: number
  title: string
  startDate: string
  endDate: string | null
  workTime: string | null
  dateKeys: string[]
  teamIds: number[]
  teams: PlanningCalendarTeamRef[]
  locationText: string | null
  electricArea: PlanningElectricAreaRef
  status: string
  source: {
    route: string
    dailyReportPrefillRoute?: string | null
  }
  actions: PlanningCalendarActions
}

// ── Calendar Response ────────────────────────────────────────

export interface PlanningCalendarResponse {
  from: string
  to: string
  items: PlanningCalendarItem[]
  summary: {
    total: number
    byType: Record<PlanningItemType, number>
  }
}

export interface PlanningCalendarParams {
  from: string
  to: string
  teamId?: number
  types?: string
}

// ── Helper functions ─────────────────────────────────────────

/** Format a Date as YYYY-MM-DD using local timezone (avoids UTC shift) */
function toLocalDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Expand a date range into an array of YYYY-MM-DD strings (inclusive, local timezone) */
export function expandDateKeys(startDate: string, endDate: string | null): string[] {
  const start = new Date(startDate + 'T00:00:00')
  const end = endDate ? new Date(endDate + 'T00:00:00') : start

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return []
  if (start > end) return []

  const keys: string[] = []
  const current = new Date(start)
  while (current <= end) {
    keys.push(toLocalDateKey(current))
    current.setDate(current.getDate() + 1)
  }
  return keys
}

/** Group calendar items by date key for rendering */
export function groupItemsByDateKey(
  items: PlanningCalendarItem[]
): Map<string, PlanningCalendarItem[]> {
  const map = new Map<string, PlanningCalendarItem[]>()
  for (const item of items) {
    for (const key of item.dateKeys) {
      const existing = map.get(key)
      if (existing) {
        existing.push(item)
      } else {
        map.set(key, [item])
      }
    }
  }
  return map
}

/** Count items by type */
export function countByType(
  items: PlanningCalendarItem[]
): Record<PlanningItemType, number> {
  const counts: Record<PlanningItemType, number> = {
    team_plan: 0,
    monthly_plan: 0,
    large_work: 0,
  }
  for (const item of items) {
    counts[item.type]++
  }
  return counts
}

/** Derive a short location hint and extra count from a day's items */
export interface CellSummary {
  primaryLocation: string | null
  extraCount: number
}

export function getCellSummary(items: PlanningCalendarItem[]): CellSummary {
  if (items.length === 0) return { primaryLocation: null, extraCount: 0 }
  const first = items[0]
  const location =
    first.locationText
    ?? first.electricArea.feederCode
    ?? first.electricArea.stationName
    ?? first.electricArea.peaName
    ?? null
  return { primaryLocation: location, extraCount: items.length - 1 }
}

/** Get Thai display label for a planning item type */
export function getPlanningItemTypeLabel(type: PlanningItemType): string {
  switch (type) {
    case 'team_plan':
      return 'แผนงานทีม'
    case 'monthly_plan':
      return 'แผนเดือน'
    case 'large_work':
      return 'งานระดมทีม'
  }
}
