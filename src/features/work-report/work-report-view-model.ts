import type { UserRole } from '@/types/auth'
import type { TaskResponse, TeamTaskGroups } from '@/types/task-daily'

export type ReportStatusFilter = 'all' | 'draft' | 'saved'
export type ReportSourceFilter = 'all' | 'planning' | 'monthly-plan' | 'large-work' | 'adhoc'

export interface ReportActor {
  role: UserRole | string | null | undefined
  teamId: number | string | null | undefined
}

export interface WorkReportItem {
  id: number
  workDate: string
  timeLabel: string
  title: string
  teamId: number | null
  teamName: string
  workerName: string
  location: string
  source: Exclude<ReportSourceFilter, 'all'>
  sourceLabel: string
  status: Exclude<ReportStatusFilter, 'all'>
  statusLabel: string
  summary: string
  detail: string
  beforeImages: string[]
  afterImages: string[]
  referenceId?: string
}

export interface WorkReportFilters {
  status?: ReportStatusFilter
  source?: ReportSourceFilter
  teamId?: string
  search?: string
}

export interface WorkReportSummary {
  total: number
  saved: number
  drafts: number
  planning: number
  monthlyPlan: number
  largeWork: number
  adHoc: number
  reportingTeams: number
  teamsWithoutReports: number
}

function toNullableNumber(value: number | string | null | undefined): number | null {
  if (value == null || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function includesAny(value: string, needles: string[]): boolean {
  const normalized = value.toLowerCase()
  return needles.some((needle) => normalized.includes(needle.toLowerCase()))
}

export function inferReportSource(task: TaskResponse): WorkReportItem['source'] {
  if (task.sourceType === 'monthly_plan') return 'monthly-plan'
  if (task.sourceType === 'large_work') return 'large-work'
  if (task.sourceType === 'team_plan') return 'planning'
  const sourceText = [task.jobType?.name, task.jobDetail?.name, task.detail].filter(Boolean).join(' ')
  if (includesAny(sourceText, ['monthly plan', 'monthly-plan', 'แผนเดือน', 'แผนประจำเดือน'])) return 'monthly-plan'
  if (includesAny(sourceText, ['งานระดมทีม', 'large work', 'large_work'])) return 'large-work'
  if (includesAny(sourceText, ['planning', 'แผนงาน', 'calendar', 'board'])) return 'planning'
  return 'adhoc'
}

export function normalizeTaskDailyReport(task: TaskResponse): WorkReportItem {
  const source = inferReportSource(task)
  const hasCompletionEvidence = task.urlsAfter.length > 0 || !!task.detail?.trim()
  const locationParts = [
    task.feeder?.code,
    task.feeder?.station?.name,
    task.numPole ? `เสา ${task.numPole}` : undefined,
    task.deviceCode ? `อุปกรณ์ ${task.deviceCode}` : undefined,
  ].filter(Boolean)

  return {
    id: task.id,
    workDate: task.workDate,
    timeLabel: formatThaiDate(task.workDate),
    title: task.jobDetail?.name || task.jobType?.name || `บันทึกงาน #${task.id}`,
    teamId: task.teamId ?? null,
    teamName: task.team?.name || `ทีม ${task.teamId}`,
    workerName: task.team?.name || 'ทีมผู้ปฏิบัติงาน',
    location: locationParts.length > 0 ? locationParts.join(' · ') : 'ไม่ระบุสถานที่',
    source,
    sourceLabel: getSourceLabel(source),
    status: hasCompletionEvidence ? 'saved' : 'draft',
    statusLabel: hasCompletionEvidence ? 'บันทึกแล้ว' : 'บันทึกร่าง',
    summary: task.detail?.trim() || 'ยังไม่มีสรุปผลการปฏิบัติงาน',
    detail: task.detail?.trim() || 'ยังไม่มีรายละเอียดงานที่ทำจริง',
    beforeImages: task.urlsBefore,
    afterImages: task.urlsAfter,
    referenceId: buildReferenceId(task, source),
  }
}

export function flattenTaskGroups(groups: TeamTaskGroups | undefined): WorkReportItem[] {
  if (!groups) return []
  return Object.values(groups).flatMap((group) => group.tasks.map(normalizeTaskDailyReport))
}

function buildReferenceId(task: TaskResponse, source: WorkReportItem['source']): string {
  if (task.sourceType === 'large_work' && task.sourceId && task.largeWorkTaskId) {
    return `${task.sourceType}:${task.sourceId}:task:${task.largeWorkTaskId}`
  }
  if (task.sourceType && task.sourceId) return `${task.sourceType}:${task.sourceId}`
  return `${source}:${task.id}`
}

export function filterReports(reports: WorkReportItem[], filters: WorkReportFilters): WorkReportItem[] {
  const status = filters.status || 'all'
  const source = filters.source || 'all'
  const teamId = filters.teamId || 'all'
  const search = filters.search?.trim().toLowerCase()

  return reports.filter((report) => {
    if (status !== 'all' && report.status !== status) return false
    if (source !== 'all' && report.source !== source) return false
    if (teamId !== 'all' && String(report.teamId) !== teamId) return false
    if (search) {
      const haystack = [
        report.title,
        report.teamName,
        report.workerName,
        report.location,
        report.sourceLabel,
        report.statusLabel,
        report.summary,
      ].join(' ').toLowerCase()
      if (!haystack.includes(search)) return false
    }
    return true
  })
}

export function buildReportSummary(reports: WorkReportItem[], actor: ReportActor, visibleTeamIds: number[] = []): WorkReportSummary {
  const reportingTeamIds = new Set(reports.map((report) => report.teamId).filter((teamId): teamId is number => teamId != null))
  const canSeeAllTeamGap = actor.role === 'super_admin'

  return {
    total: reports.length,
    saved: reports.filter((report) => report.status === 'saved').length,
    drafts: reports.filter((report) => report.status === 'draft').length,
    planning: reports.filter((report) => report.source === 'planning').length,
    monthlyPlan: reports.filter((report) => report.source === 'monthly-plan').length,
    largeWork: reports.filter((report) => report.source === 'large-work').length,
    adHoc: reports.filter((report) => report.source === 'adhoc').length,
    reportingTeams: reportingTeamIds.size,
    teamsWithoutReports: canSeeAllTeamGap
      ? Math.max(visibleTeamIds.filter((teamId) => !reportingTeamIds.has(teamId)).length, 0)
      : 0,
  }
}

export function canMutateReport(role: UserRole | string | null | undefined, currentUserTeamId: number | string | null | undefined, reportTeamId: number | null | undefined): boolean {
  if (role === 'viewer') return false
  if (role === 'super_admin') return true
  const actorTeamId = toNullableNumber(currentUserTeamId)
  return (role === 'team_lead' || role === 'user') && actorTeamId != null && reportTeamId != null && actorTeamId === reportTeamId
}

export function getScopedTeamId(actor: ReportActor, selectedTeamId?: string): string | undefined {
  if (actor.role === 'super_admin' || actor.role === 'viewer') return selectedTeamId && selectedTeamId !== 'all' ? selectedTeamId : undefined
  const actorTeamId = toNullableNumber(actor.teamId)
  return actorTeamId == null ? undefined : String(actorTeamId)
}

export function getSourceLabel(source: WorkReportItem['source']): string {
  if (source === 'planning') return 'Planning'
  if (source === 'monthly-plan') return 'Monthly Plan'
  if (source === 'large-work') return 'งานระดมทีม'
  return 'งานนอกแผน'
}

export function formatThaiDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) return isoDate
  return date.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })
}
