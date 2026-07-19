'use client'

import { useMemo, useState } from 'react'
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Loader2,
  Lock,
  Plus,
  RefreshCw,
  RotateCcw,
  Trash2,
  Upload,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuthContext } from '@/lib/auth/auth-context'
import { useMonthlyPlanYearOverview, useTeams } from '@/hooks/useQueries'
import { useConvertApprovedMonthlyPlanToPlanning, useHardDeleteFile, useRestoreFile, useSoftDeleteFile } from '@/hooks/mutations/useMonthlyPlanMutations'
import { UploadPlanDialog } from '@/features/monthly-plan/components/UploadPlanDialog'
import { UploadMasterPlanDialog } from '@/features/monthly-plan/components/UploadMasterPlanDialog'
import {
  buildYearlyMonthlyPlanCards,
  formatFileSize,
  formatMonthlyPlanYearLabel,
  formatPeriodLabelFull,
  getDefaultMonthlyPlanYear,
  type YearlyMonthlyPlanCard,
} from '@/features/monthly-plan/utils'
import {
  buildMonthlyPlanPageModel,
  buildMonthlyPlanToPlanningConversion,
  canDownloadApprovedFile,
  canPreviewApprovedFile,
  canUploadApprovedMonthlyPlan,
  isPreviewableApprovedFile,
  type MonthlyPlanCapability,
  type MonthlyPlanTabId,
  type MonthlyPlanUserContext,
} from '@/features/monthly-plan/monthly-plan-view-model'
import { monthlyPlanService } from '@/lib/services/monthly-plan.service'
import type { PlanFile } from '@/types/monthly-plan'
import type { User } from '@/types/auth'

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
] as const

const STATUS_COPY: Record<string, { label: string; className: string }> = {
  has_files: { label: 'มีไฟล์อนุมัติแล้ว', className: 'badge-success' },
  locked: { label: 'รออนุมัติรวม', className: 'badge-warning' },
  open: { label: 'ยังไม่มีไฟล์อนุมัติ', className: 'badge-neutral' },
}

function getUserCapabilities(user: User | null | undefined): MonthlyPlanCapability[] {
  const raw = user as (User & { capabilities?: string[]; capabilityCodes?: string[] }) | null | undefined
  return [...(raw?.capabilities ?? []), ...(raw?.capabilityCodes ?? [])]
    .filter((capability): capability is MonthlyPlanCapability =>
      capability === 'can_upload_approved_monthly_plan'
    )
}

function getUserContext(user: User | null | undefined): MonthlyPlanUserContext {
  return {
    role: user?.role,
    teamId: user?.teamId ?? null,
    capabilities: getUserCapabilities(user),
  }
}

