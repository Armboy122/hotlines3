'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CalendarDays, ChevronLeft, ChevronRight, History, LockKeyhole, Plus, RefreshCw } from 'lucide-react'
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

export default function DailyReportPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const queryWorkDate = searchParams.get('workDate')
  const querySourceType = searchParams.get('sourceType')
  const querySourceId = Number(searchParams.get('sourceId') ?? 0)
  const initialPlanSource = useMemo(() => (
    (querySourceType === 'team_plan' || querySourceType === 'monthly_plan' || querySourceType === 'large_work') && querySourceId > 0
      ? { sourceType: querySourceType as TaskDailySourceType, sourceId: querySourceId, workDate: queryWorkDate || undefined }
      : null
  ), [querySourceId, querySourceType, queryWorkDate])
  const isViewer = user?.role === 'viewer'
  const [mode, setMode] = useState<'create' | 'history'>(isViewer ? 'history' : 'create')
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
  const { data: taskRows = [], isLoading: reportsLoading, isError, refetch } = useAdminTaskDailies({ workDate, teamId: scopedTeamId })
  const reports = useMemo(() => filterReports(taskRows.map(normalizeTaskDailyReport), { source, status }), [source, status, taskRows])
  const filteredTeams = user?.role !== 'super_admin' && user?.teamId ? (teams || []).filter((team: Team) => team.id.toString() === user.teamId?.toString()) : (teams || [])

  if (jt || jd || fd || tm) return <FormSkeleton />

  return (
    <div className="px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <PageHeader title={isViewer ? 'รายการบันทึกงาน' : 'บันทึกงาน'} description={isViewer ? 'ดูรายการบันทึกงานย้อนหลังตามวันที่และทีมที่คุณมีสิทธิ์เข้าถึง' : 'เลือกงานที่วางแผนไว้ หรืองานนอกแผน แล้วบันทึกผลการปฏิบัติงาน'} />

        {!isViewer && (
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1" role="tablist" aria-label="โหมดบันทึกงาน">
            <ModeButton active={mode === 'create'} icon={<Plus className="h-4 w-4" />} label="บันทึกใหม่" onClick={() => setMode('create')} />
            <ModeButton active={mode === 'history'} icon={<History className="h-4 w-4" />} label="รายการย้อนหลัง" onClick={() => setMode('history')} />
          </div>
        )}

        {mode === 'create' && !isViewer ? (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
            <section id="daily-report-form" aria-label="ฟอร์มบันทึกงาน"><TaskDailyForm jobTypes={jobTypes || []} jobDetails={jobDetails || []} feeders={feeders || []} teams={filteredTeams} initialPlanSource={initialPlanSource} /></section>
            <aside className="hidden rounded-xl border border-slate-200 bg-white p-4 xl:sticky xl:top-20 xl:block xl:self-start">
              <RecentRecords reports={reports} workDate={workDate} isError={isError} isLoading={reportsLoading} />
              <button type="button" onClick={() => setMode('history')} className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">ดูและกรองรายการย้อนหลัง</button>
            </aside>
          </div>
        ) : (
          <section className="space-y-4" aria-label="รายการบันทึกงานย้อนหลัง">
            <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                <DateControl workDate={workDate} onChange={setWorkDate} />
                <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <label className="space-y-1 text-sm font-semibold text-slate-700"><span>แหล่งที่มา</span><select className={controlClassName} value={source} onChange={(event) => setSource(event.target.value as ReportSourceFilter)}><option value="all">ทั้งหมด</option><option value="planning">งานจาก Planning</option><option value="monthly-plan">งานจากแผนประจำเดือน</option><option value="large-work">งานระดมทีม</option><option value="adhoc">งานนอกแผน</option></select></label>
                  <label className="space-y-1 text-sm font-semibold text-slate-700"><span>สถานะ</span><select className={controlClassName} value={status} onChange={(event) => setStatus(event.target.value as ReportStatusFilter)}><option value="all">ทั้งหมด</option><option value="draft">ร่าง</option><option value="saved">บันทึกแล้ว</option></select></label>
                  {canSelectTeam ? <label className="space-y-1 text-sm font-semibold text-slate-700"><span>ทีม</span><select className={controlClassName} value={teamFilter} onChange={(event) => setTeamFilter(event.target.value)}><option value="all">ทุกทีม</option>{(teams || []).map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label> : <div className="flex min-h-11 items-center gap-2 text-sm text-slate-600"><LockKeyhole className="h-4 w-4 text-blue-700" />ทีมของฉัน</div>}
                </div>
                <button type="button" onClick={() => void refetch()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw className="h-4 w-4" />รีเฟรช</button>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4"><RecentRecords reports={reports} workDate={workDate} isError={isError} isLoading={reportsLoading} full /></div>
          </section>
        )}
      </div>
    </div>
  )
}

function ModeButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return <button type="button" role="tab" aria-selected={active} onClick={onClick} className={`inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold ${active ? 'bg-blue-700 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>{icon}{label}</button>
}

function DateControl({ workDate, onChange }: { workDate: string; onChange: (date: string) => void }) {
  return <div className="flex flex-wrap items-end gap-2"><label className="space-y-1 text-sm font-semibold text-slate-700"><span>วันที่บันทึกงาน</span><input aria-label="วันที่บันทึกงาน" className={`${controlClassName} w-[10.5rem]`} type="date" value={workDate} onChange={(event) => onChange(event.target.value)} /></label><button type="button" aria-label="วันก่อนหน้า" onClick={() => onChange(shiftDate(workDate, -1))} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-3 text-slate-700 hover:bg-slate-50"><ChevronLeft className="h-4 w-4" /></button><button type="button" aria-label="วันนี้" onClick={() => onChange(todayIso())} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><CalendarDays className="h-4 w-4" />วันนี้</button><button type="button" aria-label="วันถัดไป" onClick={() => onChange(shiftDate(workDate, 1))} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-3 text-slate-700 hover:bg-slate-50"><ChevronRight className="h-4 w-4" /></button></div>
}

function RecentRecords({ reports, workDate, isLoading, isError, full = false }: { reports: ReturnType<typeof normalizeTaskDailyReport>[]; workDate: string; isLoading: boolean; isError: boolean; full?: boolean }) {
  const formattedDate = new Date(`${workDate}T00:00:00`).toLocaleDateString('th-TH', { day: '2-digit', month: 'long', year: 'numeric' })
  return <><div className="flex items-start justify-between gap-3"><div><h2 className="text-base font-semibold text-slate-900">{full ? 'รายการบันทึกงาน' : 'บันทึกล่าสุด'}</h2><p className="text-sm text-slate-500">{formattedDate}</p></div><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">{reports.length} รายการ</span></div>{isLoading ? <ReportPanelState text="กำลังโหลดรายการบันทึก" /> : isError ? <ReportPanelState text="โหลดข้อมูลบันทึกงานไม่สำเร็จ กรุณารีเฟรชเพื่อลองอีกครั้ง" /> : reports.length === 0 ? <ReportPanelState text="ยังไม่มีบันทึกงานในวันที่เลือก" /> : <div className={`mt-4 grid gap-3 ${full ? 'md:grid-cols-2 xl:grid-cols-3' : ''}`}>{reports.map((report) => <article className="rounded-lg border border-slate-200 p-3" key={report.id}><div className="flex items-start justify-between gap-2"><h3 className="text-sm font-semibold text-slate-900">{report.title}</h3><span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{report.statusLabel}</span></div><p className="mt-2 text-sm text-slate-600">{report.location}</p><p className="mt-1 line-clamp-2 text-xs text-slate-500">{report.summary}</p><Link className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-blue-700 hover:underline" href={`/work-report?reportId=${report.id}`}>ดูรายละเอียด</Link></article>)}</div>}</>
}

function ReportPanelState({ text }: { text: string }) { return <div className="mt-4 rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-600">{text}</div> }
function shiftDate(isoDate: string, delta: number) { const date = new Date(`${isoDate}T00:00:00`); date.setDate(date.getDate() + delta); return date.toISOString().slice(0, 10) }
