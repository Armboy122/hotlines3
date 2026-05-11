import type { LargeWorkTaskResponse } from '@/types/large-work'

export interface WorkerTodoDraft {
  beforePhotoUrl: string
  afterPhotoUrl: string
  completionNote: string
}

export function initialWorkerTodoDraft(): WorkerTodoDraft {
  return {
    beforePhotoUrl: '',
    afterPhotoUrl: '',
    completionNote: '',
  }
}

export function nextIncompleteTask(tasks: LargeWorkTaskResponse[], currentTaskId?: number | null): LargeWorkTaskResponse | null {
  const actionable = tasks.filter((task) => task.status !== 'done' && task.status !== 'cancelled')
  if (actionable.length === 0) return null
  if (currentTaskId == null) return actionable[0]

  const currentIndex = actionable.findIndex((task) => task.id === currentTaskId)
  if (currentIndex < 0) return actionable[0]
  return actionable[currentIndex + 1] ?? actionable[0]
}

export function canStartWorkerTask(task: LargeWorkTaskResponse | null | undefined): boolean {
  return task?.status === 'todo' || task?.status === 'blocked'
}

export function canCompleteWorkerTask(task: LargeWorkTaskResponse | null | undefined, draft: WorkerTodoDraft): boolean {
  if (!task || task.status !== 'in_progress') return false
  const hasBefore = task.beforePhotoUrls.length > 0 || draft.beforePhotoUrl.trim().length > 0
  const hasAfter = task.afterPhotoUrls.length > 0 || draft.afterPhotoUrl.trim().length > 0
  const hasCompletionNote = draft.completionNote.trim().length > 0
  return hasBefore && hasAfter && hasCompletionNote
}

export function photoPayload(url: string, photoType: 'before' | 'after') {
  const trimmed = url.trim()
  return trimmed ? { photoType, photoUrls: [trimmed] } : null
}

export function completionPayload(draft: WorkerTodoDraft) {
  const after = draft.afterPhotoUrl.trim()
  return {
    completionNote: draft.completionNote.trim() || null,
    afterPhotoUrls: after ? [after] : [],
  }
}
