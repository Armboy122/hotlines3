'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Loader2, Play, ImagePlus } from 'lucide-react'
import { useLargeWorkMyTodos } from '@/hooks/useQueries'
import { useAuthContext } from '@/lib/auth/auth-context'
import {
  useAddLargeWorkTaskPhotos,
  useCompleteLargeWorkTask,
  useStartLargeWorkTask,
} from '@/hooks/mutations/useLargeWorkMutations'
import type { LargeWorkTaskResponse } from '@/types/large-work'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  canCompleteWorkerTask,
  canStartWorkerTask,
  classifyWorkerTodoState,
  completionPayload,
  initialWorkerTodoDraft,
  nextIncompleteTask,
  photoPayload,
} from '../worker-todo-helpers'
import type { WorkerTodoDraft } from '../worker-todo-helpers'

const STATUS_LABELS: Record<string, string> = {
  todo: 'รอทำ',
  in_progress: 'กำลังทำ',
  done: 'เสร็จแล้ว',
  blocked: 'ติดขัด',
  cancelled: 'ยกเลิก',
}

function statusClass(status: string): string {
  switch (status) {
    case 'in_progress': return 'border-sky-200 bg-sky-50 text-sky-700'
    case 'done': return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    case 'blocked': return 'border-red-200 bg-red-50 text-red-600'
    default: return 'border-amber-200 bg-amber-50 text-amber-700'
  }
}

function taskTitle(task: LargeWorkTaskResponse): string {
  return task.pointLabel || task.locationText || `จุดงาน #${task.id}`
}

function DetailLine({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null || value === '') return null
  return (
    <div className="rounded-xl bg-white/70 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-0.5 text-xs font-medium text-gray-700">{value}</p>
    </div>
  )
}

interface TaskCardProps {
  task: LargeWorkTaskResponse
  active: boolean
  onSelect: () => void
}

function TaskCard({ task, active, onSelect }: TaskCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full rounded-2xl border p-3 text-left transition min-h-[88px]',
        active ? 'border-emerald-300 bg-emerald-50 shadow-sm' : 'border-gray-100 bg-white/80 hover:border-emerald-200',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-gray-900">{task.sequenceNo ? `#${task.sequenceNo} ` : ''}{taskTitle(task)}</p>
          <p className="mt-1 truncate text-xs text-gray-500">{task.assignedTeamName}</p>
        </div>
        <span className={cn('shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold', statusClass(task.status))}>
          {STATUS_LABELS[task.status] ?? task.status}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1 text-[11px] text-gray-500">
        {task.workType && <span className="rounded-full bg-gray-100 px-2 py-0.5">{task.workType}</span>}
        {task.beforePhotoUrls.length > 0 && <span className="rounded-full bg-sky-50 px-2 py-0.5 text-sky-700">ก่อน {task.beforePhotoUrls.length}</span>}
        {task.afterPhotoUrls.length > 0 && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">หลัง {task.afterPhotoUrls.length}</span>}
      </div>
    </button>
  )
}

function WorkerTodoStateCard({ title, description, tone = 'neutral' }: { title: string; description: string; tone?: 'neutral' | 'warning' | 'error' }) {
  return (
    <div className={cn(
      'rounded-2xl border border-dashed p-8 text-center',
      tone === 'error' && 'border-red-200 bg-red-50 text-red-700',
      tone === 'warning' && 'border-amber-200 bg-amber-50 text-amber-800',
      tone === 'neutral' && 'border-gray-200 bg-white/70 text-gray-600',
    )}>
      <p className="text-sm font-bold">{title}</p>
      <p className="mt-1 text-xs leading-5 opacity-80">{description}</p>
    </div>
  )
}

