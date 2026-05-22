'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  LockKeyhole,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/shared/page-header'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/hooks/useAuth'
import { useDeleteTaskDaily, useTaskDailies, useTeams } from '@/hooks/useQueries'
import { cn } from '@/lib/utils'
import {
  buildReportSummary,
  canMutateReport,
  filterReports,
  flattenTaskGroups,
  formatThaiDate,
  getScopedTeamId,
  type ReportSourceFilter,
  type ReportStatusFilter,
  type WorkReportItem,
} from './work-report-view-model'

const statusOptions: Array<{ value: ReportStatusFilter; label: string }> = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'draft', label: 'บันทึกร่าง' },
  { value: 'saved', label: 'บันทึกแล้ว' },
]

const sourceOptions: Array<{ value: ReportSourceFilter; label: string }> = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'planning', label: 'Planning' },
  { value: 'monthly-plan', label: 'Monthly Plan' },
  { value: 'large-work', label: 'งานระดมทีม' },
  { value: 'adhoc', label: 'งานนอกแผน' },
]

const controlClassName = 'smart-home-control smart-home-focus min-h-11 w-full px-3 text-sm'
const primaryActionClassName = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-700 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition-colors hover:bg-blue-800'

export function WorkReportClient() {
  const { user } = useAuth()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [status, setStatus] = useState<ReportStatusFilter>('all')
  const [source, setSource] = useState<ReportSourceFilter>('all')
  const [teamFilter, setTeamFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedReport, setSelectedReport] = useState<WorkReportItem | null>(null)
  const [deleteReport, setDeleteReport] = useState<WorkReportItem | null>(null)

  const { data: teams = [] } = useTeams()
  const scopedTeamId = getScopedTeamId({ role: user?.role, teamId: user?.teamId }, teamFilter)
  const { data, isLoading, isError, refetch } = useTaskDailies({
    year: String(year),
    month: String(month).padStart(2, '0'),
    teamId: scopedTeamId,
  })
  const deleteTask = useDeleteTaskDaily()
  const canShowReliableReportSummary = !isLoading && !isError && data != null

  const allReports = useMemo(() => flattenTaskGroups(data), [data])
  const visibleReports = useMemo(
    () => filterReports(allReports, { status, source, teamId: scopedTeamId ?? 'all', search }),
    [allReports, scopedTeamId, search, source, status],
  )
  const summary = useMemo(
    () => buildReportSummary(visibleReports, { role: user?.role, teamId: user?.teamId }, teams.map((team) => team.id)),
    [teams, user?.role, user?.teamId, visibleReports],
  )

  const canSelectTeam = user?.role === 'super_admin' || user?.role === 'viewer'
  const canWrite = user?.role !== 'viewer'

  function shiftMonth(delta: number) {
    const next = new Date(year, month - 1 + delta, 1)
    setYear(next.getFullYear())
    setMonth(next.getMonth() + 1)
  }

  async function confirmDeleteReport() {
    if (!deleteReport) return
    const report = deleteReport
    if (!canMutateReport(user?.role, user?.teamId, report.teamId)) return
    await deleteTask.mutateAsync(String(report.id))
    toast.success('ลบรายงานเรียบร้อย')
    setSelectedReport(null)
    setDeleteReport(null)
  }

  return (
    <main className="min-h-screen px-3 py-4 pb-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <PageHeader
          title="รายงานการปฏิบัติงาน"
          description="ดูรายการงานที่ปฏิบัติแล้วจากข้อมูลบันทึกงาน พร้อมสรุปตามตัวกรอง"
          action={canWrite ? <Link className={primaryActionClassName} href="/daily-report"><Plus className="h-4 w-4" aria-hidden="true" />บันทึกงาน</Link> : undefined}
        />

        {user?.role === 'viewer' && (
          <div className="smart-home-panel flex items-start gap-2 p-4 text-sm text-slate-600">
            <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
            โหมดอ่านอย่างเดียว: ผู้บริหารดูรายละเอียดรายงานได้ แต่ไม่มีปุ่มแก้ไข ลบ หรือส่งออกข้อมูล
          </div>
        )}

        <section className="smart-home-card p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-6">
            <button className={`${controlClassName} inline-flex items-center justify-center gap-2 font-semibold`} onClick={() => shiftMonth(-1)} type="button"><ChevronLeft className="h-4 w-4" aria-hidden="true" />เดือนก่อนหน้า</button>
            <div className="smart-home-panel flex min-h-11 items-center justify-center gap-2 px-3 text-sm font-semibold text-blue-900">
              <CalendarDays className="h-4 w-4 text-blue-700" aria-hidden="true" />
              {new Date(year, month - 1, 1).toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
            </div>
            <button className={`${controlClassName} inline-flex items-center justify-center gap-2 font-semibold`} onClick={() => shiftMonth(1)} type="button">เดือนถัดไป<ChevronRight className="h-4 w-4" aria-hidden="true" /></button>
            <button className={`${controlClassName} inline-flex items-center justify-center gap-2 font-semibold`} onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth() + 1) }} type="button"><RotateCcw className="h-4 w-4" aria-hidden="true" />เดือนนี้</button>
            <label className="space-y-1 text-sm font-semibold text-slate-700 lg:contents">
              <span className="lg:sr-only">สถานะรายงาน</span>
              <select aria-label="สถานะรายงาน" name="statusFilter" className={controlClassName} onChange={(event) => setStatus(event.target.value as ReportStatusFilter)} value={status}>
                {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className="space-y-1 text-sm font-semibold text-slate-700 lg:contents">
              <span className="lg:sr-only">แหล่งที่มารายงาน</span>
              <select aria-label="แหล่งที่มารายงาน" name="sourceFilter" className={controlClassName} onChange={(event) => setSource(event.target.value as ReportSourceFilter)} value={source}>
                {sourceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="space-y-1 text-sm font-semibold text-slate-700 md:contents">
              <span className="md:sr-only">ค้นหารายงาน</span>
              <span className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input aria-label="ค้นหารายงาน" name="reportSearch" autoComplete="off" className={`${controlClassName} pl-9`} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหาชื่องาน ทีม สถานที่ หรือสรุปผล" value={search} />
              </span>
            </label>
            {canSelectTeam ? (
              <label className="space-y-1 text-sm font-semibold text-slate-700 md:contents">
                <span className="md:sr-only">ทีมที่แสดง</span>
                <select aria-label="ทีมที่แสดง" name="teamFilter" className={controlClassName} onChange={(event) => setTeamFilter(event.target.value)} value={teamFilter}>
                  <option value="all">ทุกทีมที่มองเห็นได้</option>
                  {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                </select>
              </label>
            ) : (
              <div className="smart-home-panel flex min-h-11 items-center gap-2 px-3 text-sm text-slate-600"><LockKeyhole className="h-4 w-4 text-blue-600" aria-hidden="true" />ล็อกทีมของฉัน</div>
            )}
            <button className={`${controlClassName} inline-flex items-center justify-center gap-2 font-semibold`} onClick={() => void refetch()} type="button"><RefreshCw className="h-4 w-4" aria-hidden="true" />ลองใหม่/รีเฟรช</button>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryCard label="บันทึกทั้งหมด" value={canShowReliableReportSummary ? summary.total : '—'} tone="blue" />
          <SummaryCard label="บันทึกแล้ว" value={canShowReliableReportSummary ? summary.saved : '—'} tone="green" />
          <SummaryCard label="บันทึกร่าง" value={canShowReliableReportSummary ? summary.drafts : '—'} tone="amber" />
          <SummaryCard label="งานจาก Planning" value={canShowReliableReportSummary ? summary.planning : '—'} tone="slate" />
          <SummaryCard label="งานจาก Monthly Plan" value={canShowReliableReportSummary ? summary.monthlyPlan : '—'} tone="teal" />
          <SummaryCard label="งานระดมทีม" value={canShowReliableReportSummary ? summary.largeWork : '—'} tone="green" />
          <SummaryCard label="งานนอกแผน" value={canShowReliableReportSummary ? summary.adHoc : '—'} tone="slate" />
          {user?.role === 'super_admin' && <SummaryCard label="ทีมที่มีรายงาน" value={canShowReliableReportSummary ? summary.reportingTeams : '—'} tone="blue" />}
          {user?.role === 'super_admin' && <SummaryCard label="ทีมที่ยังไม่มีรายงาน" value={canShowReliableReportSummary ? summary.teamsWithoutReports : '—'} tone="amber" />}
        </section>

        <section className="smart-home-table">
          {isLoading ? (
            <StateMessage title="กำลังโหลดรายงาน" detail="กำลังโหลดข้อมูลรายงานการปฏิบัติงาน" />
          ) : isError ? (
            <StateMessage title="โหลดข้อมูลรายงานการปฏิบัติงานไม่สำเร็จ" detail="กรุณาลองใหม่อีกครั้ง" action={<button className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white" onClick={() => void refetch()} type="button"><RefreshCw className="h-4 w-4" aria-hidden="true" />ลองใหม่</button>} />
          ) : visibleReports.length === 0 ? (
            <StateMessage title="ยังไม่มีรายงานการปฏิบัติงานในช่วงเวลานี้" detail={canWrite ? 'สามารถไปที่หน้าบันทึกงานเพื่อเพิ่มข้อมูลการปฏิบัติงาน' : 'ยังไม่มีข้อมูลที่แสดงในโหมดอ่านอย่างเดียว'} action={canWrite ? <Link className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white" href="/daily-report"><Plus className="h-4 w-4" aria-hidden="true" />บันทึกงาน</Link> : undefined} />
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-left text-xs xl:text-sm">
                  <thead className="bg-sky-50/80 text-slate-600">
                    <tr>
                      <th className="px-3 py-2.5 font-bold">วันที่</th>
                      <th className="px-3 py-2.5 font-bold">ชื่องาน</th>
                      <th className="px-3 py-2.5 font-bold">ทีม</th>
                      <th className="px-3 py-2.5 font-bold">สถานที่</th>
                      <th className="px-3 py-2.5 font-bold">แหล่งที่มา</th>
                      <th className="px-3 py-2.5 font-bold">สถานะ</th>
                      <th className="px-3 py-2.5 font-bold">การทำงาน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-100/70">
                    {visibleReports.map((report) => (
                      <tr key={report.id} className="align-top transition-colors hover:bg-sky-50/50">
                        <td className="whitespace-nowrap px-3 py-2.5 text-slate-600">{formatThaiDate(report.workDate)}</td>
                        <td className="min-w-60 px-3 py-2.5"><p className="font-semibold text-slate-900">{report.title}</p><p className="line-clamp-2 text-xs text-slate-500">{report.summary}</p></td>
                        <td className="px-3 py-2.5 text-slate-700">{report.teamName}</td>
                        <td className="min-w-48 px-3 py-2.5 text-slate-700">{report.location}</td>
                        <td className="px-3 py-2.5"><SourceBadge source={report.source} label={report.sourceLabel} /></td>
                        <td className="px-3 py-2.5"><StatusBadge status={report.status} label={report.statusLabel} /></td>
                        <td className="px-3 py-2.5"><ReportActions report={report} viewer={user?.role === 'viewer'} canMutate={canMutateReport(user?.role, user?.teamId, report.teamId)} onDelete={setDeleteReport} onSelect={setSelectedReport} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="space-y-3 p-3 lg:hidden">
                {visibleReports.map((report) => (
                  <ReportCard key={report.id} report={report} viewer={user?.role === 'viewer'} canMutate={canMutateReport(user?.role, user?.teamId, report.teamId)} onDelete={setDeleteReport} onSelect={setSelectedReport} />
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      {selectedReport && (
        <ReportDetailSheet
          canMutate={canMutateReport(user?.role, user?.teamId, selectedReport.teamId)}
          onClose={() => setSelectedReport(null)}
          onDelete={setDeleteReport}
          report={selectedReport}
          viewer={user?.role === 'viewer'}
        />
      )}
      <Dialog open={deleteReport != null} onOpenChange={(open) => !open && setDeleteReport(null)}>
        <DialogContent className="smart-home-card bg-white/95 lg:max-w-md">
          <DialogHeader>
            <DialogTitle>ยืนยันการลบรายงาน</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            ลบรายงาน “{deleteReport?.title}” หรือไม่? การดำเนินการนี้มีผลต่อข้อมูลรายงานการปฏิบัติงานของทีม
          </p>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setDeleteReport(null)} disabled={deleteTask.isPending}>ยกเลิก</Button>
            <Button type="button" variant="destructive" onClick={() => void confirmDeleteReport()} disabled={deleteTask.isPending}>
              {deleteTask.isPending ? 'กำลังลบ…' : 'ลบรายงาน'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}

function SummaryCard({ label, value, tone }: { label: string; value: number | string; tone: 'blue' | 'green' | 'amber' | 'teal' | 'slate' }) {
  const toneClass = {
    blue: 'from-white/85 to-blue-50/80 text-blue-900 border-blue-100/80',
    green: 'from-white/85 to-sky-50/80 text-blue-900 border-sky-100/80',
    amber: 'from-white/85 to-amber-50/80 text-amber-900 border-amber-100/80',
    teal: 'from-white/85 to-teal-50/80 text-teal-900 border-teal-100/80',
    slate: 'from-white/85 to-slate-50/80 text-slate-900 border-slate-100/80',
  }[tone]
  return <div className={cn('smart-home-card-hover border bg-gradient-to-br p-4', toneClass)}><p className="text-xs font-bold text-current/70">{label}</p><p className="mt-2 text-2xl font-black">{typeof value === 'number' ? value.toLocaleString('th-TH') : value}</p></div>
}

function StateMessage({ title, detail, action }: { title: string; detail: string; action?: React.ReactNode }) {
  return <div className="p-8 text-center"><ClipboardList className="mx-auto mb-3 h-8 w-8 text-blue-600" aria-hidden="true" /><h2 className="text-lg font-semibold text-slate-900">{title}</h2><p className="mt-1 text-sm text-slate-500">{detail}</p>{action}</div>
}

function SourceBadge({ source, label }: { source: WorkReportItem['source']; label: string }) {
  return <span className={cn('smart-home-chip px-2.5 py-1 font-semibold', source === 'planning' && 'text-blue-700', source === 'monthly-plan' && 'text-teal-700', source === 'large-work' && 'text-sky-700', source === 'adhoc' && 'text-slate-700')}>{label}</span>
}

function StatusBadge({ status, label }: { status: WorkReportItem['status']; label: string }) {
  return <span className={cn('smart-home-chip px-2.5 py-1 font-semibold', status === 'saved' ? 'text-blue-700' : 'text-amber-700')}>{label}</span>
}

function ReportActions({ report, viewer, canMutate, onDelete, onSelect }: { report: WorkReportItem; viewer: boolean; canMutate: boolean; onDelete: (report: WorkReportItem) => void; onSelect: (report: WorkReportItem) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button className="smart-home-control inline-flex min-h-11 items-center gap-2 px-3 text-sm font-medium text-blue-700" onClick={() => onSelect(report)} type="button"><Eye className="h-4 w-4" aria-hidden="true" />ดูรายละเอียด</button>
      {!viewer && canMutate && <Link className="smart-home-control inline-flex min-h-11 items-center gap-2 px-3 text-sm font-medium text-slate-700" href={`/daily-report?reportId=${report.id}`}><Pencil className="h-4 w-4" aria-hidden="true" />แก้ไข</Link>}
      {!viewer && canMutate && <button className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-red-200 bg-white/70 px-3 text-sm font-medium text-red-700 shadow-sm backdrop-blur-md transition-colors hover:bg-red-50" onClick={() => onDelete(report)} type="button"><Trash2 className="h-4 w-4" aria-hidden="true" />ลบ</button>}
    </div>
  )
}

function ReportCard(props: { report: WorkReportItem; viewer: boolean; canMutate: boolean; onDelete: (report: WorkReportItem) => void; onSelect: (report: WorkReportItem) => void }) {
  const { report } = props
  return (
    <article className="smart-home-card-hover p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{formatThaiDate(report.workDate)}</p>
          <h3 className="mt-1 text-base font-semibold text-slate-900">{report.title}</h3>
        </div>
        <StatusBadge status={report.status} label={report.statusLabel} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2"><SourceBadge source={report.source} label={report.sourceLabel} /><span className="smart-home-chip px-2.5 py-1 text-slate-700">{report.teamName}</span></div>
      <p className="mt-3 text-sm text-slate-700">{report.location}</p>
      <p className="mt-2 line-clamp-3 text-sm text-slate-500">{report.summary}</p>
      <div className="mt-4"><ReportActions {...props} /></div>
    </article>
  )
}

function ReportDetailSheet({ report, viewer, canMutate, onClose, onDelete }: { report: WorkReportItem; viewer: boolean; canMutate: boolean; onClose: () => void; onDelete: (report: WorkReportItem) => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="smart-home-card absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-y-auto rounded-b-none rounded-t-3xl bg-white/95 p-5 shadow-2xl md:bottom-auto md:left-auto md:right-0 md:top-0 md:h-full md:max-h-none md:w-[32rem] md:rounded-none">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">รายละเอียดรายงาน</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">{report.title}</h2>
          </div>
          <button className="smart-home-control inline-flex min-h-11 items-center gap-2 px-3 text-sm" onClick={onClose} type="button"><X className="h-4 w-4" aria-hidden="true" />ปิด</button>
        </div>
        <dl className="smart-home-panel mt-5 space-y-4 p-4 text-sm">
          <DetailRow label="วันที่" value={formatThaiDate(report.workDate)} />
          <DetailRow label="เวลา" value={report.timeLabel} />
          <DetailRow label="ทีม/ผู้ปฏิบัติงาน" value={`${report.workerName} / ${report.teamName}`} />
          <DetailRow label="สถานที่" value={report.location} />
          <DetailRow label="รายละเอียดงานที่ทำจริง" value={report.detail} />
          <DetailRow label="ผลการปฏิบัติงาน/สรุปผล" value={report.summary} />
          <DetailRow label="ปัญหา/อุปสรรค" value="ไม่ระบุ" />
          <DetailRow label="แหล่งที่มา" value={`${report.sourceLabel} (${report.referenceId})`} />
          <DetailRow label="รูปภาพ/ไฟล์แนบ" value={`${report.beforeImages.length + report.afterImages.length} รายการ`} />
        </dl>
        {viewer && <p className="smart-home-panel mt-5 p-3 text-sm text-slate-600">viewer ดูรายละเอียดได้เท่านั้น ไม่มีสิทธิ์แก้ไข ลบ หรือส่งออก</p>}
        {!viewer && canMutate && <div className="mt-5 flex gap-2"><Link className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white" href={`/daily-report?reportId=${report.id}`}><Pencil className="h-4 w-4" aria-hidden="true" />แก้ไข</Link><button className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white/70 px-4 text-sm font-semibold text-red-700" onClick={() => onDelete(report)} type="button"><Trash2 className="h-4 w-4" aria-hidden="true" />ลบ</button></div>}
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-medium text-slate-500">{label}</dt><dd className="mt-1 whitespace-pre-wrap text-slate-800">{value}</dd></div>
}
