'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CalendarDays, ChevronLeft, ChevronRight, ClipboardList, LockKeyhole, Plus, RefreshCw } from 'lucide-react'
import TaskDailyForm from '@/features/task-daily/components/task-daily-form'
import { FormSkeleton } from '@/components/ui/skeletons'
import { useAdminTaskDailies, useFeeders, useJobDetails, useJobTypes, useTeams } from '@/hooks/useQueries'
import { useAuth } from '@/hooks/useAuth'
import { PageHeader } from '@/shared/page-header'
import type { Team } from '@/types/query-types'
import { filterReports, normalizeTaskDailyReport, type ReportSourceFilter, type ReportStatusFilter } from '@/features/work-report/work-report-view-model'
import type { TaskDailySourceType } from '@/types/task-daily'

const todayIso = () => new Date().toISOString().slice(0, 10)
const controlClassName = 'smart-home-control smart-home-focus min-h-11 w-full px-3 text-sm'
const primaryActionClassName = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-700 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition-colors hover:bg-blue-800'

export default function DailyReportPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const queryWorkDate = searchParams.get('workDate')
  const querySourceType = searchParams.get('sourceType')
  const querySourceId = Number(searchParams.get('sourceId') ?? 0)
  const initialPlanSource = useMemo(() => {
    if (
      (querySourceType === 'team_plan' || querySourceType === 'monthly_plan' || querySourceType === 'large_work') &&
      querySourceId > 0
    ) {
      return {
        sourceType: querySourceType as TaskDailySourceType,
        sourceId: querySourceId,
        workDate: queryWorkDate || undefined,
      }
    }
    return null
  }, [querySourceId, querySourceType, queryWorkDate])
  const [workDate, setWorkDate] = useState(queryWorkDate || todayIso())
  const [source, setSource] = useState<ReportSourceFilter>('all')
  const [status, setStatus] = useState<ReportStatusFilter>('all')
  const [teamFilter, setTeamFilter] = useState('all')

  const { data: jobTypes, isLoading: jt } = useJobTypes()
  const { data: jobDetails, isLoading: jd } = useJobDetails()
  const { data: feeders, isLoading: fd } = useFeeders()
  const { data: teams, isLoading: tm } = useTeams()

  const canSelectTeam = user?.role === 'super_admin'
  const scopedTeamId = canSelectTeam && teamFilter !== 'all' ? teamFilter : user?.teamId ? String(user.teamId) : undefined
  const { data: taskRows = [], isLoading: reportsLoading, isError, refetch } = useAdminTaskDailies({
    workDate,
    teamId: scopedTeamId,
  })

  const reports = useMemo(
    () => filterReports(taskRows.map(normalizeTaskDailyReport), { source, status }),
    [source, status, taskRows],
  )

  if (jt || jd || fd || tm) {
    return <FormSkeleton />
  }

  const filteredTeams = user?.role !== 'super_admin' && user?.teamId
    ? (teams || []).filter((t: Team) => t.id.toString() === user.teamId?.toString())
    : (teams || [])

  const isViewer = user?.role === 'viewer'

  return (
    <div className="px-3 py-4 sm:px-4 lg:px-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <PageHeader
          title="บันทึกงาน"
          description="ใช้ฟอร์มเดียวกันสำหรับบันทึกจาก Calendar, Board, Planning หรือ Monthly Plan โดยข้อมูลที่ทำจริงต้องกรอกเอง"
          action={!isViewer ? <a className={primaryActionClassName} href="#daily-report-form"><Plus className="h-4 w-4" aria-hidden="true" />บันทึกงานใหม่</a> : undefined}
        />

        <section className="smart-home-card p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-6">
            <button className={`${controlClassName} inline-flex items-center justify-center gap-2 font-semibold`} onClick={() => setWorkDate(todayIso())} type="button"><CalendarDays className="h-4 w-4" aria-hidden="true" />วันนี้</button>
            <label className="space-y-1 text-sm font-semibold text-slate-700 lg:contents">
              <span className="lg:sr-only">วันที่บันทึกงาน</span>
              <input aria-label="วันที่บันทึกงาน" name="workDate" className={controlClassName} onChange={(event) => setWorkDate(event.target.value)} type="date" value={workDate} />
            </label>
            <button className={`${controlClassName} inline-flex items-center justify-center gap-2 font-semibold`} onClick={() => setWorkDate(shiftDate(workDate, -1))} type="button"><ChevronLeft className="h-4 w-4" aria-hidden="true" />วันก่อนหน้า</button>
            <button className={`${controlClassName} inline-flex items-center justify-center gap-2 font-semibold`} onClick={() => setWorkDate(shiftDate(workDate, 1))} type="button">วันถัดไป<ChevronRight className="h-4 w-4" aria-hidden="true" /></button>
            <label className="space-y-1 text-sm font-semibold text-slate-700 lg:contents">
              <span className="lg:sr-only">แหล่งที่มาของงาน</span>
              <select aria-label="แหล่งที่มาของงาน" name="sourceFilter" className={controlClassName} onChange={(event) => setSource(event.target.value as ReportSourceFilter)} value={source}>
                <option value="all">งานที่วางแผนไว้ทั้งหมด</option>
                <option value="planning">งานจาก Planning</option>
                <option value="monthly-plan">งานจาก Monthly Plan</option>
                <option value="large-work">งานระดมทีม</option>
                <option value="adhoc">งานนอกแผน</option>
              </select>
            </label>
            <label className="space-y-1 text-sm font-semibold text-slate-700 lg:contents">
              <span className="lg:sr-only">สถานะบันทึกงาน</span>
              <select aria-label="สถานะบันทึกงาน" name="statusFilter" className={controlClassName} onChange={(event) => setStatus(event.target.value as ReportStatusFilter)} value={status}>
                <option value="all">สถานะทั้งหมด</option>
                <option value="draft">ยังไม่ได้บันทึก/ร่าง</option>
                <option value="saved">บันทึกแล้ว</option>
              </select>
            </label>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            {canSelectTeam ? (
              <label className="space-y-1 text-sm font-semibold text-slate-700 md:contents">
                <span className="md:sr-only">ทีมที่แสดง</span>
                <select aria-label="ทีมที่แสดง" name="teamFilter" className={controlClassName} onChange={(event) => setTeamFilter(event.target.value)} value={teamFilter}>
                  <option value="all">ทุกทีม</option>
                  {(teams || []).map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                </select>
              </label>
            ) : (
              <div className="smart-home-panel flex min-h-11 items-center gap-2 px-3 text-sm text-slate-600"><LockKeyhole className="h-4 w-4 text-blue-600" aria-hidden="true" />ล็อกทีมของฉัน</div>
            )}
            <button className={`${controlClassName} inline-flex items-center justify-center gap-2 font-semibold`} onClick={() => void refetch()} type="button"><RefreshCw className="h-4 w-4" aria-hidden="true" />ลองใหม่/รีเฟรช</button>
            {isViewer && <div className="smart-home-panel flex min-h-11 items-center px-3 text-sm text-slate-600">viewer อ่านอย่างเดียว ไม่มีปุ่มสร้าง/แก้ไข/ลบ</div>}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,65fr)_minmax(22rem,35fr)]">
          <section id="daily-report-form" className="space-y-4">
            <div className="smart-home-card p-4">
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-900"><ClipboardList className="h-5 w-5 text-blue-700" aria-hidden="true" />เลือกงานที่วางแผนไว้</h2>
              <p className="mt-1 text-sm text-slate-500">เลือกจาก Planning หรือ Monthly Plan เพื่อเติมข้อมูลงานตั้งต้น แต่รายละเอียดงานจริงและผลการปฏิบัติงานต้องกรอกเอง</p>
            </div>
            {isViewer ? (
              <div className="smart-home-card p-8 text-center">
                <h2 className="text-lg font-semibold text-slate-900">โหมดอ่านอย่างเดียว</h2>
                <p className="mt-2 text-sm text-slate-500">viewer ดูบันทึกงานและรายละเอียดได้ แต่ไม่มีสิทธิ์สร้าง แก้ไข หรือลบ</p>
                <Link className="smart-home-control mt-4 inline-flex min-h-11 items-center justify-center px-4 text-sm font-semibold text-blue-700" href="/work-report">ไปหน้ารายงานการปฏิบัติงาน</Link>
              </div>
            ) : (
              <TaskDailyForm
                jobTypes={jobTypes || []}
                jobDetails={jobDetails || []}
                feeders={feeders || []}
                teams={filteredTeams}
                initialPlanSource={initialPlanSource}
              />
            )}
          </section>

          <aside className="smart-home-card p-4 xl:sticky xl:top-20 xl:self-start">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">รายการบันทึก</h2>
                <p className="text-sm text-slate-500">{new Date(`${workDate}T00:00:00`).toLocaleDateString('th-TH', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
              <span className="smart-home-chip text-blue-700">{reports.length} รายการ</span>
            </div>
            {reportsLoading ? (
              <ReportPanelState text="กำลังโหลดรายการบันทึก" />
            ) : isError ? (
              <ReportPanelState text="โหลดข้อมูลบันทึกงานไม่สำเร็จ" />
            ) : reports.length === 0 ? (
              <ReportPanelState text="ยังไม่มีบันทึกงานในวันนี้" />
            ) : (
              <div className="mt-4 space-y-3">
                {reports.map((report) => (
                  <article className="smart-home-card-hover p-3" key={report.id}>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">{report.title}</h3>
                      <span className="smart-home-chip px-2 py-1 font-medium">{report.statusLabel}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{report.location}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{report.summary}</p>
                    <Link className="smart-home-control mt-3 inline-flex min-h-11 items-center px-3 text-sm font-medium text-blue-700" href={`/work-report?reportId=${report.id}`}>ดูรายละเอียด</Link>
                  </article>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}

function ReportPanelState({ text }: { text: string }) {
  return <div className="smart-home-panel mt-4 p-6 text-center text-sm text-slate-500">{text}</div>
}

function shiftDate(isoDate: string, delta: number): string {
  const date = new Date(`${isoDate}T00:00:00`)
  date.setDate(date.getDate() + delta)
  return date.toISOString().slice(0, 10)
}
