import type { LargeWorkTaskRequest } from '@/types/large-work'

// Form-state type for a single task row in the assignment UI.
// All fields are strings because they come from HTML inputs.
export interface TaskRowState {
  assignedTeamId: string
  pointLabel: string
  locationText: string
  latitude: string
  longitude: string
  workType: string
  workDetail: string
  pointCount: string
  treeCount: string
  itemCount: string
  notes: string
}

export function emptyTaskRow(): TaskRowState {
  return {
    assignedTeamId: '',
    pointLabel: '',
    locationText: '',
    latitude: '',
    longitude: '',
    workType: '',
    workDetail: '',
    pointCount: '',
    treeCount: '',
    itemCount: '',
    notes: '',
  }
}

export function computeProgressPercent(totalTasks: number, doneCount: number): number {
  if (totalTasks <= 0) return 0
  return Math.round((doneCount / totalTasks) * 100)
}

function nullableString(value: string): string | null {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function nullableInt(value: string): number | null {
  const trimmed = value.trim()
  if (trimmed === '') return null
  const n = parseInt(trimmed, 10)
  return isNaN(n) ? null : n
}

function nullableFloat(value: string): number | null {
  const trimmed = value.trim()
  if (trimmed === '') return null
  const n = parseFloat(trimmed)
  return isNaN(n) ? null : n
}

// Returns null when assignedTeamId is missing/zero (row is invalid).
export function buildTaskRowPayload(row: TaskRowState): LargeWorkTaskRequest | null {
  const assignedTeamId = parseInt(row.assignedTeamId, 10)
  if (!assignedTeamId || assignedTeamId <= 0) return null

  return {
    assignedTeamId,
    pointLabel: nullableString(row.pointLabel),
    latitude: nullableFloat(row.latitude),
    longitude: nullableFloat(row.longitude),
    workType: nullableString(row.workType),
    workDetail: nullableString(row.workDetail),
    pointCount: nullableInt(row.pointCount),
    treeCount: nullableInt(row.treeCount),
    itemCount: nullableInt(row.itemCount),
    notes: nullableString(row.notes),
  }
}

// Converts an array of task row form states to valid API payloads,
// dropping any rows that are missing a required assignedTeamId.
export function buildAssignmentPayload(rows: TaskRowState[]): LargeWorkTaskRequest[] {
  return rows.flatMap((row) => {
    const payload = buildTaskRowPayload(row)
    return payload !== null ? [payload] : []
  })
}
