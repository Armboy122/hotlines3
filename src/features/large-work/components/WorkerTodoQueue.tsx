'use client'

import { type ChangeEvent, useEffect, useMemo, useState } from 'react'
import { CheckCircle2, ExternalLink, Loader2, MapPin, Navigation, Play, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { useLargeWorkMyTodos, useTeams } from '@/hooks/useQueries'
import { useUpload } from '@/hooks/useUpload'
import { useAuthContext } from '@/lib/auth/auth-context'
import {
  useAddLargeWorkTaskPhotos,
  useCompleteLargeWorkTask,
  useStartLargeWorkTask,
} from '@/hooks/mutations/useLargeWorkMutations'
import type { LargeWorkTaskResponse } from '@/types/large-work'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  canCompleteWorkerTask,
  canStartWorkerTask,
  classifyWorkerTodoState,
  completionPayload,
  initialWorkerTodoDraft,
  mapWorkerBeforePhotoPreview,
  nextIncompleteTask,
  photoPayloadFromUploadResult,
} from '../worker-todo-helpers'
import type { WorkerTodoDraft } from '../worker-todo-helpers'
import {
  buildGoogleMapsDirectionsUrl,
  buildGoogleMapsSearchUrl,
  mapBeforeWorkPhotoVisibility,
  resolveTeamName,
  taskStatusClass,
  taskHasGps,
  TASK_STATUS_LABELS,
} from '../operations-view-helpers'

function taskTitle(task: LargeWorkTaskResponse): string {
  return task.pointLabel || `จุดงาน #${task.id}`
}

