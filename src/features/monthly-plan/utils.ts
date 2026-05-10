import type {
  MonthlyPlanOverviewMonth,
  MonthlyPlanOverviewStatus,
  MonthlyPlanPeriod,
  MonthlyPlanYearOverview,
  PlanFile,
  SubmissionStatus,
  TeamSubmissionStatus,
} from '@/types/monthly-plan'

const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
] as const

const THAI_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
] as const

export const DEFAULT_MONTHLY_PLAN_GREGORIAN_YEAR = 2026
export const DEFAULT_MONTHLY_PLAN_BUDDHIST_YEAR = DEFAULT_MONTHLY_PLAN_GREGORIAN_YEAR + 543

export interface YearlyMonthlyPlanCard {
  year: number
  month: number
  label: string
  shortLabel: string
  yearLabel: string
  deadline: string | null
  isLocked: boolean
  status: MonthlyPlanOverviewStatus
  canUpload: boolean
  fileCount: number
  masterPlans: PlanFile[]
  teamFiles: PlanFile[]
  files: PlanFile[]
  period: MonthlyPlanPeriod
}

export interface MonthlyPlanTeamRow {
  teamId: number | null
  teamName: string
  files: PlanFile[]
  isOwnTeam: boolean
}

export function getDefaultMonthlyPlanYear(): number {
  return DEFAULT_MONTHLY_PLAN_GREGORIAN_YEAR
}

export function formatMonthlyPlanYearLabel(year: number): string {
  return `พ.ศ. ${year + 543} / ${year}`
}

export function buildYearlyMonthlyPlanCards(overview: MonthlyPlanYearOverview): YearlyMonthlyPlanCard[] {
  const byMonth = new Map<number, MonthlyPlanOverviewMonth>(
    overview.months.map((month) => [month.month, month])
  )

  return Array.from({ length: 12 }, (_, index) => {
    const month = index + 1
    const bucket = byMonth.get(month)
    const files = bucket?.files ?? []
    const period = bucket?.period ?? {
      id: 0,
      year: overview.year,
      month,
      isLocked: bucket?.isLocked ?? false,
      createdAt: '',
    }

    return {
      year: overview.year,
      month,
      label: THAI_MONTHS_FULL[index],
      shortLabel: THAI_MONTHS_SHORT[index],
      yearLabel: formatMonthlyPlanYearLabel(overview.year),
      deadline: bucket?.deadline ?? null,
      isLocked: bucket?.isLocked ?? period.isLocked,
      status: bucket?.status ?? 'open',
      canUpload: bucket?.actions.canUpload ?? false,
      fileCount: files.filter((file) => !file.isDeleted).length,
      masterPlans: files.filter((file) => file.isMasterPlan && !file.isDeleted),
      teamFiles: files.filter((file) => !file.isMasterPlan),
      files,
      period,
    }
  })
}

export function buildMonthlyPlanTeamRows(
  card: YearlyMonthlyPlanCard,
  teams: { id: number; name: string }[],
  currentUserTeamId: number | null | undefined
): MonthlyPlanTeamRow[] {
  const filesByTeam = card.teamFiles.reduce<Map<number | null, PlanFile[]>>((groups, file) => {
    const key = file.teamId ?? null
    groups.set(key, [...(groups.get(key) ?? []), file])
    return groups
  }, new Map<number | null, PlanFile[]>())

  const knownTeamRows = teams.map((team) => ({
    teamId: team.id,
    teamName: team.name,
    files: filesByTeam.get(team.id) ?? [],
    isOwnTeam: team.id === currentUserTeamId,
  }))

  const unknownTeamRows = Array.from(filesByTeam.entries())
    .filter(([teamId]) => teamId == null || !teams.some((team) => team.id === teamId))
    .map(([teamId, files]) => ({
      teamId,
      teamName: files[0]?.team?.name ?? (teamId == null ? 'ไม่ระบุทีม' : `ทีม #${teamId}`),
      files,
      isOwnTeam: teamId != null && teamId === currentUserTeamId,
    }))

  return [...knownTeamRows, ...unknownTeamRows]
}

function normalizePeriodDate(period: Partial<MonthlyPlanPeriod>): { year: number; month: number } {
  const now = new Date()
  const year = Number.isFinite(period.year) ? Number(period.year) : now.getFullYear()
  const month = Number.isFinite(period.month) && Number(period.month) >= 1 && Number(period.month) <= 12
    ? Number(period.month)
    : now.getMonth() + 1

  return { year, month }
}

export function formatPeriodLabel(period: Partial<MonthlyPlanPeriod>): string {
  const { year, month } = normalizePeriodDate(period)
  const thaiYear = year + 543
  return `${THAI_MONTHS_SHORT[month - 1]} ${String(thaiYear).slice(-2)}`
}

export function formatPeriodLabelFull(period: Partial<MonthlyPlanPeriod>): string {
  const { year, month } = normalizePeriodDate(period)
  const thaiYear = year + 543
  return `${THAI_MONTHS_FULL[month - 1]} ${thaiYear}`
}

export function isPeriodLocked(period: MonthlyPlanPeriod): boolean {
  return period.isLocked
}

export function getSubmissionStatus(submission: TeamSubmissionStatus): SubmissionStatus {
  return submission.status
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getStatusLabel(status: SubmissionStatus): string {
  switch (status) {
    case 'submitted': return 'ส่งแล้ว'
    case 'pending': return 'ยังไม่ส่ง'
    case 'missed': return 'ไม่ได้ส่ง'
  }
}

export function filterFiles<T extends { fileName: string; teamId: number; isDeleted: boolean }>(
  files: T[],
  search: string,
  teamId: number | null,
  includeDeleted = false
): T[] {
  return files.filter((f) => {
    if (!includeDeleted && f.isDeleted) return false
    if (teamId !== null && f.teamId !== teamId) return false
    if (search && !f.fileName.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })
}
