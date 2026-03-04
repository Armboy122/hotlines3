'use client'

import { useState, useMemo } from 'react'
import { Plus, CalendarDays, Loader2 } from 'lucide-react'
import { useAuthContext } from '@/lib/auth/auth-context'
import { useMonthlyPlanPeriod, useMonthlyPlanFiles, useMonthlyPlanStatus } from '@/hooks/useQueries'
import { useSoftDeleteFile, useHardDeleteFile, useRestoreFile } from '@/hooks/mutations/useMonthlyPlanMutations'
import { MonthSelector } from '@/features/monthly-plan/components/MonthSelector'
import { MasterPlanBanner, MasterPlanEmpty } from '@/features/monthly-plan/components/MasterPlanBanner'
import { TeamFilesGroup } from '@/features/monthly-plan/components/TeamFilesGroup'
import { LockBanner } from '@/features/monthly-plan/components/LockBanner'
import { SearchFilterBar } from '@/features/monthly-plan/components/SearchFilterBar'
import { UploadPlanDialog } from '@/features/monthly-plan/components/UploadPlanDialog'
import { formatPeriodLabelFull, formatPeriodLabel } from '@/features/monthly-plan/utils'
import type { MonthlyPlanPeriod } from '@/types/monthly-plan'

const NOW = new Date()
const CURRENT_YEAR = NOW.getFullYear()
const CURRENT_MONTH = NOW.getMonth() + 1

// Generate a sliding window of available months (prev 2, current, next 1)
function getAvailableMonths(): { year: number; month: number }[] {
  const months = []
  for (let offset = -2; offset <= 1; offset++) {
    let m = CURRENT_MONTH + offset
    let y = CURRENT_YEAR
    if (m < 1) { m += 12; y -= 1 }
    if (m > 12) { m -= 12; y += 1 }
    months.push({ year: y, month: m })
  }
  return months
}

const AVAILABLE_MONTHS = getAvailableMonths()