function assignedTeamLabel(task: LargeWorkTaskResponse, teams: Array<{ id: number; name: string }>): string {
  return resolveTeamName(task.assignedTeamId, teams)
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

function BeforePhotoPreviewStrip({ urls }: { urls: string[] }) {
  const preview = mapWorkerBeforePhotoPreview(urls)
  if (!preview.hasPhotos) return null

  return (
    <div className="mt-3 flex items-center gap-2" aria-label={`รูปก่อนทำ ${preview.totalCount} รูป`}>
      <div className="flex -space-x-2">
        {preview.visibleUrls.map((url, index) => (
          <span key={`${url}-${index}`} className="relative block h-12 w-12 overflow-hidden rounded-xl border-2 border-white bg-gray-100 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`รูปก่อนทำ ${index + 1}`} className="h-full w-full object-cover" />
          </span>
        ))}
      </div>
      <div className="min-w-0 text-xs text-gray-600">
        <p className="font-bold text-gray-800">มีรูปก่อนทำแล้ว</p>
        <p className="truncate">{preview.totalCount} รูป{preview.remainingCount > 0 ? ` · อีก ${preview.remainingCount} รูปในรายละเอียด` : ''}</p>
      </div>
    </div>
  )
}

interface TaskCardProps {
  task: LargeWorkTaskResponse
  teams: Array<{ id: number; name: string }>
  active: boolean
  onSelect: () => void
}

function TaskCard({ task, teams, active, onSelect }: TaskCardProps) {
  const hasGps = taskHasGps(task)
  const taskBeforePhotos = mapBeforeWorkPhotoVisibility(task.beforePhotoUrls)
  const lat = task.latitude as number | null
  const lng = task.longitude as number | null

  return (
    <article
      className={cn(
        'w-full rounded-2xl border p-3 text-left transition min-h-[88px]',
        active ? 'border-emerald-300 bg-emerald-50 shadow-sm' : 'border-gray-100 bg-white/80 hover:border-emerald-200',
      )}
    >
      <button type="button" onClick={onSelect} className="block w-full text-left">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-gray-900">{task.sequence ? `#${task.sequence} ` : ''}{taskTitle(task)}</p>
            <p className="mt-1 truncate text-xs text-gray-500">{assignedTeamLabel(task, teams)}</p>
          </div>
          <span className={cn('shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold', taskStatusClass(task.status))}>
            {TASK_STATUS_LABELS[task.status] ?? task.status}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1 text-[11px] text-gray-500">
          {task.workType && <span className="rounded-full bg-gray-100 px-2 py-0.5">{task.workType}</span>}
          {taskBeforePhotos.visible && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">ก่อน {taskBeforePhotos.urls.length}</span>}
          {task.afterPhotoUrls.length > 0 && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">หลัง {task.afterPhotoUrls.length}</span>}
          {hasGps && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">มีพิกัด</span>}
        </div>
      </button>

      <BeforePhotoPreviewStrip urls={taskBeforePhotos.urls} />

      {hasGps && lat != null && lng != null && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a
            href={buildGoogleMapsSearchUrl(lat, lng)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-2 text-xs font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
            aria-label={`เปิดแผนที่ ${taskTitle(task)}`}
          >
            <MapPin className="h-3.5 w-3.5" /> เปิดแผนที่
          </a>
          <a
            href={buildGoogleMapsDirectionsUrl(lat, lng)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
            aria-label={`นำทางไป ${taskTitle(task)}`}
          >
            <Navigation className="h-3.5 w-3.5" /> นำทาง
          </a>
        </div>
      )}
    </article>
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

function PhotoGallery({ title, urls, emptyText }: { title: string; urls: string[]; emptyText: string }) {
  return (
    <div className="space-y-2 rounded-2xl border border-gray-100 bg-white/75 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-gray-800">{title}</p>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">{urls.length} รูป</span>
      </div>
      {urls.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {urls.map((url, index) => (
            <a
              key={`${url}-${index}`}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="group relative block min-h-[96px] overflow-hidden rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label={`เปิด${title} รูปที่ ${index + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`${title} ${index + 1}`} className="h-24 w-full object-cover transition group-hover:scale-105" />
              <span className="absolute bottom-1 right-1 rounded-full bg-black/60 p-1 text-white">
                <ExternalLink className="h-3.5 w-3.5" />
              </span>
            </a>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-3 py-4 text-xs leading-5 text-gray-500">
          {emptyText}
        </div>
      )}
    </div>
  )
}

function UploadPhotoButton({
  label,
  uploading,
  progress,
  disabled,
  onChange,
}: {
  label: string
  uploading: boolean
  progress: number
  disabled: boolean
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <label className={cn(
      'inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold transition sm:w-auto',
      disabled ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400' : 'border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50',
    )}>
      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
      {uploading ? `อัปโหลด ${progress}%` : label}
      <input type="file" accept="image/*" className="hidden" disabled={disabled} onChange={onChange} />
    </label>
  )
}

function GpsActions({ task }: { task: LargeWorkTaskResponse }) {
  if (!taskHasGps(task)) return null
  const lat = task.latitude as number
  const lng = task.longitude as number
  return (
    <div className="space-y-2 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3">
      <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
        <MapPin className="h-4 w-4 text-emerald-600" />
        ตำแหน่งหน้างาน
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Button asChild variant="outline" className="min-h-[44px] border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50">
          <a href={buildGoogleMapsSearchUrl(lat, lng)} target="_blank" rel="noreferrer">
            <MapPin className="h-4 w-4" /> เปิดแผนที่
          </a>
        </Button>
        <Button asChild className="min-h-[44px] bg-emerald-600 text-white hover:bg-emerald-700">
          <a href={buildGoogleMapsDirectionsUrl(lat, lng)} target="_blank" rel="noreferrer">
            <Navigation className="h-4 w-4" /> นำทาง
          </a>
        </Button>
      </div>
      <p className="text-[11px] text-gray-500">พิกัด: {lat}, {lng}</p>
    </div>
  )
}

export function WorkerTodoQueue() {
  const { user } = useAuthContext()
  const { data: tasks, isLoading, error } = useLargeWorkMyTodos()
  const { data: teams } = useTeams()
  const { upload, uploading, progress } = useUpload()
  const startTask = useStartLargeWorkTask()
  const addPhotos = useAddLargeWorkTaskPhotos()
  const completeTask = useCompleteLargeWorkTask()
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
  const [draft, setDraft] = useState<WorkerTodoDraft>(() => initialWorkerTodoDraft())

  const queue = useMemo(() => tasks ?? [], [tasks])
  const teamRefs = useMemo(() => teams ?? [], [teams])
  const queueState = classifyWorkerTodoState({ tasks, error, userTeamId: user?.teamId ?? null })
  const selectedTask = useMemo(
    () => queue.find((task) => task.id === selectedTaskId) ?? nextIncompleteTask(queue, selectedTaskId),
    [queue, selectedTaskId],
  )
  const selectedBeforePhotos = selectedTask ? mapBeforeWorkPhotoVisibility(selectedTask.beforePhotoUrls) : null

  useEffect(() => {
    if (selectedTask?.id && selectedTask.id !== selectedTaskId) {
      setSelectedTaskId(selectedTask.id)
      setDraft(initialWorkerTodoDraft())
    }
  }, [selectedTask?.id, selectedTaskId])

  const isBusy = startTask.isPending || addPhotos.isPending || completeTask.isPending || uploading

  const handlePhotoUpload = async (photoType: 'before' | 'after', event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!selectedTask || !file) return

    const result = await upload(file)
    const payload = photoPayloadFromUploadResult(result, photoType)
    if (!payload) {
      toast.error(result.error ?? 'อัปโหลดรูปไม่สำเร็จ')
      return
    }

    if (photoType === 'before') {
      setDraft((prev) => ({ ...prev, beforePhotoUrl: payload.url }))
    } else {
      setDraft((prev) => ({ ...prev, afterPhotoUrl: payload.url }))
    }
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
            teams={teamRefs}
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
              <p className="text-xs font-semibold text-emerald-600">คิวงานฉัน / ปฏิบัติงานตามแผน</p>
              <h3 className="mt-1 text-lg font-black text-gray-900">{taskTitle(selectedTask)}</h3>
              <p className="mt-1 text-xs text-gray-500">ทีม: {assignedTeamLabel(selectedTask, teamRefs)}</p>
            </div>
            <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-semibold', taskStatusClass(selectedTask.status))}>
              {TASK_STATUS_LABELS[selectedTask.status] ?? selectedTask.status}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <DetailLine label="ประเภท" value={selectedTask.workType} />
            <DetailLine label="รายละเอียด" value={selectedTask.workDetail} />
            <DetailLine label="จำนวนจุด" value={selectedTask.pointCount} />
            <DetailLine label="จำนวนต้น" value={selectedTask.treeCount} />
            <DetailLine label="จำนวนรายการ" value={selectedTask.itemCount} />
          </div>

          {selectedTask.notes && <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">{selectedTask.notes}</p>}

          <GpsActions task={selectedTask} />

          <PhotoGallery
            title="รูปก่อนทำ"
            urls={selectedBeforePhotos?.urls ?? []}
            emptyText={selectedBeforePhotos?.emptyText ?? 'ยังไม่มีรูปก่อนทำงาน'}
          />

          <PhotoGallery
            title="รูปหลังทำ"
            urls={selectedTask.afterPhotoUrls}
            emptyText="ยังไม่มีรูปหลังทำ อัปโหลดรูปหลังทำก่อนบันทึกเสร็จงาน"
          />

          {canStartWorkerTask(selectedTask) && (
            <Button
              className="min-h-11 w-full bg-emerald-600 text-white hover:bg-emerald-700"
              disabled={isBusy}
              onClick={() => startTask.mutate(selectedTask.id)}
            >
              <Play className="h-4 w-4" /> เริ่มทำจุดนี้
            </Button>
          )}

          <div className="space-y-3 rounded-2xl border border-gray-100 bg-gray-50/70 p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-gray-800">อัปโหลดรูปงาน</p>
                <p className="text-[11px] leading-5 text-gray-500">เลือกไฟล์จากมือถือหรือกล้อง ระบบจะบันทึกรูปให้อัตโนมัติ</p>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <UploadPhotoButton
                label="อัปโหลดรูปก่อนทำ"
                uploading={uploading}
                progress={progress}
                disabled={isBusy || selectedTask.status === 'done'}
                onChange={(event) => handlePhotoUpload('before', event)}
              />
              <UploadPhotoButton
                label="อัปโหลดรูปหลังทำ"
                uploading={uploading}
                progress={progress}
                disabled={isBusy || selectedTask.status === 'done'}
                onChange={(event) => handlePhotoUpload('after', event)}
              />
            </div>
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
