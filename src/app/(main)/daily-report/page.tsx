'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import TaskDailyForm from '@/features/task-daily/components/task-daily-form'
import { FormSkeleton } from '@/components/ui/skeletons'
import { useAdminTaskDailies, useFeeders, useJobDetails, useJobTypes, useTeams } from '@/hooks/useQueries'
import { useAuth } from '@/hooks/useAuth'
import { PageHeader } from '@/shared/page-header'
import type { Team } from '@/types/query-types'
import { filterReports, normalizeTaskDailyReport, type ReportSourceFilter, type ReportStatusFilter } from '@/features/work-report/work-report-view-model'
import type { TaskDailySourceType } from '@/types/task-daily'

const todayIso = () => new Date().toISOString().slice(0, 10)

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
    <div className="bg-slate-50 px-3 py-4 sm:px-4 lg:px-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <PageHeader
          title="บันทึกงาน"
          description="ใช้ฟอร์มเดียวกันสำหรับบันทึกจาก Calendar, Board, Planning หรือ Monthly Plan โดยข้อมูลที่ทำจริงต้องกรอกเอง"
          action={!isViewer ? <a className="inline-flex min-h-11 items-center rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white" href="#daily-report-form">บันทึกงานใหม่</a> : undefined}
        />

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-6">
            <button className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm text-slate-700" onClick={() => setWorkDate(todayIso())} type="button">วันนี้</button>
            <label className="space-y-1 text-sm font-semibold text-slate-700 lg:contents">
              <span className="lg:sr-only">วันที่บันทึกงาน</span>
              <input aria-label="วันที่บันทึกงาน" name="workDate" className="min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" onChange={(event) => setWorkDate(event.target.value)} type="date" value={workDate} />
            </label>
            <button className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm text-slate-700" onClick={() => setWorkDate(shiftDate(workDate, -1))} type="button">วันก่อนหน้า</button>
            <button className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm text-slate-700" onClick={() => setWorkDate(shiftDate(workDate, 1))} type="button">วันถัดไป</button>
            <label className="space-y-1 text-sm font-semibold text-slate-700 lg:contents">
              <span className="lg:sr-only">แหล่งที่มาของงาน</span>
              <select aria-label="แหล่งที่มาของงาน" name="sourceFilter" className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" onChange={(event) => setSource(event.target.value as ReportSourceFilter)} value={source}>
                <option value="all">งานที่วางแผนไว้ทั้งหมด</option>
                <option value="planning">งานจาก Planning</option>
                <option value="monthly-plan">งานจาก Monthly Plan</option>
                <option value="large-work">งานระดมทีม</option>
                <option value="adhoc">งานนอกแผน</option>
              </select>
            </label>
            <label className="space-y-1 text-sm font-semibold text-slate-700 lg:contents">
              <span className="lg:sr-only">สถานะบันทึกงาน</span>
              <select aria-label="สถานะบันทึกงาน" name="statusFilter" className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" onChange={(event) => setStatus(event.target.value as ReportStatusFilter)} value={status}>
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
                <select aria-label="ทีมที่แสดง" name="teamFilter" className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" onChange={(event) => setTeamFilter(event.target.value)} value={teamFilter}>
                  <option value="all">ทุกทีม</option>
                  {(teams || []).map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                </select>
              </label>
            ) : (
              <div className="flex min-h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">ล็อกทีมของฉัน</div>
            )}
            <button className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-700" onClick={() => void refetch()} type="button">ลองใหม่/รีเฟรช</button>
            {isViewer && <div className="flex min-h-11 items-center rounded-xl bg-slate-100 px-3 text-sm text-slate-600">viewer อ่านอย่างเดียว ไม่มีปุ่มสร้าง/แก้ไข/ลบ</div>}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,65fr)_minmax(22rem,35fr)]">
          <section id="daily-report-form" className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">เลือกงานที่วางแผนไว้</h2>
              <p className="mt-1 text-sm text-slate-500">เลือกจาก Planning หรือ Monthly Plan เพื่อเติมข้อมูลงานตั้งต้น แต่รายละเอียดงานจริงและผลการปฏิบัติงานต้องกรอกเอง</p>
            </div>
            {isViewer ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">โหมดอ่านอย่างเดียว</h2>
                <p className="mt-2 text-sm text-slate-500">viewer ดูบันทึกงานและรายละเอียดได้ แต่ไม่มีสิทธิ์สร้าง แก้ไข หรือลบ</p>
                <Link className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-blue-200 px-4 text-sm font-semibold text-blue-700" href="/work-report">ไปหน้ารายงานการปฏิบัติงาน</Link>
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

          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:sticky xl:top-20 xl:self-start">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">รายการบันทึก</h2>
                <p className="text-sm text-slate-500">{new Date(`${workDate}T00:00:00`).toLocaleDateString('th-TH', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">{reports.length} รายการ</span>
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
                  <article className="rounded-2xl border border-slate-200 p-3" key={report.id}>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">{report.title}</h3>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">{report.statusLabel}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{report.location}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{report.summary}</p>
                    <Link className="mt-3 inline-flex min-h-11 items-center rounded-xl border border-blue-200 px-3 text-sm font-medium text-blue-700" href={`/work-report?reportId=${report.id}`}>ดูรายละเอียด</Link>
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
  return <div className="mt-4 rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">{text}</div>
}

function shiftDate(isoDate: string, delta: number): string {
  const date = new Date(`${isoDate}T00:00:00`)
  date.setDate(date.getDate() + delta)
  return date.toISOString().slice(0, 10)
}
