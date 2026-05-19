'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { PageHeader } from '@/shared/page-header'
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

  const { data: teams = [] } = useTeams()
  const scopedTeamId = getScopedTeamId({ role: user?.role, teamId: user?.teamId }, teamFilter)
  const { data, isLoading, isError, refetch } = useTaskDailies({
    year: String(year),
    month: String(month).padStart(2, '0'),
    teamId: scopedTeamId,
  })
  const deleteTask = useDeleteTaskDaily()

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

  async function handleDelete(report: WorkReportItem) {
    if (!canMutateReport(user?.role, user?.teamId, report.teamId)) return
    const ok = window.confirm(`ลบรายงาน "${report.title}" หรือไม่?`)
    if (!ok) return
    await deleteTask.mutateAsync(String(report.id))
    toast.success('ลบรายงานเรียบร้อย')
    setSelectedReport(null)
  }

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-4 pb-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <PageHeader
          title="รายงานการปฏิบัติงาน"
          description="ดูรายการงานที่ปฏิบัติแล้วจากข้อมูลบันทึกงาน พร้อมสรุปตามตัวกรอง"
          action={canWrite ? <Link className="inline-flex min-h-11 items-center rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800" href="/daily-report">บันทึกงาน</Link> : undefined}
        />

        {user?.role === 'viewer' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            โหมดอ่านอย่างเดียว: ผู้บริหารดูรายละเอียดรายงานได้ แต่ไม่มีปุ่มแก้ไข ลบ หรือส่งออกข้อมูล
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
            <button className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm text-slate-700 hover:bg-slate-50" onClick={() => shiftMonth(-1)} type="button">เดือนก่อนหน้า</button>
            <div className="flex min-h-11 items-center justify-center rounded-xl bg-blue-50 px-3 text-sm font-semibold text-blue-900">
              {new Date(year, month - 1, 1).toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
            </div>
            <button className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm text-slate-700 hover:bg-slate-50" onClick={() => shiftMonth(1)} type="button">เดือนถัดไป</button>
            <button className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm text-slate-700 hover:bg-slate-50" onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth() + 1) }} type="button">เดือนนี้</button>
            <select className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm" onChange={(event) => setStatus(event.target.value as ReportStatusFilter)} value={status}>
              {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <select className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm" onChange={(event) => setSource(event.target.value as ReportSourceFilter)} value={source}>
              {sourceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            <input className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm" onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหาชื่องาน ทีม สถานที่ หรือสรุปผล" value={search} />
            {canSelectTeam ? (
              <select className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm" onChange={(event) => setTeamFilter(event.target.value)} value={teamFilter}>
                <option value="all">ทุกทีมที่มองเห็นได้</option>
                {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
              </select>
            ) : (
              <div className="flex min-h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">ล็อกทีมของฉัน</div>
            )}
            <button className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={() => void refetch()} type="button">ลองใหม่/รีเฟรช</button>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryCard label="บันทึกทั้งหมด" value={summary.total} tone="blue" />
          <SummaryCard label="บันทึกแล้ว" value={summary.saved} tone="green" />
          <SummaryCard label="บันทึกร่าง" value={summary.drafts} tone="amber" />
          <SummaryCard label="งานจาก Planning" value={summary.planning} tone="slate" />
          <SummaryCard label="งานจาก Monthly Plan" value={summary.monthlyPlan} tone="teal" />
          <SummaryCard label="งานระดมทีม" value={summary.largeWork} tone="green" />
          <SummaryCard label="งานนอกแผน" value={summary.adHoc} tone="slate" />
          {user?.role === 'super_admin' && <SummaryCard label="ทีมที่มีรายงาน" value={summary.reportingTeams} tone="blue" />}
          {user?.role === 'super_admin' && <SummaryCard label="ทีมที่ยังไม่มีรายงาน" value={summary.teamsWithoutReports} tone="amber" />}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {isLoading ? (
            <StateMessage title="กำลังโหลดรายงาน" detail="กำลังโหลดข้อมูลรายงานการปฏิบัติงาน" />
          ) : isError ? (
            <StateMessage title="โหลดข้อมูลรายงานการปฏิบัติงานไม่สำเร็จ" detail="กรุณาลองใหม่อีกครั้ง" action={<button className="mt-3 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white" onClick={() => void refetch()} type="button">ลองใหม่</button>} />
          ) : visibleReports.length === 0 ? (
            <StateMessage title="ยังไม่มีรายงานการปฏิบัติงานในช่วงเวลานี้" detail={canWrite ? 'สามารถไปที่หน้าบันทึกงานเพื่อเพิ่มข้อมูลการปฏิบัติงาน' : 'ยังไม่มีข้อมูลที่แสดงในโหมดอ่านอย่างเดียว'} action={canWrite ? <Link className="mt-3 inline-flex rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white" href="/daily-report">บันทึกงาน</Link> : undefined} />
          ) : (
            <>
              <div className="hidden md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">วันที่</th>
                      <th className="px-4 py-3 font-medium">ชื่องาน</th>
                      <th className="px-4 py-3 font-medium">ทีม</th>
                      <th className="px-4 py-3 font-medium">สถานที่</th>
                      <th className="px-4 py-3 font-medium">แหล่งที่มา</th>
                      <th className="px-4 py-3 font-medium">สถานะ</th>
                      <th className="px-4 py-3 font-medium">การทำงาน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleReports.map((report) => (
                      <tr key={report.id} className="align-top hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-600">{formatThaiDate(report.workDate)}</td>
                        <td className="px-4 py-3"><p className="font-medium text-slate-900">{report.title}</p><p className="line-clamp-2 text-xs text-slate-500">{report.summary}</p></td>
                        <td className="px-4 py-3 text-slate-700">{report.teamName}</td>
                        <td className="px-4 py-3 text-slate-700">{report.location}</td>
                        <td className="px-4 py-3"><SourceBadge source={report.source} label={report.sourceLabel} /></td>
                        <td className="px-4 py-3"><StatusBadge status={report.status} label={report.statusLabel} /></td>
                        <td className="px-4 py-3"><ReportActions report={report} viewer={user?.role === 'viewer'} canMutate={canMutateReport(user?.role, user?.teamId, report.teamId)} onDelete={handleDelete} onSelect={setSelectedReport} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="space-y-3 p-3 md:hidden">
                {visibleReports.map((report) => (
                  <ReportCard key={report.id} report={report} viewer={user?.role === 'viewer'} canMutate={canMutateReport(user?.role, user?.teamId, report.teamId)} onDelete={handleDelete} onSelect={setSelectedReport} />
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
          onDelete={handleDelete}
          report={selectedReport}
          viewer={user?.role === 'viewer'}
        />
      )}
    </main>
  )
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: 'blue' | 'green' | 'amber' | 'teal' | 'slate' }) {
  const toneClass = {
    blue: 'bg-blue-50 text-blue-900 border-blue-100',
    green: 'bg-green-50 text-green-900 border-green-100',
    amber: 'bg-amber-50 text-amber-900 border-amber-100',
    teal: 'bg-teal-50 text-teal-900 border-teal-100',
    slate: 'bg-slate-50 text-slate-900 border-slate-100',
  }[tone]
  return <div className={cn('rounded-2xl border p-4', toneClass)}><p className="text-xs font-medium text-current/70">{label}</p><p className="mt-2 text-2xl font-bold">{value.toLocaleString('th-TH')}</p></div>
}

function StateMessage({ title, detail, action }: { title: string; detail: string; action?: React.ReactNode }) {
  return <div className="p-8 text-center"><h2 className="text-lg font-semibold text-slate-900">{title}</h2><p className="mt-1 text-sm text-slate-500">{detail}</p>{action}</div>
}

function SourceBadge({ source, label }: { source: WorkReportItem['source']; label: string }) {
  return <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-medium', source === 'planning' && 'bg-blue-50 text-blue-700', source === 'monthly-plan' && 'bg-teal-50 text-teal-700', source === 'large-work' && 'bg-green-50 text-green-700', source === 'adhoc' && 'bg-slate-100 text-slate-700')}>{label}</span>
}

function StatusBadge({ status, label }: { status: WorkReportItem['status']; label: string }) {
  return <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-medium', status === 'saved' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700')}>{label}</span>
}

function ReportActions({ report, viewer, canMutate, onDelete, onSelect }: { report: WorkReportItem; viewer: boolean; canMutate: boolean; onDelete: (report: WorkReportItem) => void; onSelect: (report: WorkReportItem) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button className="min-h-11 rounded-xl border border-blue-200 px-3 text-sm font-medium text-blue-700 hover:bg-blue-50" onClick={() => onSelect(report)} type="button">ดูรายละเอียด</button>
      {!viewer && canMutate && <Link className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50" href={`/daily-report?reportId=${report.id}`}>แก้ไข</Link>}
      {!viewer && canMutate && <button className="min-h-11 rounded-xl border border-red-200 px-3 text-sm font-medium text-red-700 hover:bg-red-50" onClick={() => onDelete(report)} type="button">ลบ</button>}
    </div>
  )
}

function ReportCard(props: { report: WorkReportItem; viewer: boolean; canMutate: boolean; onDelete: (report: WorkReportItem) => void; onSelect: (report: WorkReportItem) => void }) {
  const { report } = props
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{formatThaiDate(report.workDate)}</p>
          <h3 className="mt-1 text-base font-semibold text-slate-900">{report.title}</h3>
        </div>
        <StatusBadge status={report.status} label={report.statusLabel} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2"><SourceBadge source={report.source} label={report.sourceLabel} /><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">{report.teamName}</span></div>
      <p className="mt-3 text-sm text-slate-700">{report.location}</p>
      <p className="mt-2 line-clamp-3 text-sm text-slate-500">{report.summary}</p>
      <div className="mt-4"><ReportActions {...props} /></div>
    </article>
  )
}

function ReportDetailSheet({ report, viewer, canMutate, onClose, onDelete }: { report: WorkReportItem; viewer: boolean; canMutate: boolean; onClose: () => void; onDelete: (report: WorkReportItem) => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40" role="dialog" aria-modal="true">
      <div className="absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl md:bottom-auto md:left-auto md:right-0 md:top-0 md:h-full md:max-h-none md:w-[32rem] md:rounded-none">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">รายละเอียดรายงาน</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">{report.title}</h2>
          </div>
          <button className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm" onClick={onClose} type="button">ปิด</button>
        </div>
        <dl className="mt-5 space-y-4 text-sm">
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
        {viewer && <p className="mt-5 rounded-2xl bg-slate-100 p-3 text-sm text-slate-600">viewer ดูรายละเอียดได้เท่านั้น ไม่มีสิทธิ์แก้ไข ลบ หรือส่งออก</p>}
        {!viewer && canMutate && <div className="mt-5 flex gap-2"><Link className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white" href={`/daily-report?reportId=${report.id}`}>แก้ไข</Link><button className="min-h-11 flex-1 rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-700" onClick={() => onDelete(report)} type="button">ลบ</button></div>}
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-medium text-slate-500">{label}</dt><dd className="mt-1 whitespace-pre-wrap text-slate-800">{value}</dd></div>
}
