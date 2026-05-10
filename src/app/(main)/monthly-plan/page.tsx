'use client'

import { useMemo, useState } from 'react'
import { CalendarDays, CheckCircle2, FileText, Loader2, Lock, Plus, Wrench } from 'lucide-react'
import { useAuthContext } from '@/lib/auth/auth-context'
import { canSubmitMonthlyPlan, isPrivilegedAdmin } from '@/lib/auth/role-policy'
import { useMonthlyPlanYearOverview, useTeams } from '@/hooks/useQueries'
import { useHardDeleteFile, useRestoreFile, useSoftDeleteFile } from '@/hooks/mutations/useMonthlyPlanMutations'
import { MasterPlanBanner, MasterPlanEmpty } from '@/features/monthly-plan/components/MasterPlanBanner'
import { PlanFileRow } from '@/features/monthly-plan/components/PlanFileRow'
import { UploadPlanDialog } from '@/features/monthly-plan/components/UploadPlanDialog'
import {
  buildMonthlyPlanTeamRows,
  buildYearlyMonthlyPlanCards,
  formatMonthlyPlanYearLabel,
  getDefaultMonthlyPlanYear,
  type YearlyMonthlyPlanCard,
} from '@/features/monthly-plan/utils'
import { PageHero, PageShell, KpiCard } from '@/components/ui/page-shell'

