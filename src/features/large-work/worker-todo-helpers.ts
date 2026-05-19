import type { LargeWorkTaskResponse } from '@/types/large-work'

export type WorkerTodoStateKind = 'ready' | 'empty' | 'no_team' | 'schema_unavailable' | 'network_error'

export interface WorkerTodoState {
  kind: WorkerTodoStateKind
  title: string
  description: string
}

export interface WorkerTodoStateInput {
  tasks?: LargeWorkTaskResponse[]
  error?: Error | null
  userTeamId?: number | null
}

export interface WorkerTodoDraft {
  beforePhotoUrl: string
  afterPhotoUrl: string
  completionNote: string
}

export interface WorkerBeforePhotoPreview {
  visibleUrls: string[]
  totalCount: number
  remainingCount: number
  hasPhotos: boolean
}

export function initialWorkerTodoDraft(): WorkerTodoDraft {
  return {
    beforePhotoUrl: '',
    afterPhotoUrl: '',
    completionNote: '',
  }
}

export function classifyWorkerTodoState({ tasks, error, userTeamId }: WorkerTodoStateInput): WorkerTodoState {
  if (userTeamId == null) {
    return {
      kind: 'no_team',
      title: 'บัญชีนี้ยังไม่ผูกทีม',
      description: 'ติดต่อผู้ดูแลเพื่อกำหนดทีมก่อนใช้งานคิวงานระดมทีม',
    }
  }

  if (error) {
    const message = error.message.toLowerCase()
    if (
      message.includes('schema')
      || message.includes('migration')
      || message.includes('does not exist')
      || message.includes('no such table')
      || message.includes('undefined table')
    ) {
      return {
        kind: 'schema_unavailable',
        title: 'ระบบคิวงานยังไม่พร้อมใช้งาน',
        description: 'Backend ยังไม่ได้เปิด schema/API สำหรับจุดงานระดมทีม กรุณาลองใหม่หลัง deploy migration',
      }
    }

    return {
      kind: 'network_error',
      title: 'เชื่อมต่อระบบคิวงานไม่ได้',
      description: 'ตรวจสอบเครือข่ายหรือ Backend API แล้วกดรีเฟรชอีกครั้ง',
    }
  }

  if (!tasks || tasks.length === 0) {
    return {
      kind: 'empty',
      title: 'ยังไม่มีงานที่มอบหมายให้ทีมของคุณ',
      description: 'เมื่อหัวหน้าทีมวางแผนและมอบหมายจุดงานให้ทีมนี้ งานจะแสดงในคิวนี้',
    }
  }

  return {
    kind: 'ready',
    title: 'มีงานระดมทีมที่ต้องทำ',
    description: 'เลือกจุดงานเพื่อเริ่มทำงาน บันทึกรูป และปิดงานทีละจุด',
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
  const hasCompletionNote = draft.completionNote.trim().length > 0
  return hasCompletionNote
}

export function photoPayload(url: string, photoType: 'before' | 'after') {
  const trimmed = url.trim()
  return trimmed ? { kind: photoType, url: trimmed } : null
}

export function mapWorkerBeforePhotoPreview(urls: readonly string[] | null | undefined, limit = 3): WorkerBeforePhotoPreview {
  const visibleUrls = (urls ?? []).map((url) => url.trim()).filter((url) => url.length > 0)
  const previewLimit = Math.max(0, limit)
  const previewUrls = visibleUrls.slice(0, previewLimit)

  return {
    visibleUrls: previewUrls,
    totalCount: visibleUrls.length,
    remainingCount: Math.max(0, visibleUrls.length - previewUrls.length),
    hasPhotos: visibleUrls.length > 0,
  }
}

export function photoPayloadFromUploadResult(
  result: { success: boolean; data?: { url?: string | null }; error?: string },
  photoType: 'before' | 'after',
) {
  if (!result.success || !result.data?.url) return null
  return photoPayload(result.data.url, photoType)
}

export function completionPayload(draft: WorkerTodoDraft) {
  const after = draft.afterPhotoUrl.trim()
  return {
    completionNote: draft.completionNote.trim() || null,
    afterPhotoUrls: after ? [after] : [],
  }
}
