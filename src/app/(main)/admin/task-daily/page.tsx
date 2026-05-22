'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { CalendarDays, ClipboardList, Filter, ImageIcon, MapPin, RefreshCw, Search, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { PageHero, PageShell } from '@/components/ui/page-shell'
import { useAdminTaskDailies, useFeeders, useJobTypes, useTeams } from '@/hooks/useQueries'
import type { TaskDailyFiltered } from '@/types/task-daily'

const today = new Date().toISOString().slice(0, 10)

function formatThaiDate(value?: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function formatThaiDateTime(value?: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function getTaskSearchText(task: TaskDailyFiltered) {
  return [
    task.id,
    task.workDate,
    task.team?.name,
    task.jobType?.name,
    task.jobDetail?.name,
    task.feeder?.code,
    task.feeder?.station?.name,
    task.feeder?.station?.operationCenter?.name,
    task.numPole,
    task.deviceCode,
    task.detail,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function FieldRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3">
      <p className="text-xs font-bold text-gray-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-gray-900">{value || '-'}</p>
    </div>
  )
}

function PhotoStrip({ title, urls }: { title: string; urls: string[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-gray-900">{title}</p>
        <Badge variant="outline" className="border-gray-200 bg-white text-gray-600">
          {urls.length} รูป
        </Badge>
      </div>
      {urls.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {urls.map((url, index) => (
            <a
              key={`${title}-${url}-${index}`}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="group relative aspect-square overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-sm"
              aria-label={`เปิดรูป${title}ลำดับที่ ${index + 1}`}
            >
              <Image
                src={url}
                alt={`${title} ${index + 1}`}
                fill
                unoptimized
                sizes="(max-width: 640px) 50vw, 160px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </a>
          ))}
        </div>
      ) : (
        <div className="flex min-h-24 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-sm font-medium text-gray-500">
          ไม่มีรูปภาพ
        </div>
      )}
    </div>
  )
}

function TaskDetailDrawer({ task, onClose }: { task: TaskDailyFiltered | null; onClose: () => void }) {
  return (
    <Drawer open={!!task} onOpenChange={(open) => !open && onClose()} direction="right">
      <DrawerContent className="h-dvh max-h-dvh w-[92vw] overflow-hidden bg-white sm:max-w-xl">
        <DrawerHeader className="shrink-0 border-b border-gray-100 text-left">
          <div className="flex items-start justify-between gap-3">
            <div>
              <DrawerTitle className="text-xl font-black text-gray-900">รายละเอียดงาน</DrawerTitle>
              <DrawerDescription className="mt-1 text-gray-600">
                {task ? `งานเลขที่ #${task.id} · ${formatThaiDate(task.workDate)}` : ''}
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full" aria-label="ปิดรายละเอียด">
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        {task && (
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
            <div className="rounded-3xl border border-sky-100 bg-sky-50/80 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">งานประจำวัน</p>
              <h2 className="mt-2 text-lg font-black text-gray-900">{task.jobDetail?.name || task.jobType?.name || 'ไม่ระบุรายละเอียดงาน'}</h2>
              <p className="mt-1 text-sm font-medium text-gray-600">{task.team?.name || 'ไม่ระบุทีม'} · {task.jobType?.name || 'ไม่ระบุประเภทงาน'}</p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FieldRow label="วันที่ปฏิบัติงาน" value={formatThaiDate(task.workDate)} />
              <FieldRow label="ทีม" value={task.team?.name} />
              <FieldRow label="ประเภทงาน" value={task.jobType?.name} />
              <FieldRow label="รายละเอียดงาน" value={task.jobDetail?.name} />
              <FieldRow label="ฟีดเดอร์" value={task.feeder?.code} />
              <FieldRow label="สถานี" value={task.feeder?.station?.name} />
              <FieldRow label="จุดรวมงาน" value={task.feeder?.station?.operationCenter?.name} />
              <FieldRow label="เลขเสา" value={task.numPole} />
              <FieldRow label="รหัสอุปกรณ์" value={task.deviceCode} />
              <FieldRow label="บันทึกเมื่อ" value={formatThaiDateTime(task.createdAt)} />
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-4">
              <p className="text-sm font-bold text-gray-900">รายละเอียดเพิ่มเติม</p>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">{task.detail || 'ไม่มีรายละเอียดเพิ่มเติม'}</p>
            </div>

            {(task.latitude != null || task.longitude != null) && (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/60 p-4 text-sm text-gray-700">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <p className="font-bold text-gray-900">พิกัดหน้างาน</p>
                  <p className="mt-1">ละติจูด {task.latitude ?? '-'} · ลองจิจูด {task.longitude ?? '-'}</p>
                </div>
              </div>
            )}

            <PhotoStrip title="รูปก่อนดำเนินการ" urls={task.urlsBefore ?? []} />
            <PhotoStrip title="รูปหลังดำเนินการ" urls={task.urlsAfter ?? []} />
          </div>
        )}

        <DrawerFooter className="shrink-0 border-t border-gray-100 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <DrawerClose asChild>
            <Button variant="outline" className="h-11 rounded-xl">ปิด</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default function TaskDailyPage() {
  const [workDate, setWorkDate] = useState(today)
  const [teamId, setTeamId] = useState('')
  const [jobTypeId, setJobTypeId] = useState('')
  const [feederId, setFeederId] = useState('')
  const [search, setSearch] = useState('')
  const [selectedTask, setSelectedTask] = useState<TaskDailyFiltered | null>(null)

  const filters = useMemo(
    () => ({
      ...(workDate ? { workDate } : {}),
      ...(teamId ? { teamId } : {}),
      ...(jobTypeId ? { jobTypeId } : {}),
      ...(feederId ? { feederId } : {}),
    }),
    [workDate, teamId, jobTypeId, feederId],
  )

  const { data: tasks = [], isLoading, isError, error, refetch, isFetching } = useAdminTaskDailies(filters)
  const { data: teams = [] } = useTeams()
  const { data: jobTypes = [] } = useJobTypes()
  const { data: feeders = [] } = useFeeders()

  const filteredTasks = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return tasks
    return tasks.filter((task) => getTaskSearchText(task).includes(keyword))
  }, [tasks, search])

  const hasActiveFilter = !!(workDate || teamId || jobTypeId || feederId || search)

  const resetFilters = () => {
    setWorkDate('')
    setTeamId('')
    setJobTypeId('')
    setFeederId('')
    setSearch('')
  }

  return (
    <PageShell className="space-y-5 sm:space-y-6" maxWidth="xl">
      <PageHero
        eyebrow={<span>จัดการระบบ</span>}
        icon={<ClipboardList className="h-6 w-6 text-amber-200" />}
        title="งานทั้งหมด"
        description="ค้นหาและตรวจสอบรายงานงานประจำวันจากทีมงานด้วยตัวกรองที่มีอยู่ในระบบ"
      />

      <Card className="card-glass border-white/70">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-black text-gray-900">
            <Filter className="h-5 w-5 text-blue-600" />
            ตัวกรองงาน
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <label className="space-y-2">
              <span className="text-sm font-bold text-gray-700">วันที่</span>
              <Input type="date" value={workDate} onChange={(event) => setWorkDate(event.target.value)} className="h-11 bg-white" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold text-gray-700">ทีม</span>
              <select value={teamId} onChange={(event) => setTeamId(event.target.value)} className="h-11 w-full rounded-md border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 shadow-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                <option value="">ทุกทีม</option>
                {teams.map((team) => (
                  <option key={team.id} value={String(team.id)}>{team.name}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold text-gray-700">ประเภทงาน</span>
              <select value={jobTypeId} onChange={(event) => setJobTypeId(event.target.value)} className="h-11 w-full rounded-md border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 shadow-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                <option value="">ทุกประเภท</option>
                {jobTypes.map((jobType) => (
                  <option key={jobType.id} value={String(jobType.id)}>{jobType.name}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold text-gray-700">ฟีดเดอร์</span>
              <select value={feederId} onChange={(event) => setFeederId(event.target.value)} className="h-11 w-full rounded-md border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 shadow-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                <option value="">ทุกฟีดเดอร์</option>
                {feeders.map((feeder) => (
                  <option key={feeder.id} value={String(feeder.id)}>{feeder.code}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold text-gray-700">ค้นหา</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ทีม งาน ฟีดเดอร์" className="h-11 bg-white pl-9" />
              </div>
            </label>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-gray-600">
              แสดง {filteredTasks.length.toLocaleString('th-TH')} รายการ จากข้อมูลที่ดึงมา {tasks.length.toLocaleString('th-TH')} รายการ
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="h-11 flex-1 rounded-xl sm:flex-none" onClick={() => refetch()} disabled={isFetching}>
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                รีเฟรช
              </Button>
              <Button type="button" variant="ghost" className="h-11 flex-1 rounded-xl sm:flex-none" onClick={resetFilters} disabled={!hasActiveFilter}>
                ล้างตัวกรอง
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isError && (
        <Card className="border-red-100 bg-red-50">
          <CardContent className="p-4 text-sm font-medium text-red-700">
            ไม่สามารถโหลดข้อมูลงานได้ {error instanceof Error ? error.message : ''}
          </CardContent>
        </Card>
      )}

      <Card className="card-glass border-white/70">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-black text-gray-900">
            <CalendarDays className="h-5 w-5 text-blue-600" />
            รายการงาน
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-36 animate-pulse rounded-3xl bg-gray-100" />
              ))}
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="flex min-h-52 flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50/70 p-6 text-center">
              <ClipboardList className="h-10 w-10 text-gray-400" />
              <p className="mt-3 text-lg font-black text-gray-900">ไม่พบงานตามตัวกรอง</p>
              <p className="mt-1 text-sm font-medium text-gray-500">ปรับวันที่ ทีม ประเภทงาน ฟีดเดอร์ หรือคำค้นหา แล้วลองอีกครั้ง</p>
            </div>
          ) : (
            <>
              <div className="grid gap-3 lg:hidden">
                {filteredTasks.map((task) => (
                  <button
                    type="button"
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="min-h-28 rounded-3xl border border-gray-100 bg-white/85 p-4 text-left shadow-sm transition hover:border-sky-200 hover:bg-sky-50/70 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-blue-700">#{task.id} · {formatThaiDate(task.workDate)}</p>
                        <h2 className="mt-1 line-clamp-2 text-base font-black text-gray-900">{task.jobDetail?.name || task.jobType?.name || 'ไม่ระบุรายละเอียดงาน'}</h2>
                        <p className="mt-1 truncate text-sm font-medium text-gray-600">{task.team?.name || 'ไม่ระบุทีม'}</p>
                      </div>
                      <Badge variant="outline" className="shrink-0 border-amber-200 bg-amber-50 text-amber-700">
                        {(task.urlsBefore?.length ?? 0) + (task.urlsAfter?.length ?? 0)} รูป
                      </Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-gray-600">
                      <span className="rounded-full bg-gray-100 px-2.5 py-1">{task.jobType?.name || 'ไม่ระบุประเภท'}</span>
                      <span className="rounded-full bg-gray-100 px-2.5 py-1">{task.feeder?.code || 'ไม่มีฟีดเดอร์'}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="hidden overflow-hidden rounded-3xl border border-gray-100 bg-white/90 lg:block">
                <table className="w-full table-fixed text-left text-sm">
                  <thead className="bg-gray-50 text-xs font-black uppercase tracking-[0.12em] text-gray-500">
                    <tr>
                      <th className="w-32 px-4 py-3">วันที่</th>
                      <th className="w-44 px-4 py-3">ทีม</th>
                      <th className="w-56 px-4 py-3">ประเภทงาน</th>
                      <th className="px-4 py-3">รายละเอียดงาน</th>
                      <th className="w-36 px-4 py-3">ฟีดเดอร์</th>
                      <th className="w-24 px-4 py-3 text-center">รูป</th>
                      <th className="w-28 px-4 py-3 text-right">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTasks.map((task) => (
                      <tr key={task.id} className="align-top transition hover:bg-sky-50/60">
                        <td className="px-4 py-4 font-bold text-gray-900">{formatThaiDate(task.workDate)}</td>
                        <td className="px-4 py-4 text-gray-700">{task.team?.name || '-'}</td>
                        <td className="px-4 py-4 text-gray-700">{task.jobType?.name || '-'}</td>
                        <td className="px-4 py-4">
                          <p className="font-bold text-gray-900">{task.jobDetail?.name || '-'}</p>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">{task.detail || 'ไม่มีรายละเอียดเพิ่มเติม'}</p>
                        </td>
                        <td className="px-4 py-4 text-gray-700">{task.feeder?.code || '-'}</td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center justify-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700">
                            <ImageIcon className="h-3.5 w-3.5" />
                            {(task.urlsBefore?.length ?? 0) + (task.urlsAfter?.length ?? 0)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => setSelectedTask(task)}>
                            ดูรายละเอียด
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <TaskDetailDrawer task={selectedTask} onClose={() => setSelectedTask(null)} />
    </PageShell>
  )
}