function formatDate(date: string | null | undefined): string {
  if (!date) return 'ไม่ระบุวันที่'
  return new Date(date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatPlanDate(file: PlanFile): string {
  if (file.workStartDate && file.workEndDate) return `${formatDate(file.workStartDate)} - ${formatDate(file.workEndDate)}`
  if (file.workStartDate) return formatDate(file.workStartDate)
  return 'ยังไม่ระบุวันเวลา'
}

function getTeamName(file: PlanFile, teams: { id: number; name: string }[]): string {
  return file.team?.name ?? teams.find((team) => team.id === file.teamId)?.name ?? (file.teamId ? `ทีม #${file.teamId}` : 'ไม่ระบุทีม')
}

function statusCopy(card: YearlyMonthlyPlanCard) {
  return STATUS_COPY[card.status] ?? STATUS_COPY.open
}

function MonthSelector({
  selectedMonth,
  onMonthChange,
}: {
  selectedMonth: number
  onMonthChange: (month: number) => void
}) {
  const previous = () => onMonthChange(selectedMonth === 1 ? 12 : selectedMonth - 1)
  const next = () => onMonthChange(selectedMonth === 12 ? 1 : selectedMonth + 1)
  const currentMonth = new Date().getMonth() + 1

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <button onClick={previous} className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600" aria-label="เดือนก่อนหน้า">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <select
          value={selectedMonth}
          onChange={(event) => onMonthChange(Number(event.target.value))}
          className="h-11 min-w-48 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          aria-label="เลือกเดือน"
          name="month"
        >
          {THAI_MONTHS.map((month, index) => (
            <option key={month} value={index + 1}>{month}</option>
          ))}
        </select>
        <button onClick={next} className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600" aria-label="เดือนถัดไป">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <button
        onClick={() => onMonthChange(currentMonth)}
        className="inline-flex min-h-11 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-700 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        เดือนปัจจุบัน
      </button>
    </div>
  )
}

function ActionButton({
  children,
  onClick,
  tone = 'neutral',
  disabled = false,
  title,
}: {
  children: React.ReactNode
  onClick?: () => void
  tone?: 'neutral' | 'primary' | 'danger' | 'disabled'
  disabled?: boolean
  title?: string
}) {
  const toneClass = {
    primary: 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700',
    danger: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
    disabled: 'border-slate-200 bg-slate-100 text-slate-500',
    neutral: 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  }[tone]
  return (
    <button
      onClick={onClick}
      disabled={disabled || tone === 'disabled'}
      title={title}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${toneClass} disabled:cursor-not-allowed disabled:opacity-70`}
    >
      {children}
    </button>
  )
}

function ApprovedFileCard({
  card,
  file,
  userContext,
  canUploadApproved,
  onUpload,
  onReplace,
  onDelete,
}: {
  card: YearlyMonthlyPlanCard
  file: PlanFile | null
  userContext: MonthlyPlanUserContext
  canUploadApproved: boolean
  onUpload: () => void
  onReplace: () => void
  onDelete: (fileId: number) => void
}) {
  const [busy, setBusy] = useState(false)
  const status = statusCopy(card)
  const canDownload = canDownloadApprovedFile(userContext, file)
  const canPreview = canPreviewApprovedFile(userContext, file)

  const openFile = async (download: boolean) => {
    if (!file) return
    setBusy(true)
    try {
      const url = download ? await monthlyPlanService.getDownloadUrl(file.id) : file.fileURL
      const link = document.createElement('a')
      link.href = url
      if (download) link.download = file.fileName
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch {
      toast.error(download ? 'ดาวน์โหลดไฟล์ไม่สำเร็จ' : 'เปิดตัวอย่างไฟล์ไม่สำเร็จ')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
            <FileCheck2 className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-xs font-semibold uppercase text-blue-700">ไฟล์อนุมัติประจำเดือน</p>
              <h2 className="text-xl font-bold text-slate-950">{formatPeriodLabelFull(card.period)}</h2>
            </div>
            <span className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {file && canPreview && (
            <ActionButton onClick={() => openFile(false)} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
              ดูตัวอย่าง
            </ActionButton>
          )}
          {file && canDownload && (
            <ActionButton onClick={() => openFile(true)} disabled={busy} tone="primary">
              <Download className="h-4 w-4" />
              ดาวน์โหลด
            </ActionButton>
          )}
          {file && canUploadApproved && (
            <ActionButton onClick={onReplace} tone="primary">
              <Upload className="h-4 w-4" />
              แทนที่ไฟล์อนุมัติ
            </ActionButton>
          )}
          {!file && canUploadApproved && (
            <ActionButton onClick={onUpload} tone="primary">
              <Upload className="h-4 w-4" />
              อัปโหลดไฟล์อนุมัติ
            </ActionButton>
          )}
          {file && canUploadApproved && (
            <ActionButton onClick={() => onDelete(file.id)} tone="danger">
              <Trash2 className="h-4 w-4" />
              ลบไฟล์
            </ActionButton>
          )}
        </div>
      </div>

      {file ? (
        <div className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <p className="text-xs text-slate-500">ชื่อไฟล์</p>
            <p className="break-words text-sm font-semibold text-slate-900">{file.fileName}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">ประเภท/ขนาด</p>
            <p className="text-sm font-semibold text-slate-900">{file.fileName.split('.').pop()?.toUpperCase() ?? 'ไฟล์'} · {formatFileSize(file.fileSizeBytes)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">วันที่อัปโหลด</p>
            <p className="text-sm font-semibold text-slate-900">{formatDate(file.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">ผู้อัปโหลด</p>
            <p className="text-sm font-semibold text-slate-900">{file.uploadedBy?.username ?? `user #${file.uploadedById}`}</p>
          </div>
          {userContext.role === 'viewer' && (
            <div className="rounded-xl border border-white/70 bg-white/75 p-3 text-sm text-slate-600 shadow-sm sm:col-span-2 lg:col-span-4">
              {isPreviewableApprovedFile(file) ? 'ดูตัวอย่างได้เฉพาะไฟล์ PDF/รูปภาพ และไม่มีสิทธิ์ดาวน์โหลด' : 'ไฟล์นี้ไม่รองรับการดูตัวอย่างสำหรับผู้บริหาร และไม่มีสิทธิ์ดาวน์โหลด'}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <FileText className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-2 text-sm font-semibold text-slate-700">ยังไม่มีไฟล์อนุมัติประจำเดือนนี้</p>
          <p className="mt-1 text-xs text-slate-500">เมื่อมีไฟล์อนุมัติ ระบบจะแสดงเป็นส่วนแรกของหน้านี้</p>
        </div>
      )}
    </section>
  )
}

function PlanCard({
  file,
  teamName,
  canDownload,
  canEdit,
  canDelete,
  onSoftDelete,
}: {
  file: PlanFile
  teamName: string
  canDownload: boolean
  canEdit: boolean
  canDelete: boolean
  onSoftDelete: (fileId: number) => void
}) {
  const [busy, setBusy] = useState(false)
  const download = async () => {
    setBusy(true)
    try {
      const url = await monthlyPlanService.getDownloadUrl(file.id)
      const link = document.createElement('a')
      link.href = url
      link.download = file.fileName
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch {
      toast.error('ดาวน์โหลดไฟล์ไม่สำเร็จ')
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{teamName}</span>
            <span className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">ส่งแล้ว</span>
          </div>
          <h3 className="break-words text-base font-bold text-slate-950">{file.description || file.fileName}</h3>
          <dl className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
            <div><dt className="text-xs text-slate-500">สถานที่</dt><dd className="font-medium text-slate-800">{file.destination || 'ไม่ระบุสถานที่'}</dd></div>
            <div><dt className="text-xs text-slate-500">วันที่/เวลา</dt><dd className="font-medium text-slate-800">{formatPlanDate(file)}</dd></div>
            <div><dt className="text-xs text-slate-500">ผู้รับผิดชอบ</dt><dd className="font-medium text-slate-800">{file.uploadedBy?.username ?? `user #${file.uploadedById}`}</dd></div>
            <div><dt className="text-xs text-slate-500">ไฟล์</dt><dd className="font-medium text-slate-800">{file.fileName}</dd></div>
          </dl>
          {file.remarks && <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">หมายเหตุ: {file.remarks}</p>}
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <ActionButton onClick={() => window.open(file.fileURL, '_blank', 'noopener,noreferrer')}>
            <Eye className="h-4 w-4" />
            ดูรายละเอียด
          </ActionButton>
          {canDownload && (
            <ActionButton onClick={download} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              ดาวน์โหลด
            </ActionButton>
          )}
          {canEdit && (
          <ActionButton tone="disabled" title="ยังไม่รองรับการแก้ไขแผนจากหน้านี้">
            แก้ไข
          </ActionButton>
          )}
          {canDelete && (
            <ActionButton onClick={() => onSoftDelete(file.id)} tone="danger">
              <Trash2 className="h-4 w-4" />
              ลบ
            </ActionButton>
          )}
        </div>
      </div>
    </article>
  )
}

function EmptyState({ text, action }: { text: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <FileText className="mx-auto h-8 w-8 text-slate-400" />
      <p className="mt-2 text-sm font-semibold text-slate-700">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

function SkeletonState() {
  return (
    <div className="space-y-4">
      <div className="h-48 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
      <div className="grid gap-3 md:grid-cols-3">
        <div className="h-20 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
        <div className="h-20 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
        <div className="h-20 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
      </div>
    </div>
  )
}

export default function MonthlyPlanPage() {
  const { user } = useAuthContext()
  const year = getDefaultMonthlyPlanYear()
  const currentMonth = new Date().getMonth() + 1
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [activeTab, setActiveTab] = useState<MonthlyPlanTabId>('own-team')
  const [teamFilter, setTeamFilter] = useState<number | 'all'>('all')
  const [uploadTeamOpen, setUploadTeamOpen] = useState(false)
  const [uploadApprovedOpen, setUploadApprovedOpen] = useState(false)
  const [mutationMonth, setMutationMonth] = useState(selectedMonth)

  const userContext = useMemo(() => getUserContext(user), [user])
  const { data: overview, isLoading, isError, refetch, isFetching } = useMonthlyPlanYearOverview(year)
  const { data: teams = [], isLoading: teamsLoading } = useTeams()
  const softDelete = useSoftDeleteFile(year, mutationMonth)
  const hardDelete = useHardDeleteFile(year, mutationMonth)
  const restore = useRestoreFile(year, mutationMonth)
  const convertApprovedToPlanning = useConvertApprovedMonthlyPlanToPlanning(year, selectedMonth)

  const cards = useMemo(() => (overview ? buildYearlyMonthlyPlanCards(overview) : []), [overview])
  const selectedCard = cards.find((card) => card.month === selectedMonth) ?? cards[0]
  const activeFiles = selectedCard?.files.filter((file) => !file.isDeleted) ?? []
  const approvedFile = activeFiles.find((file) => file.isMasterPlan) ?? null
  const teamFiles = activeFiles.filter((file) => !file.isMasterPlan)
  const ownTeamPlans = teamFiles.filter((file) => userContext.teamId != null && file.teamId === userContext.teamId)
  const otherTeamPlans = teamFiles.filter((file) => userContext.role === 'super_admin' || userContext.role === 'viewer'
    ? true
    : userContext.teamId == null || file.teamId !== userContext.teamId)
  const canUploadApproved = canUploadApprovedMonthlyPlan(userContext)

  const model = useMemo(() => buildMonthlyPlanPageModel({
    user: userContext,
    approvedFile,
    ownTeamPlans,
    otherTeamPlans,
    teams,
    year,
    month: selectedMonth,
  }), [approvedFile, otherTeamPlans, ownTeamPlans, selectedMonth, teams, userContext, year])

  const visibleOverviewRows = model.overviewRows.filter((row) => teamFilter === 'all' || row.file.teamId === teamFilter)

  const handleSoftDelete = (month: number, fileId: number) => {
    if (!confirm('ยืนยันลบแผนทีมนี้? ไฟล์จะถูกย้ายออกจากรายการใช้งานและผู้ใช้ทีมจะไม่เห็นในแผนปัจจุบัน ไม่สามารถย้อนกลับจากหน้าจอนี้ได้')) return
    setMutationMonth(month)
    softDelete.mutate(fileId)
  }
  const handleHardDelete = (month: number, fileId: number) => {
    if (!confirm('ยืนยันลบไฟล์อนุมัตินี้? ไฟล์จะถูกลบออกจากรอบเดือนนี้และผู้ใช้จะไม่สามารถดูตัวอย่างหรือดาวน์โหลดได้ ไม่สามารถย้อนกลับจากหน้าจอนี้ได้')) return
    setMutationMonth(month)
    hardDelete.mutate(fileId)
  }
  const handleRestore = (month: number, fileId: number) => {
    setMutationMonth(month)
    restore.mutate(fileId)
  }

  const handleConvertApprovedToPlanning = () => {
    if (!approvedFile || !model.planningConversion.enabled) return
    if (!confirm(model.planningConversion.confirmText)) return
    convertApprovedToPlanning.mutate(buildMonthlyPlanToPlanningConversion({
      year,
      month: selectedMonth,
      approvedFile,
      selectedTeamIds: teams.map((team) => team.id),
    }))
  }

  const ensureActiveTabVisible = (tabId: MonthlyPlanTabId) => {
    if (model.tabs.some((tab) => tab.id === tabId)) setActiveTab(tabId)
  }

  if (!selectedCard && !isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:px-6 lg:px-8">
        <EmptyState text="ไม่พบข้อมูลแผนประจำเดือน" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-blue-700">แผนงาน</p>
            <h1 className="text-2xl font-bold text-slate-950 sm:text-[28px]">แผนประจำเดือน</h1>
            <p className="max-w-2xl text-sm text-slate-600">
              แสดงไฟล์อนุมัติเป็นส่วนแรก จัดการแผนทีมของฉัน และดูภาพรวมตามสิทธิ์ของผู้ใช้
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">{formatMonthlyPlanYearLabel(year)}</span>
              <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">{model.header.scopeText}</span>
              {userContext.role === 'viewer' && <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">อ่านอย่างเดียว · ไม่มีสิทธิ์ดาวน์โหลด</span>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {model.primaryActions.addOwnTeamPlan.visible ? (
              <ActionButton onClick={() => setUploadTeamOpen(true)} tone="primary">
                <Plus className="h-4 w-4" />
                เพิ่มแผนทีม
              </ActionButton>
            ) : userContext.role === 'user' ? (
              <ActionButton tone="disabled" title="ไม่มีสิทธิ์">
                <Lock className="h-4 w-4" />
                เพิ่มแผนทีม · ไม่มีสิทธิ์
              </ActionButton>
            ) : null}
            {model.primaryActions.uploadApprovedFile.visible && (
              <ActionButton onClick={() => { ensureActiveTabVisible('upload-approved'); setUploadApprovedOpen(true) }} tone="primary">
                <Upload className="h-4 w-4" />
                อัปโหลดไฟล์อนุมัติ
              </ActionButton>
            )}
            {model.planningConversion.visible && (
              <ActionButton onClick={handleConvertApprovedToPlanning} disabled={convertApprovedToPlanning.isPending} tone="primary">
                {convertApprovedToPlanning.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck2 className="h-4 w-4" />}
                {model.planningConversion.ctaText}
              </ActionButton>
            )}
          </div>
        </div>
      </header>

      <MonthSelector selectedMonth={selectedMonth} onMonthChange={(month) => { setSelectedMonth(month); setMutationMonth(month) }} />

      {isLoading || teamsLoading ? (
        <SkeletonState />
      ) : isError ? (
        <section className="smart-home-card border-red-200 bg-red-50/80 p-6 text-red-700">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5" />
              <div>
                <p className="font-semibold">โหลดข้อมูลแผนประจำเดือนไม่สำเร็จ</p>
                <p className="text-sm text-red-600">กรุณาลองใหม่อีกครั้ง</p>
              </div>
            </div>
            <ActionButton onClick={() => refetch()}>
              {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              ลองใหม่
            </ActionButton>
          </div>
        </section>
      ) : selectedCard ? (
        <>
          <ApprovedFileCard
            card={selectedCard}
            file={approvedFile}
            userContext={userContext}
            canUploadApproved={canUploadApproved}
            onUpload={() => setUploadApprovedOpen(true)}
            onReplace={() => setUploadApprovedOpen(true)}
            onDelete={(fileId) => handleHardDelete(selectedMonth, fileId)}
          />

          <section className="rounded-xl border border-slate-200 bg-white p-2 sm:p-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {model.tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`min-h-11 shrink-0 rounded-lg border px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${activeTab === tab.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </section>

          {activeTab === 'own-team' && (
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">แผนทีมของฉัน</h2>
                  <p className="text-sm text-slate-600">ทีมถูกล็อกตามสิทธิ์ของผู้ใช้</p>
                </div>
              </div>
              {model.ownTeamRows.length > 0 ? (
                <div className="grid gap-3 lg:grid-cols-2">
                  {model.ownTeamRows.map((row) => (
                    <PlanCard
                      key={row.file.id}
                      file={row.file}
                      teamName={row.teamName}
                      canDownload={row.canDownload}
                      canEdit={row.canEdit}
                      canDelete={row.canDelete}
                      onSoftDelete={(fileId) => handleSoftDelete(selectedMonth, fileId)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  text="ยังไม่มีแผนทีมในเดือนนี้"
                  action={model.primaryActions.addOwnTeamPlan.visible ? <ActionButton onClick={() => setUploadTeamOpen(true)} tone="primary"><Plus className="h-4 w-4" />เพิ่มแผนทีม</ActionButton> : undefined}
                />
              )}
            </section>
          )}

          {activeTab === 'overview' && model.tabs.some((tab) => tab.id === 'overview') && (
            <section className="space-y-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">แผนทีมอื่น / ภาพรวม</h2>
                  <p className="text-sm text-slate-600">อ่านข้อมูลตามสิทธิ์ ทีมอื่นไม่แสดงปุ่มดาวน์โหลด/แก้ไขสำหรับ team_lead และ viewer</p>
                </div>
                {model.header.showTeamFilter && (
                  <label className="space-y-1 text-sm font-medium text-slate-700">
                    <span className="flex items-center gap-1"><Users className="h-4 w-4" /> ทีม</span>
                    <select
                      value={teamFilter}
                      onChange={(event) => setTeamFilter(event.target.value === 'all' ? 'all' : Number(event.target.value))}
                      className="smart-home-control smart-home-focus h-11 px-3 text-sm"
                    >
                      <option value="all">ทุกทีม</option>
                      {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                    </select>
                  </label>
                )}
              </div>
              {visibleOverviewRows.length > 0 ? (
                <div className="grid gap-3 lg:grid-cols-2">
                  {visibleOverviewRows.map((row) => (
                    <PlanCard
                      key={row.file.id}
                      file={row.file}
                      teamName={row.teamName || getTeamName(row.file, teams)}
                      canDownload={row.canDownload}
                      canEdit={row.canEdit}
                      canDelete={row.canDelete}
                      onSoftDelete={(fileId) => handleSoftDelete(selectedMonth, fileId)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState text="ยังไม่มีแผนทีมอื่นในเดือนนี้" />
              )}
            </section>
          )}

          {activeTab === 'upload-approved' && model.tabs.some((tab) => tab.id === 'upload-approved') && (
            <section className="smart-home-card p-5">
              <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-950">อัปโหลดไฟล์อนุมัติ</h2>
                    <p className="text-sm text-slate-600">ใช้สำหรับไฟล์รวม/ไฟล์อนุมัติแล้วของเดือนที่เลือก ผู้มีสิทธิ์สามารถแทนที่ไฟล์ของกันและกันได้</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="smart-home-panel p-4">
                      <p className="text-xs text-slate-500">เดือนที่เลือก</p>
                      <p className="font-bold text-slate-950">{formatPeriodLabelFull(selectedCard.period)}</p>
                    </div>
                    <div className="smart-home-panel p-4">
                      <p className="text-xs text-slate-500">แผนทีมที่ส่งแล้ว</p>
                      <p className="font-bold text-slate-950">{model.uploadSummary.submittedTeamPlanCount}</p>
                    </div>
                    <div className="smart-home-panel p-4">
                      <p className="text-xs text-slate-500">รวมเข้าไฟล์อนุมัติแล้ว</p>
                      <p className="font-bold text-slate-950">{model.uploadSummary.includedInApprovedCount}</p>
                    </div>
                  </div>
                </div>
                <ActionButton onClick={() => setUploadApprovedOpen(true)} tone="primary">
                  <Upload className="h-4 w-4" />
                  {approvedFile ? 'แทนที่ไฟล์อนุมัติ' : 'อัปโหลดไฟล์อนุมัติ'}
                </ActionButton>
              </div>
            </section>
          )}

          {selectedCard.files.some((file) => file.isDeleted) && canUploadApproved && (
            <section className="smart-home-card p-5">
              <h2 className="text-lg font-bold text-slate-950">ไฟล์ที่ลบแล้ว</h2>
              <div className="mt-3 space-y-2">
                {selectedCard.files.filter((file) => file.isDeleted).map((file) => (
                  <div key={file.id} className="smart-home-panel flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm font-semibold text-slate-700">{file.fileName}</span>
                    <div className="flex gap-2">
                      <ActionButton onClick={() => handleRestore(selectedMonth, file.id)}><RotateCcw className="h-4 w-4" />คืนค่า</ActionButton>
                      <ActionButton onClick={() => handleHardDelete(selectedMonth, file.id)} tone="danger"><Trash2 className="h-4 w-4" />ลบถาวร</ActionButton>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      ) : null}

      {uploadTeamOpen && selectedCard && (
        <UploadPlanDialog
          open={uploadTeamOpen}
          year={year}
          month={selectedMonth}
          onClose={() => setUploadTeamOpen(false)}
          isAdmin={userContext.role === 'super_admin'}
          teams={teams.map((team) => ({ teamId: team.id, teamName: team.name }))}
          userTeamId={userContext.role !== 'super_admin' ? user?.teamId ?? undefined : undefined}
          userTeamName={user?.team?.name ?? undefined}
        />
      )}

      {uploadApprovedOpen && selectedCard && (
        <UploadMasterPlanDialog
          open={uploadApprovedOpen}
          year={year}
          month={selectedMonth}
          onClose={() => setUploadApprovedOpen(false)}
        />
      )}
    </div>
  )
}
