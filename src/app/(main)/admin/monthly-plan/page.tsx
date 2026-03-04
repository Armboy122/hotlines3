'use client'

import { useState, useMemo } from 'react'
import { Plus, CalendarDays, Loader2, Crown, Settings } from 'lucide-react'
import { useAuthContext } from '@/lib/auth/auth-context'
import { useMonthlyPlanPeriod, useMonthlyPlanFiles, useMonthlyPlanStatus } from '@/hooks/useQueries'
import { useSoftDeleteFile, useHardDeleteFile, useRestoreFile } from '@/hooks/mutations/useMonthlyPlanMutations'
import { MasterPlanBanner, MasterPlanEmpty } from '@/features/monthly-plan/components/MasterPlanBanner'
import { TeamFilesGroup } from '@/features/monthly-plan/components/TeamFilesGroup'
import { LockBanner } from '@/features/monthly-plan/components/LockBanner'
import { SearchFilterBar } from '@/features/monthly-plan/components/SearchFilterBar'
import { UploadPlanDialog } from '@/features/monthly-plan/components/UploadPlanDialog'
import { UploadMasterPlanDialog } from '@/features/monthly-plan/components/UploadMasterPlanDialog'
import { AdminSettingsEditor } from '@/features/monthly-plan/components/AdminSettingsEditor'
import { formatPeriodLabelFull, formatPeriodLabel } from '@/features/monthly-plan/utils'
import type { MonthlyPlanPeriod } from '@/types/monthly-plan'

type AdminTab = 'files' | 'settings'

const NOW = new Date()
const CURRENT_YEAR = NOW.getFullYear()
const CURRENT_MONTH = NOW.getMonth() + 1

function getAvailableMonths(): { year: number; month: number }[] {
  const months = []
  for (let offset = -3; offset <= 2; offset++) {
    let m = CURRENT_MONTH + offset
    let y = CURRENT_YEAR
    if (m < 1) { m += 12; y -= 1 }
    if (m > 12) { m -= 12; y += 1 }
    months.push({ year: y, month: m })
  }
  return months
}

const AVAILABLE_MONTHS = getAvailableMonths()

export default function AdminMonthlyPlanPage() {
  const { user } = useAuthContext()

  const [selectedIdx, setSelectedIdx] = useState(3) // default = current month
  const [activeTab, setActiveTab] = useState<AdminTab>('files')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [masterUploadOpen, setMasterUploadOpen] = useState(false)
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

  const fakePeriod: MonthlyPlanPeriod = period ?? {
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

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'files', label: 'ไฟล์แผนงาน', icon: <CalendarDays className="h-4 w-4" /> },
    { id: 'settings', label: 'ตั้งค่าระบบ', icon: <Settings className="h-4 w-4" /> },
  ]

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-10 space-y-5">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-6 sm:p-8 text-white shadow-2xl shadow-emerald-500/20">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1">
            <CalendarDays className="h-3.5 w-3.5 text-amber-300" />
            <span className="text-xs font-semibold">Admin Panel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">แผนงานประจำเดือน</h1>
          <p className="text-sm text-white/80">แผนงาน{formatPeriodLabelFull(fakePeriod)}</p>
        </div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100/80 p-1 rounded-2xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200
              ${activeTab === tab.id ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}
            `}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'settings' ? (
        <AdminSettingsEditor />
      ) : (
        <>
          {/* Month Selector */}
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
              <LockBanner period={fakePeriod} missedTeams={missedTeamNames} isAdmin={true} />

              {/* Master Plans List */}
              <div className="space-y-3">
                {masterPlans.length > 0 ? (
                  <div className="space-y-3">
                    {masterPlans.map((mp) => (
                      <MasterPlanBanner
                        key={mp.id}
                        masterPlan={mp}
                        year={year}
                        month={month}
                        isAdmin
                        onHardDelete={(id) => hardDelete.mutate(id)}
                      />
                    ))}
                  </div>
                ) : (
                  <MasterPlanEmpty />
                )}
                <button
                  onClick={() => setMasterUploadOpen(true)}
                  className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-emerald-300/60 rounded-2xl py-3 text-sm font-semibold text-emerald-600 hover:bg-emerald-50/40 hover:border-emerald-400 transition-all duration-200"
                >
                  <Crown className="h-4 w-4" />
                  <span>อัพโหลดแผนรวมเพิ่ม</span>
                </button>
              </div>

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
                      isAdmin={true}
                      isPeriodLocked={locked}
                      onSoftDelete={(id) => softDelete.mutate(id)}
                      onHardDelete={(id) => hardDelete.mutate(id)}
                      onRestore={(id) => restore.mutate(id)}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* Upload FAB (admin can always upload) */}
          <div className="fixed bottom-24 md:bottom-8 right-4 sm:right-6 z-40">
            <button
              onClick={() => setUploadOpen(true)}
              className="flex items-center gap-2 btn-gradient-green text-white rounded-2xl px-5 py-3.5 shadow-xl shadow-emerald-500/30 font-semibold text-sm hover-scale"
            >
              <Plus className="h-5 w-5" />
              <span>อัพโหลดไฟล์</span>
            </button>
          </div>

          <UploadPlanDialog open={uploadOpen} year={year} month={month} onClose={() => setUploadOpen(false)} isAdmin teams={allTeams} />
          <UploadMasterPlanDialog open={masterUploadOpen} year={year} month={month} onClose={() => setMasterUploadOpen(false)} />
        </>
      )}

    </div>
  )
}