export default function MonthlyPlanPage() {
  const { user } = useAuthContext()
  const isAdmin = user?.role === 'admin'

  const [selectedIdx, setSelectedIdx] = useState(2) // default = current month
  const [uploadOpen, setUploadOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filterTeamId, setFilterTeamId] = useState<number | null>(null)

  const { year, month } = AVAILABLE_MONTHS[selectedIdx]

  const { data: period, isLoading: periodLoading } = useMonthlyPlanPeriod(year, month)
  const { data: allFiles = [], isLoading: filesLoading } = useMonthlyPlanFiles(year, month)
  const { data: statusData, isLoading: statusLoading } = useMonthlyPlanStatus(year, month)

  const softDelete = useSoftDeleteFile(year, month)
  const hardDelete = useHardDeleteFile(year, month)
  const restore = useRestoreFile(year, month)

  const locked = period?.isLocked ?? false

  // Block upload if: period is locked by backend, OR deadline has passed, OR it's a past month
  const isPastMonth =
    year < CURRENT_YEAR || (year === CURRENT_YEAR && month < CURRENT_MONTH)
  const deadlineStr = statusData?.deadline
  const deadlinePassed = deadlineStr
    ? new Date() > new Date(deadlineStr + 'T23:59:59')
    : false
  // effectiveLocked = true whenever any condition blocks a normal user from uploading
  const effectiveLocked = locked || deadlinePassed || isPastMonth
  const canUpload = isAdmin || !effectiveLocked

  // Build a fake period shape for components expecting MonthlyPlanPeriod
  const fakePeriod: MonthlyPlanPeriod | undefined = period ?? {
    id: 0,
    year,
    month,
    isLocked: false,
    createdAt: '',
  }

  const masterPlans = allFiles.filter((f) => f.isMasterPlan && !f.isDeleted)

  const allTeams = useMemo(
    () => (statusData?.teams ?? []).map((t) => ({ teamId: t.team.id, teamName: t.team.name })),
    [statusData]
  )

  const missedTeamNames = useMemo(
    () => (statusData?.teams ?? []).filter((t) => t.status === 'missed').map((t) => t.team.name),
    [statusData]
  )

  const getTeamFiles = (teamId: number) =>
    allFiles.filter((f) => !f.isMasterPlan && f.teamId === teamId)

  const filteredSubmissions = useMemo(() => {
    let list = statusData?.teams ?? []
    if (filterTeamId !== null) list = list.filter((t) => t.team.id === filterTeamId)
    return list
  }, [statusData, filterTeamId])

  const isLoading = periodLoading || filesLoading || statusLoading

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-10 space-y-5">
      {/* Page Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="p-2 icon-glass-green">
            <CalendarDays className="h-5 w-5 text-emerald-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">แผนงานประจำเดือน</h1>
        </div>
        <p className="text-sm text-gray-500 pl-11">
          แผนงาน{formatPeriodLabelFull(fakePeriod)}
        </p>
      </div>

      {/* Month Selector — use simple tab list */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {AVAILABLE_MONTHS.map((m, idx) => (
          <button
            key={`${m.year}-${m.month}`}
            onClick={() => setSelectedIdx(idx)}
            className={`
              shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
              ${idx === selectedIdx
                ? 'btn-gradient-green text-white shadow-md shadow-emerald-500/20'
                : 'bg-white/60 border border-gray-200/60 text-gray-600 hover:bg-white hover:border-emerald-200'
              }
            `}
          >
            {formatPeriodLabel({ id: 0, year: m.year, month: m.month, isLocked: false, createdAt: '' })}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 gap-3 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
          <span className="text-sm">กำลังโหลดข้อมูล...</span>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Lock Banner */}
          <LockBanner period={fakePeriod} missedTeams={missedTeamNames} isAdmin={isAdmin} effectiveLocked={effectiveLocked} />

          {/* Master Plans */}
          {masterPlans.length > 0 ? (
            <div className="space-y-3">
              {masterPlans.map((mp) => (
                <MasterPlanBanner key={mp.id} masterPlan={mp} year={year} month={month} />
              ))}
            </div>
          ) : (
            <MasterPlanEmpty />
          )}

          {/* Search & Filter */}
          <SearchFilterBar
            search={search}
            onSearchChange={setSearch}
            selectedTeamId={filterTeamId}
            onTeamChange={setFilterTeamId}
            teams={allTeams}
          />

          {/* Team Groups */}
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => {
              const teamFiles = getTeamFiles(submission.team.id).filter(
                (f) => !search.trim() || f.fileName.toLowerCase().includes(search.toLowerCase())
              )
              return (
                <TeamFilesGroup
                  key={submission.team.id}
                  submission={submission}
                  teamFiles={teamFiles}
                  currentUserTeamId={user?.teamId ?? null}
                  isAdmin={isAdmin}
                  isPeriodLocked={effectiveLocked}
                  onSoftDelete={(id) => softDelete.mutate(id)}
                  onHardDelete={(id) => hardDelete.mutate(id)}
                  onRestore={(id) => restore.mutate(id)}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Upload FAB */}
      {canUpload && (
        <div className="fixed bottom-24 md:bottom-8 right-4 sm:right-6 z-40">
          <button
            onClick={() => setUploadOpen(true)}
            className="flex items-center gap-2 btn-gradient-green text-white rounded-2xl px-5 py-3.5 shadow-xl shadow-emerald-500/30 font-semibold text-sm hover-scale"
          >
            <Plus className="h-5 w-5" />
            <span>อัพโหลดไฟล์</span>
          </button>
        </div>
      )}

      <UploadPlanDialog
        open={uploadOpen}
        year={year}
        month={month}
        onClose={() => setUploadOpen(false)}
        isAdmin={isAdmin}
        teams={allTeams}
        userTeamId={!isAdmin ? user?.teamId ?? undefined : undefined}
        userTeamName={!isAdmin ? statusData?.teams.find(t => t.team.id === user?.teamId)?.team.name : undefined}
      />

    </div>
  )
}