const STATUS_COPY: Record<string, { label: string; className: string }> = {
  has_files: { label: 'มีไฟล์แล้ว', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  locked: { label: 'ปิดรับแล้ว', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  open: { label: 'เปิดรับแผน', className: 'bg-amber-50 text-amber-700 border-amber-200' },
}

function statusCopy(status: string) {
  return STATUS_COPY[status] ?? STATUS_COPY.open
}

function formatDeadline(deadline: string | null): string {
  if (!deadline) return 'ไม่พบกำหนดส่ง'
  return new Date(`${deadline}T00:00:00`).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function MonthCard({
  card,
  isAdmin,
  canUpload,
  currentUserTeamId,
  teams,
  onUpload,
  onSoftDelete,
  onHardDelete,
  onRestore,
}: {
  card: YearlyMonthlyPlanCard
  isAdmin: boolean
  canUpload: boolean
  currentUserTeamId: number | null
  teams: { id: number; name: string }[]
  onUpload: (month: number) => void
  onSoftDelete: (month: number, fileId: number) => void
  onHardDelete: (month: number, fileId: number) => void
  onRestore: (month: number, fileId: number) => void
}) {
  const status = statusCopy(card.status)
  const teamRows = buildMonthlyPlanTeamRows(card, teams, currentUserTeamId)
  const activeTeamFiles = card.teamFiles.filter((file) => !file.isDeleted)

  return (
    <section className="card-glass rounded-2xl p-4 sm:p-5 space-y-4" data-month={card.month}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 icon-glass-green">
              <CalendarDays className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{card.label}</h2>
              <p className="text-xs text-gray-500">กำหนดส่ง {formatDeadline(card.deadline)}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 pl-10">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}>
              {status.label}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white/70 px-2.5 py-1 text-xs font-semibold text-gray-600">
              <FileText className="h-3.5 w-3.5" />
              {card.fileCount} ไฟล์
            </span>
            {card.isLocked && (
              <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-500">
                <Lock className="h-3.5 w-3.5" />
                ล็อกแล้ว
              </span>
            )}
          </div>
        </div>

        {canUpload && card.canUpload && (
          <button
            onClick={() => onUpload(card.month)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white btn-gradient-green shadow-md shadow-emerald-500/20"
          >
            <Plus className="h-4 w-4" />
            อัพโหลดเดือนนี้
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <p className="mb-2 text-sm font-bold text-gray-700">แผนรวมประจำเดือน</p>
          {card.masterPlans.length > 0 ? (
            <div className="space-y-2">
              {card.masterPlans.map((masterPlan) => (
                <MasterPlanBanner
                  key={masterPlan.id}
                  masterPlan={masterPlan}
                  year={card.year}
                  month={card.month}
                  isAdmin={isAdmin}
                  onHardDelete={(fileId) => onHardDelete(card.month, fileId)}
                />
              ))}
            </div>
          ) : (
            <MasterPlanEmpty />
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-gray-700">แผนรายทีม</p>
            {activeTeamFiles.length === 0 && (
              <span className="text-xs text-gray-400">ยังไม่มีไฟล์รายทีม</span>
            )}
          </div>

          {teamRows.map((teamRow) => {
            const visibleFiles = teamRow.files.filter((file) => !file.isDeleted || isAdmin || teamRow.isOwnTeam)
            const showEmptyTeamRow = visibleFiles.length === 0
            return (
              <div key={teamRow.teamId ?? 'none'} className="rounded-xl border border-gray-100/70 bg-white/45 p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <Wrench className="h-4 w-4 text-emerald-600" />
                    {teamRow.teamName}
                  </div>
                  {teamRow.isOwnTeam && !isAdmin && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      ทีมของคุณ
                    </span>
                  )}
                </div>
                {showEmptyTeamRow ? (
                  <div className="rounded-lg border border-dashed border-gray-200 bg-white/35 px-3 py-2 text-xs text-gray-400">
                    ยังไม่มีไฟล์แผนงานของทีมนี้
                  </div>
                ) : (
                  <div className="space-y-2">
                    {visibleFiles.map((file) => (
                      <PlanFileRow
                        key={file.id}
                        file={file}
                        canDownload={isAdmin || teamRow.isOwnTeam}
                        canSoftDelete={isAdmin}
                        canHardDelete={isAdmin}
                        canRestore={isAdmin}
                        onSoftDelete={(fileId) => onSoftDelete(card.month, fileId)}
                        onHardDelete={(fileId) => onHardDelete(card.month, fileId)}
                        onRestore={(fileId) => onRestore(card.month, fileId)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default function MonthlyPlanPage() {
  const { user } = useAuthContext()
  const isAdmin = isPrivilegedAdmin(user?.role)
  const year = getDefaultMonthlyPlanYear()
  const [uploadMonth, setUploadMonth] = useState<number | null>(null)
  const [mutationMonth, setMutationMonth] = useState<number>(1)

  const { data: overview, isLoading: overviewLoading } = useMonthlyPlanYearOverview(year)
  const { data: teams = [], isLoading: teamsLoading } = useTeams()
  const softDelete = useSoftDeleteFile(year, mutationMonth)
  const hardDelete = useHardDeleteFile(year, mutationMonth)
  const restore = useRestoreFile(year, mutationMonth)

  const cards = useMemo(
    () => (overview ? buildYearlyMonthlyPlanCards(overview) : []),
    [overview]
  )
  const totalFiles = cards.reduce((sum, card) => sum + card.fileCount, 0)
  const lockedMonths = cards.filter((card) => card.isLocked).length
  const uploadableMonths = cards.filter((card) => card.canUpload).length
  const isLoading = overviewLoading || (isAdmin && teamsLoading)

  const handleMutation = (month: number, fileId: number, action: 'soft' | 'hard' | 'restore') => {
    setMutationMonth(month)
    if (action === 'soft') softDelete.mutate(fileId)
    if (action === 'hard') hardDelete.mutate(fileId)
    if (action === 'restore') restore.mutate(fileId)
  }

  return (
    <PageShell className="space-y-5" maxWidth="xl">
      <PageHero
        eyebrow={<span>Monthly Plan</span>}
        icon={<CalendarDays className="h-6 w-6 text-white" />}
        title="แผนงานประจำปี"
        description={`แผนงานทั้งปี ${formatMonthlyPlanYearLabel(year)} แสดงครบ 12 เดือนในหน้าเดียว`}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard label="ปีแผนงาน" value={`พ.ศ. ${year + 543}`} icon={<CalendarDays className="h-5 w-5" />} tone="emerald" />
        <KpiCard label="จำนวนไฟล์รวม" value={totalFiles} icon={<FileText className="h-5 w-5" />} tone="amber" />
        <KpiCard label="สถานะรอบส่ง" value={`${lockedMonths}/12 · เปิด ${uploadableMonths}`} icon={<Lock className="h-5 w-5" />} tone="gray" />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 gap-3 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
          <span className="text-sm">กำลังโหลดแผนงานทั้งปี...</span>
        </div>
      ) : cards.length === 0 ? (
        <div className="card-glass rounded-2xl p-6 text-sm text-gray-500">ไม่พบข้อมูลแผนงานประจำปี</div>
      ) : (
        <div className="space-y-4">
          {cards.map((card) => {
            const canUpload = canSubmitMonthlyPlan({
              role: user?.role,
              isLocked: card.isLocked,
              hasTeam: user?.teamId != null,
            })
            return (
              <MonthCard
                key={card.month}
                card={card}
                isAdmin={isAdmin}
                canUpload={canUpload}
                currentUserTeamId={user?.teamId ?? null}
                teams={teams}
                onUpload={setUploadMonth}
                onSoftDelete={(month, fileId) => handleMutation(month, fileId, 'soft')}
                onHardDelete={(month, fileId) => handleMutation(month, fileId, 'hard')}
                onRestore={(month, fileId) => handleMutation(month, fileId, 'restore')}
              />
            )
          })}
        </div>
      )}

      {uploadMonth != null && (
        <UploadPlanDialog
          open={uploadMonth != null}
          year={year}
          month={uploadMonth}
          onClose={() => setUploadMonth(null)}
          isAdmin={isAdmin}
          teams={teams.map((team) => ({ teamId: team.id, teamName: team.name }))}
          userTeamId={!isAdmin ? user?.teamId ?? undefined : undefined}
          userTeamName={undefined}
        />
      )}
    </PageShell>
  )
}
