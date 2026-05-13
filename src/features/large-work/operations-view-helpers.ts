import type { LargeWorkTaskResponse, LargeWorkTaskStatus, LargeWorkTeamRef } from '@/types/large-work'

export interface TeamOperationSummary {
  total: number
  todo: number
  inProgress: number
  done: number
  blocked: number
  cancelled: number
  active: number
  completedPercent: number
}

export interface OperationTeamGroup {
  teamId: number
  teamName: string
  summary: TeamOperationSummary
  tasks: LargeWorkTaskResponse[]
}

export interface ActiveTeamRow {
  taskId: number
  teamId: number
  teamName: string
  pointLabel: string
  workDetail: string
  startedAt: string | null
  hasGps: boolean
}

export function resolveTeamName(
  teamId: number | null | undefined,
  teams: Array<Pick<LargeWorkTeamRef, 'id' | 'name'>>,
): string {
  if (teamId == null) return 'ทีม #ไม่ระบุ'
  return teams.find((team) => team.id === teamId)?.name ?? `ทีม #${teamId}`
}

export function taskHasGps(task: Pick<LargeWorkTaskResponse, 'latitude' | 'longitude'>): boolean {
  return typeof task.latitude === 'number' && typeof task.longitude === 'number'
}

export function buildGoogleMapsSearchUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
}

export function buildGoogleMapsDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

export function groupTasksByTeam(
  tasks: LargeWorkTaskResponse[],
  teams: LargeWorkTeamRef[],
): OperationTeamGroup[] {
  const tasksByTeam = new Map<number, LargeWorkTaskResponse[]>()

  for (const task of tasks) {
    const teamTasks = tasksByTeam.get(task.assignedTeamId) ?? []
    teamTasks.push(task)
    tasksByTeam.set(task.assignedTeamId, teamTasks)
  }

  const knownGroups = teams.map((team) => buildTeamGroup(team.id, team.name, tasksByTeam.get(team.id) ?? []))

  const knownTeamIds = new Set(teams.map((team) => team.id))
  const unknownGroups = [...tasksByTeam.entries()]
    .filter(([teamId]) => !knownTeamIds.has(teamId))
    .sort(([teamIdA], [teamIdB]) => teamIdA - teamIdB)
    .map(([teamId, teamTasks]) => buildTeamGroup(teamId, resolveTeamName(teamId, teams), teamTasks))

  return [...knownGroups, ...unknownGroups]
}

export function computeTeamOperationSummary(tasks: LargeWorkTaskResponse[]): TeamOperationSummary {
  const counts: Record<LargeWorkTaskStatus, number> = {
    todo: 0,
    in_progress: 0,
    done: 0,
    blocked: 0,
    cancelled: 0,
  }

  for (const task of tasks) {
    counts[task.status] += 1
  }

  const total = tasks.length
  const completedPercent = total === 0 ? 0 : Math.round((counts.done / total) * 100)

  return {
    total,
    todo: counts.todo,
    inProgress: counts.in_progress,
    done: counts.done,
    blocked: counts.blocked,
    cancelled: counts.cancelled,
    active: counts.in_progress,
    completedPercent,
  }
}

export function activeTeamRows(tasks: LargeWorkTaskResponse[], teams: LargeWorkTeamRef[]): ActiveTeamRow[] {
  return [...tasks]
    .filter((task) => task.status === 'in_progress')
    .sort(compareTasksForDisplay)
    .map((task) => ({
      taskId: task.id,
      teamId: task.assignedTeamId,
      teamName: resolveTeamName(task.assignedTeamId, teams),
      pointLabel: task.pointLabel?.trim() || `จุดงาน #${task.id}`,
      workDetail: task.workDetail?.trim() || 'ไม่ระบุรายละเอียด',
      startedAt: task.startedAt,
      hasGps: taskHasGps(task),
    }))
}

function buildTeamGroup(teamId: number, teamName: string, tasks: LargeWorkTaskResponse[]): OperationTeamGroup {
  const sortedTasks = [...tasks].sort(compareTasksForDisplay)
  return {
    teamId,
    teamName,
    summary: computeTeamOperationSummary(sortedTasks),
    tasks: sortedTasks,
  }
}

function compareTasksForDisplay(a: LargeWorkTaskResponse, b: LargeWorkTaskResponse): number {
  const sequenceA = a.sequence ?? Number.MAX_SAFE_INTEGER
  const sequenceB = b.sequence ?? Number.MAX_SAFE_INTEGER
  if (sequenceA !== sequenceB) return sequenceA - sequenceB
  return a.id - b.id
}