export function WorkerTodoQueue() {
  const { user } = useAuthContext()
  const { data: tasks, isLoading, error } = useLargeWorkMyTodos()
  const startTask = useStartLargeWorkTask()
  const addPhotos = useAddLargeWorkTaskPhotos()
  const completeTask = useCompleteLargeWorkTask()
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
  const [draft, setDraft] = useState<WorkerTodoDraft>(() => initialWorkerTodoDraft())

  const queue = tasks ?? []
  const queueState = classifyWorkerTodoState({ tasks, error, userTeamId: user?.teamId ?? null })
  const selectedTask = useMemo(
    () => queue.find((task) => task.id === selectedTaskId) ?? nextIncompleteTask(queue, selectedTaskId),
    [queue, selectedTaskId],
  )

  useEffect(() => {
    if (selectedTask?.id && selectedTask.id !== selectedTaskId) {
      setSelectedTaskId(selectedTask.id)
      setDraft(initialWorkerTodoDraft())
    }
  }, [selectedTask?.id, selectedTaskId])

  const isBusy = startTask.isPending || addPhotos.isPending || completeTask.isPending

  const savePhoto = (photoType: 'before' | 'after') => {
    if (!selectedTask) return
    const payload = photoPayload(photoType === 'before' ? draft.beforePhotoUrl : draft.afterPhotoUrl, photoType)
    if (!payload) return
    addPhotos.mutate({ taskId: selectedTask.id, data: payload })
  }

  const completeSelected = () => {
    if (!selectedTask || !canCompleteWorkerTask(selectedTask, draft)) return
    completeTask.mutate(
      { taskId: selectedTask.id, data: completionPayload(draft) },
      {
        onSuccess: () => {
          const next = nextIncompleteTask(queue, selectedTask.id)
          setSelectedTaskId(next?.id ?? null)
          setDraft(initialWorkerTodoDraft())
        },
      },
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (queueState.kind !== 'ready') {
    return (
      <WorkerTodoStateCard
        title={queueState.title}
        description={queueState.description}
        tone={queueState.kind === 'empty' ? 'neutral' : queueState.kind === 'no_team' ? 'warning' : 'error'}
      />
    )
  }

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="space-y-2">
        {queue.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            active={selectedTask?.id === task.id}
            onSelect={() => {
              setSelectedTaskId(task.id)
              setDraft(initialWorkerTodoDraft())
            }}
          />
        ))}
      </div>

      {selectedTask && (
        <div className="card-glass rounded-2xl border border-emerald-100 bg-white/85 p-4 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-emerald-600">คิวงานฉัน / อ่านแผนอย่างเดียว</p>
              <h3 className="mt-1 text-lg font-black text-gray-900">{taskTitle(selectedTask)}</h3>
              <p className="mt-1 text-xs text-gray-500">ทีม: {selectedTask.assignedTeamName}</p>
            </div>
            <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-semibold', statusClass(selectedTask.status))}>
              {STATUS_LABELS[selectedTask.status] ?? selectedTask.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <DetailLine label="สถานที่" value={selectedTask.locationText} />
            <DetailLine label="ประเภท" value={selectedTask.workType} />
            <DetailLine label="รายละเอียด" value={selectedTask.workDetail} />
            <DetailLine label="จำนวนจุด" value={selectedTask.pointCount} />
            <DetailLine label="จำนวนต้น" value={selectedTask.treeCount} />
            <DetailLine label="จำนวนรายการ" value={selectedTask.itemCount} />
          </div>

          {selectedTask.notes && <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">{selectedTask.notes}</p>}

          {canStartWorkerTask(selectedTask) && (
            <Button
              className="min-h-11 w-full bg-sky-600 text-white hover:bg-sky-700"
              disabled={isBusy}
              onClick={() => startTask.mutate(selectedTask.id)}
            >
              <Play className="h-4 w-4" /> เริ่มทำจุดนี้
            </Button>
          )}

          <div className="space-y-3 rounded-2xl border border-gray-100 bg-gray-50/70 p-3">
            <p className="text-sm font-bold text-gray-800">รูปก่อนทำ / หลังทำ</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">URL รูปก่อนทำ</label>
                <div className="flex gap-2">
                  <Input
                    value={draft.beforePhotoUrl}
                    onChange={(e) => setDraft((prev) => ({ ...prev, beforePhotoUrl: e.target.value }))}
                    placeholder="วาง URL รูปก่อนทำ"
                    disabled={selectedTask.status === 'done'}
                  />
                  <Button type="button" variant="outline" disabled={isBusy || !draft.beforePhotoUrl.trim()} onClick={() => savePhoto('before')}>
                    <ImagePlus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">URL รูปหลังทำ</label>
                <div className="flex gap-2">
                  <Input
                    value={draft.afterPhotoUrl}
                    onChange={(e) => setDraft((prev) => ({ ...prev, afterPhotoUrl: e.target.value }))}
                    placeholder="วาง URL รูปหลังทำ"
                    disabled={selectedTask.status === 'done'}
                  />
                  <Button type="button" variant="outline" disabled={isBusy || !draft.afterPhotoUrl.trim()} onClick={() => savePhoto('after')}>
                    <ImagePlus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-gray-500">MVP ใช้ URL รูปแทน upload ไฟล์จริง เพื่อให้ตรง backend seam ปัจจุบัน</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">บันทึกผลการทำงาน</label>
            <Textarea
              value={draft.completionNote}
              onChange={(e) => setDraft((prev) => ({ ...prev, completionNote: e.target.value }))}
              placeholder="สรุปสิ่งที่ทำ / ปัญหาหน้างาน"
              rows={3}
              disabled={selectedTask.status === 'done'}
            />
          </div>

          <Button
            className="min-h-11 w-full bg-emerald-600 text-white hover:bg-emerald-700"
            disabled={isBusy || !canCompleteWorkerTask(selectedTask, draft)}
            onClick={completeSelected}
          >
            <CheckCircle2 className="h-4 w-4" /> บันทึกเสร็จและไปจุดถัดไป
          </Button>
        </div>
      )}
    </div>
  )
}
