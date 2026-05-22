'use client'

import { useState, useMemo } from 'react'
import { Plus, CalendarDays, Loader2, Crown, Settings, FileText, ShieldCheck } from 'lucide-react'
import { useAuthContext } from '@/lib/auth/auth-context'
import { isMonthlyPlanManager as isManager, isSuperAdmin as checkSuperAdmin } from '@/lib/auth/role-policy'
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
import { KpiCard, PageHero, PageShell } from '@/components/ui/page-shell'

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
  const roleIsSuperAdmin = checkSuperAdmin(user?.role)
  const roleIsManager = isManager(user?.role)

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
  const visibleTeams = useMemo(() => {
    if (roleIsSuperAdmin) return allTeams
    const currentTeamId = user?.teamId ?? null
    return currentTeamId == null ? [] : allTeams.filter((team) => team.teamId === currentTeamId)
  }, [allTeams, roleIsSuperAdmin, user?.teamId])
  const effectiveFilterTeamId = roleIsSuperAdmin ? filterTeamId : (user?.teamId ?? null)

  const missedTeamNames = useMemo(
    () => (statusData?.teams ?? []).filter((t) => t.status === 'missed').map((t) => t.team.name),
    [statusData]
  )

  const getTeamFiles = (teamId: number) =>
    allFiles.filter((f) => !f.isMasterPlan && f.teamId === teamId)

  const filteredSubmissions = useMemo(() => {
    let list = statusData?.teams ?? []
    if (effectiveFilterTeamId !== null) list = list.filter((t) => t.team.id === effectiveFilterTeamId)
    return list
  }, [statusData, effectiveFilterTeamId])

  const isLoading = periodLoading || filesLoading || statusLoading

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'files', label: 'ไฟล์แผนงาน', icon: <CalendarDays className="h-4 w-4" /> },
    { id: 'settings', label: 'ตั้งค่าระบบ', icon: <Settings className="h-4 w-4" /> },
  ]

  return (
    <PageShell className="space-y-5" maxWidth="xl">
      <PageHero
        eyebrow={<span>Admin Panel</span>}
        icon={<CalendarDays className="h-6 w-6 text-amber-200" />}
        title="แผนงานประจำเดือน"
        description={`แผนงาน${formatPeriodLabelFull(fakePeriod)} · คุมแผนรวม ไฟล์ทีม และรอบส่งในหน้าจอเดียว`}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiCard label="ไฟล์ทั้งหมด" value={allFiles.length} icon={<FileText className="h-5 w-5" />} tone="emerald" />
        <KpiCard label="แผนรวม" value={masterPlans.length} icon={<Crown className="h-5 w-5" />} tone="amber" />
        <KpiCard label="สถานะ" value={locked ? 'ล็อกแล้ว' : 'เปิดรับ'} icon={<ShieldCheck className="h-5 w-5" />} tone="gray" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl border border-white/70 bg-white/70 p-1 shadow-lg shadow-slate-900/5 backdrop-blur-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              min-h-11 flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200
              ${activeTab === tab.id ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md shadow-blue-500/20' : 'text-gray-500 hover:text-gray-700'}
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
                  min-h-11 shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                  ${idx === selectedIdx
                    ? 'btn-gradient-green text-white shadow-md shadow-blue-500/20'
                    : 'bg-white/60 border border-sky-100/70 text-gray-600 hover:bg-white hover:border-sky-200'
                  }
                `}
              >
                {formatPeriodLabel({ id: 0, year: m.year, month: m.month, isLocked: false, createdAt: '' })}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
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
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-sky-300/70 py-3 text-sm font-semibold text-blue-700 transition-all duration-200 hover:border-sky-400 hover:bg-sky-50/70"
                >
                  <Crown className="h-4 w-4" />
                  <span>อัพโหลดแผนรวมเพิ่ม</span>
                </button>
              </div>

              {/* Search & Filter */}
              <SearchFilterBar
                search={search}
                onSearchChange={setSearch}
                selectedTeamId={effectiveFilterTeamId}
                onTeamChange={roleIsSuperAdmin ? setFilterTeamId : (() => {})}
                teams={visibleTeams}
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
                      currentUserRole={user?.role}
                      isAdmin={roleIsManager}
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
              className="flex min-h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-3.5 text-sm font-semibold text-white shadow-xl shadow-blue-500/30 hover-scale"
            >
              <Plus className="h-5 w-5" />
              <span>อัพโหลดไฟล์</span>
            </button>
          </div>

          <UploadPlanDialog open={uploadOpen} year={year} month={month} onClose={() => setUploadOpen(false)} isAdmin={roleIsManager} teams={visibleTeams} userTeamId={user?.teamId ?? undefined} userTeamName={user?.team?.name ?? undefined} />
          <UploadMasterPlanDialog open={masterUploadOpen} year={year} month={month} onClose={() => setMasterUploadOpen(false)} />
        </>
      )}

    </PageShell>
  )
}
