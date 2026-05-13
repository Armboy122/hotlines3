'use client'

import { AlertCircle, CalendarDays, CheckCircle2, Clock3, ExternalLink, Loader2, MapPin, Navigation, Users } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useLargeWorkOverview, useLargeWorkTasks } from '@/hooks/useQueries'
import { cn } from '@/lib/utils'
import type { LargeWorkResponse, LargeWorkTaskResponse } from '@/types/large-work'
import {
  activeTeamRows,
  buildGoogleMapsDirectionsUrl,
  buildGoogleMapsSearchUrl,
  computeTeamOperationSummary,
  groupTasksByTeam,
  mapBeforeWorkPhotoVisibility,
  taskStatusClass,
  taskHasGps,
  TASK_STATUS_LABELS,
  type OperationTeamGroup,
} from '@/features/large-work/operations-view-helpers'

const WORK_STATUS_LABELS: Record<string, string> = {
  draft: 'ร่าง',
  planned: 'วางแผนแล้ว',
  in_progress: 'กำลังดำเนินการ',
  completed: 'เสร็จสิ้น',
  cancelled: 'ยกเลิก',
}

interface LargeWorkOperationsDialogProps {
  open: boolean
  item: LargeWorkResponse
  onClose: () => void
}

export function LargeWorkOperationsDialog({ open, item, onClose }: LargeWorkOperationsDialogProps) {
  const tasksQuery = useLargeWorkTasks(open ? item.id : undefined)
  const overviewQuery = useLargeWorkOverview(open ? item.id : undefined)

  const tasks = tasksQuery.data ?? []
  const teams = item.teams ?? []
  const teamGroups = groupTasksByTeam(tasks, teams)
  const activeRows = activeTeamRows(tasks, teams)
  const overviewProgress = overviewQuery.data?.progress
  const taskSummary = computeTeamOperationSummary(tasks)
  const summary = overviewProgress
    ? {
        ...overviewProgress,
        active: overviewProgress.inProgress,
        completedPercent: overviewProgress.total === 0 ? 0 : Math.round((overviewProgress.done / overviewProgress.total) * 100),
        beforePhotoCount: taskSummary.beforePhotoCount,
        afterPhotoCount: taskSummary.afterPhotoCount,
        hasBeforePhotos: taskSummary.hasBeforePhotos,
        hasAfterPhotos: taskSummary.hasAfterPhotos,
      }
    : taskSummary
  const donePercent = summary.completedPercent
  const isLoading = tasksQuery.isLoading || overviewQuery.isLoading
  const hasError = tasksQuery.isError || overviewQuery.isError
  const owner = teams.find((team) => team.role === 'owner')
  const activeTeamCount = new Set(activeRows.map((row) => row.teamId)).size

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="flex max-h-[92vh] w-[calc(100vw-1.5rem)] max-w-5xl flex-col overflow-hidden rounded-3xl border-white/70 bg-white/95 p-0 shadow-2xl sm:w-full">
        <DialogHeader className="border-b border-gray-100 bg-gradient-to-br from-emerald-50 via-white to-amber-50 px-4 py-4 text-left sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                  งานระดมทีม
                </span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                  {WORK_STATUS_LABELS[item.status] ?? item.status}
                </span>
              </div>
              <DialogTitle className="text-xl font-black text-gray-900 sm:text-2xl">
                {item.title}
              </DialogTitle>
              <DialogDescription className="space-y-1 text-sm text-gray-600">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-emerald-600" />
                  {formatRange(item.startDate, item.endDate)}{item.workTime ? ` · ${item.workTime}` : ''}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-emerald-600" />
                  ทีมเจ้าของ: {owner?.name ?? 'ไม่ระบุทีมเจ้าของ'}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  {item.locationText}
                </span>
              </DialogDescription>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/80 p-3 shadow-sm sm:min-w-[160px]">
              <p className="text-xs font-semibold text-gray-500">ความคืบหน้า</p>
              <p className="mt-1 text-2xl font-black text-emerald-700">{donePercent}%</p>
              <p className="text-xs text-gray-500">เสร็จ {summary.done}/{summary.total} จุด</p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
          {isLoading ? (
            <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-gray-100 bg-white/70">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
              <span className="ml-2 text-sm text-gray-600">กำลังโหลดการปฏิบัติงานของทีม</span>
            </div>
          ) : hasError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
              ไม่สามารถโหลดข้อมูลการปฏิบัติงานได้ กรุณาลองรีเฟรชอีกครั้ง
            </div>
          ) : teamGroups.length === 0 ? (
            <EmptyOperationsState />
          ) : (
            <>
              <SummarySection summary={summary} activeTeamCount={activeTeamCount} />
              <ActiveTeamsSection rows={activeRows} tasks={tasks} />
              <TeamGroupsSection groups={teamGroups} />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SummarySection({
  summary,
  activeTeamCount,
}: {
  summary: ReturnType<typeof computeTeamOperationSummary>
  activeTeamCount: number
}) {
  const chips = [
    { label: 'ทั้งหมด', value: summary.total, className: 'border-gray-200 bg-white text-gray-700' },
    { label: 'กำลังทำ', value: summary.inProgress, className: 'border-amber-200 bg-amber-50 text-amber-700' },
    { label: 'รอทำ', value: summary.todo, className: 'border-gray-200 bg-gray-50 text-gray-600' },
    { label: 'เสร็จ', value: summary.done, className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
    { label: 'ติดขัด', value: summary.blocked, className: 'border-red-200 bg-red-50 text-red-600', hideWhenZero: true },
    { label: 'ทีมกำลังทำ', value: activeTeamCount, className: 'border-amber-200 bg-white text-amber-700' },
    { label: 'รูปก่อนทำ', value: summary.beforePhotoCount, className: 'border-emerald-100 bg-emerald-50/70 text-emerald-700' },
  ]

  return (
    <section className="rounded-2xl border border-gray-100 bg-white/80 p-3 shadow-sm sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900 sm:text-base">สรุปภาพรวม</h3>
          <p className="text-xs text-gray-500">ดูสถานะทุกจุดงานและทีมที่กำลังปฏิบัติงาน</p>
        </div>
        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500" style={{ width: `${summary.completedPercent}%` }} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {chips.filter((chip) => !chip.hideWhenZero || chip.value > 0).map((chip) => (
          <div key={chip.label} className={cn('rounded-2xl border p-3', chip.className)}>
            <p className="text-[11px] font-semibold opacity-80">{chip.label}</p>
            <p className="mt-1 text-xl font-black">{chip.value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function ActiveTeamsSection({ rows, tasks }: { rows: ReturnType<typeof activeTeamRows>; tasks: LargeWorkTaskResponse[] }) {
  return (
    <section className="rounded-2xl border border-amber-100 bg-amber-50/50 p-3 sm:p-4">
      <div className="mb-3 flex items-start gap-2">
        <Clock3 className="mt-0.5 h-5 w-5 text-amber-600" />
        <div>
          <h3 className="text-sm font-bold text-gray-900 sm:text-base">ทีมที่กำลังทำงาน</h3>
          <p className="text-xs text-gray-600">แสดงเฉพาะทีมที่มีจุดงานสถานะกำลังทำ</p>
        </div>
      </div>
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-white/80 bg-white/80 p-4 text-sm text-gray-600">
          ยังไม่มีทีมที่กำลังทำงานในขณะนี้
        </div>
      ) : (
        <div className="grid gap-2 lg:grid-cols-2">
          {rows.map((row) => {
            const task = tasks.find((candidate) => candidate.id === row.taskId)
            return (
              <div key={row.taskId} className="rounded-2xl border border-white/80 bg-white/90 p-3 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900">{row.teamName}</p>
                    <p className="mt-1 text-xs text-gray-600">กำลังทำ {row.pointLabel}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-gray-500">{row.workDetail}</p>
                    {row.startedAt && <p className="mt-1 text-[11px] text-amber-700">เริ่ม {formatDateTime(row.startedAt)}</p>}
                  </div>
                  {task && taskHasGps(task) && <MapActions task={task} compact />}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

function TeamGroupsSection({ groups }: { groups: OperationTeamGroup[] }) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-bold text-gray-900 sm:text-base">รายการจุดงานตามทีม</h3>
        <p className="text-xs text-gray-500">ใช้ชื่อทีมจริงและเรียงตามทีมในแผนงาน</p>
      </div>
      <div className="grid gap-3 xl:grid-cols-2">
        {groups.map((group) => (
          <div key={group.teamId} className="rounded-2xl border border-gray-100 bg-white/85 p-3 shadow-sm sm:p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h4 className="text-base font-black text-gray-900">{group.teamName}</h4>
                <p className="text-xs text-gray-500">เสร็จ {group.summary.done}/{group.summary.total} จุด</p>
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                {group.summary.completedPercent}%
              </span>
            </div>
            <div className="mb-3 h-2 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${group.summary.completedPercent}%` }} />
            </div>
            <div className="space-y-3">
              {group.tasks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 p-4 text-sm text-gray-600">
                  ยังไม่มีจุดงานที่มอบหมายให้ทีมนี้
                </div>
              ) : (
                group.tasks.map((task) => <OperationTaskCard key={task.id} task={task} />)
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function OperationTaskCard({ task }: { task: LargeWorkTaskResponse }) {
  const pointLabel = task.pointLabel?.trim() || `จุดงาน #${task.id}`
  const beforePhotos = mapBeforeWorkPhotoVisibility(task.beforePhotoUrls)
  const counts = [
    task.pointCount != null ? `จุด ${task.pointCount}` : null,
    task.treeCount != null ? `ต้นไม้ ${task.treeCount}` : null,
    task.itemCount != null ? `รายการ ${task.itemCount}` : null,
  ].filter(Boolean)

  return (
    <article className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-bold', taskStatusClass(task.status))}>
              {TASK_STATUS_LABELS[task.status]}
            </span>
            {task.workType && <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px] text-gray-600">{task.workType}</span>}
          </div>
          <h5 className="mt-2 text-sm font-bold text-gray-900">{pointLabel}</h5>
          {task.workDetail && <p className="mt-1 text-xs leading-5 text-gray-600">{task.workDetail}</p>}
        </div>
        {taskHasGps(task) && <MapActions task={task} />}
      </div>

      <div className="mt-3 grid gap-2 text-xs text-gray-600 sm:grid-cols-2">
        {counts.length > 0 && <InfoPill text={counts.join(' · ')} />}
        {task.notes && <InfoPill text={`หมายเหตุ: ${task.notes}`} />}
        {task.completionNote && <InfoPill text={`ผลปฏิบัติงาน: ${task.completionNote}`} />}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <PhotoStrip title="รูปก่อนทำ" urls={beforePhotos.urls} emptyText={beforePhotos.emptyText} />
        <PhotoStrip title="รูปหลังทำ" urls={task.afterPhotoUrls} emptyText="ยังไม่มีรูปหลังทำ" />
      </div>
    </article>
  )
}

function MapActions({ task, compact = false }: { task: LargeWorkTaskResponse; compact?: boolean }) {
  if (task.latitude == null || task.longitude == null) return null
  const searchUrl = buildGoogleMapsSearchUrl(task.latitude, task.longitude)
  const directionsUrl = buildGoogleMapsDirectionsUrl(task.latitude, task.longitude)

  return (
    <div className={cn('grid gap-2', compact ? 'grid-cols-2 sm:w-[190px]' : 'grid-cols-2 sm:w-[220px]')}>
      <Button asChild variant="outline" size="sm" className="min-h-11 border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50">
        <a href={searchUrl} target="_blank" rel="noreferrer">
          <ExternalLink className="h-4 w-4" /> เปิดแผนที่
        </a>
      </Button>
      <Button asChild size="sm" className="min-h-11 bg-emerald-600 text-white hover:bg-emerald-700">
        <a href={directionsUrl} target="_blank" rel="noreferrer">
          <Navigation className="h-4 w-4" /> นำทาง
        </a>
      </Button>
    </div>
  )
}

function PhotoStrip({ title, urls, emptyText }: { title: string; urls: string[]; emptyText: string }) {
  return (
    <div className="rounded-2xl border border-white bg-white/80 p-2">
      <p className="mb-2 text-xs font-bold text-gray-700">{title}</p>
      {urls.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {urls.map((url, index) => (
            <a key={`${url}-${index}`} href={url} target="_blank" rel="noreferrer" className="group block overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`${title} ${index + 1}`} className="aspect-square w-full object-cover transition-transform group-hover:scale-105" />
            </a>
          ))}
        </div>
      ) : (
        <div className="flex min-h-16 items-center rounded-xl border border-dashed border-gray-200 bg-gray-50 px-3 text-xs text-gray-500">
          {emptyText}
        </div>
      )}
    </div>
  )
}

function InfoPill({ text }: { text: string }) {
  return <div className="rounded-xl border border-gray-100 bg-white/80 px-3 py-2">{text}</div>
}

function EmptyOperationsState() {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white/80 p-8 text-center">
      <AlertCircle className="mx-auto h-10 w-10 text-amber-500" />
      <p className="mt-3 text-sm font-bold text-gray-900">ยังไม่มีจุดงานสำหรับติดตาม</p>
      <p className="mt-1 text-xs text-gray-500">กด “แจกจ่าย/แก้ไขจุดงาน” เพื่อสร้างการ์ดงานให้ทีมก่อนเริ่มติดตามการปฏิบัติงาน</p>
    </div>
  )
}

function formatRange(startDate: string, endDate?: string | null): string {
  if (!endDate || endDate === startDate) return startDate
  return `${startDate} ถึง ${endDate}`
}

function formatDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('th-TH', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
