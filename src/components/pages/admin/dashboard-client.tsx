'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ListChecks,
  Loader2,
  Zap,
  Trophy,
  Briefcase,
  Users,
  TrendingUp,
  Award,
  BarChart3,
  Calendar
} from 'lucide-react'
import { useTopJobDetails, useTopFeeders, useFeederJobMatrix, useFeeders, useDashboardSummary, useTeams, useJobTypes } from '@/hooks/useQueries'
import type { FeederWithStation } from '@/types/query-types'
import type { DashboardSummary, TopJobDetail, TopFeeder, Feeder, JobType, Team } from '@/types/api'
import { KpiCard, PageHero, PageShell } from '@/components/ui/page-shell'

const FeederMatrixChart = dynamic(
  () => import('@/components/pages/admin/feeder-matrix-chart'),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-gray-500">
        กำลังโหลดกราฟ...
      </div>
    ),
  },
)

interface DashboardClientProps {
  initialSummary?: DashboardSummary
  initialTopJobDetails?: TopJobDetail[]
  initialTopFeeders?: TopFeeder[]
  initialTeams: Team[]
  initialJobTypes: JobType[]
  initialFeeders: Feeder[]
}

export default function DashboardClient({
  initialSummary,
  initialTopJobDetails,
  initialTopFeeders,
  initialTeams,
  initialJobTypes,
  initialFeeders,
}: DashboardClientProps) {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [selectedTeamId, setSelectedTeamId] = useState<string>('all')
  const [selectedJobTypeId, setSelectedJobTypeId] = useState<string>('all')
  const [selectedFeederId, setSelectedFeederId] = useState<string>('')

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)

  // Fetch data with initial data support
  const { data: teams = [] } = useTeams({ initialData: initialTeams })
  const { data: jobTypes = [] } = useJobTypes({ initialData: initialJobTypes })

  const month = selectedMonth === 'all' ? undefined : parseInt(selectedMonth)
  const teamId = selectedTeamId === 'all' ? undefined : selectedTeamId
  const jobTypeId = selectedJobTypeId === 'all' ? undefined : selectedJobTypeId

  const { data: summary, isLoading: loadingSummary } = useDashboardSummary(selectedYear, month, teamId, jobTypeId, { initialData: initialSummary })
  const { data: topJobDetails = [], isLoading: loadingJobDetails } = useTopJobDetails(selectedYear, 10, month, teamId, jobTypeId, { initialData: initialTopJobDetails })
  const { data: topFeeders = [], isLoading: loadingFeeders } = useTopFeeders(selectedYear, 10, month, teamId, jobTypeId, { initialData: initialTopFeeders })
  const { data: feederMatrix, isLoading: loadingMatrix } = useFeederJobMatrix(selectedFeederId, selectedYear, month, teamId, jobTypeId)
  const { data: allFeeders = [] } = useFeeders({ initialData: initialFeeders })

  const typedFeeders = allFeeders as FeederWithStation[]

  const loading = loadingSummary || loadingJobDetails || loadingFeeders

  // Handler สำหรับคลิก Feeder
  const handleFeederClick = (feederId: string) => {
    setSelectedFeederId(feederId)
    // Scroll to matrix section
    setTimeout(() => {
      document.getElementById('feeder-matrix')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  if (loading) {
    return (
      <PageShell maxWidth="xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-emerald-600" />
            <p className="text-lg text-gray-600">กำลังโหลดข้อมูล Dashboard...</p>
          </div>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell className="space-y-5" maxWidth="xl">
      <PageHero
        eyebrow={<span>Analytics</span>}
        icon={<BarChart3 className="h-6 w-6 text-amber-200" />}
        title="Dashboard วิเคราะห์งาน"
        description="สรุปสถานะงานประจำวันและจุดที่ควรตรวจต่อด้วยมุมมอง mobile-first"
      />

      <Card className="card-glass overflow-hidden">
        <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="year" className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4 text-emerald-500" />
                  ปี
                </Label>
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="input-glass min-h-11 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="month" className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4 text-emerald-500" />
                  เดือน
                </Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="input-glass min-h-11 w-full">
                    <SelectValue placeholder="ทุกเดือน" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกเดือน</SelectItem>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {new Date(0, i).toLocaleString('th-TH', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="team" className="flex items-center gap-2 text-gray-600">
                  <Users className="h-4 w-4 text-emerald-500" />
                  ทีม
                </Label>
                <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                  <SelectTrigger className="input-glass min-h-11 w-full">
                    <SelectValue placeholder="ทุกทีม" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกทีม</SelectItem>
                    {teams.map((team: Team) => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobType" className="flex items-center gap-2 text-gray-600">
                  <Briefcase className="h-4 w-4 text-amber-500" />
                  ประเภทงาน
                </Label>
                <Select value={selectedJobTypeId} onValueChange={setSelectedJobTypeId}>
                  <SelectTrigger className="input-glass min-h-11 w-full">
                    <SelectValue placeholder="ทุกประเภท" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกประเภท</SelectItem>
                    {jobTypes.map((type: JobType) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
        </CardContent>
      </Card>

      {/* Summary Cards - Multi-color */}
      {summary && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <KpiCard label="จำนวนงานทั้งหมด" value={summary.totalTasks} icon={<Briefcase className="h-5 w-5" />} tone="emerald" />

          <Card className="card-glass-yellow group hover:scale-[1.02] transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ทีมที่ทำงานมากสุด</p>
                  {summary.topTeam ? (
                    <>
                      <p className="text-lg font-bold text-gray-900 mt-2 line-clamp-1">{summary.topTeam.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{summary.topTeam.count} งาน</p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 mt-2">ไม่มีข้อมูล</p>
                  )}
                </div>
                <div className="icon-glass-yellow p-3 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top 10 Job Details - Glass Table */}
      <Card className="card-glass-green overflow-hidden">
        <CardHeader className="border-b border-white/30 flex items-center py-4">
          <CardTitle className="text-lg sm:text-xl flex items-center justify-center gap-2 text-gray-900 w-full">
            <div className="icon-glass-green p-2">
              <Trophy className="h-5 w-5" />
            </div>
            Top 10 รายละเอียดงานที่ทำบ่อยที่สุด
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {topJobDetails && topJobDetails.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="backdrop-blur-sm bg-white/40 border-b border-white/30">
                  <tr>
                    <th className="text-left p-2 sm:p-4 text-gray-900 font-semibold w-16 sm:w-20">อันดับ</th>
                    <th className="text-left p-2 sm:p-4 text-gray-900 font-semibold">รายละเอียดงาน</th>
                    <th className="text-right p-2 sm:p-4 text-gray-900 font-semibold w-20 sm:w-24">จำนวน</th>
                  </tr>
                </thead>
                <tbody>
                  {topJobDetails.map((item, index) => {
                    return (
                      <tr key={item.id} className="border-b border-white/20 hover:bg-white/30 transition-colors">
                        <td className="p-2 sm:p-4">
                          <div className="flex items-center gap-1 sm:gap-2">
                            {index < 3 ? (
                              <Award className={`h-4 w-4 sm:h-5 sm:w-5 ${
                                index === 0 ? 'text-amber-500' :
                                index === 1 ? 'text-gray-400' :
                                'text-amber-600'
                              }`} />
                            ) : (
                              <Badge variant="outline" className="badge-glass-green border-emerald-500/30 text-emerald-700 text-xs px-1.5 py-0.5">
                                #{index + 1}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-2 sm:p-4">
                          <div className="space-y-1">
                            <p className="font-semibold text-sm sm:text-base text-gray-900 leading-tight">{item.name}</p>
                          </div>
                        </td>
                        <td className="p-2 sm:p-4 text-right">
                          <p className="text-lg sm:text-xl font-bold text-emerald-600">{item.count}</p>
                          <p className="text-xs text-gray-500">ครั้ง</p>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <ListChecks className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>ไม่มีข้อมูลรายละเอียดงานในปีนี้</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top 10 Feeders - Glass Clickable Table */}
      <Card className="card-glass-yellow overflow-hidden">
        <CardHeader className="border-b border-white/30 flex items-center py-4">
          <CardTitle className="text-lg sm:text-xl flex items-center justify-center gap-2 text-gray-900 w-full">
            <div className="icon-glass-yellow p-2">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            Top 10 ฟีดเดอร์ที่มีงานเยอะที่สุด
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {topFeeders && topFeeders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="backdrop-blur-sm bg-white/40 border-b-2 border-white/30">
                  <tr>
                    <th className="text-left p-2 sm:p-4 text-gray-900 font-semibold w-16 sm:w-20">อันดับ</th>
                    <th className="text-left p-2 sm:p-4 text-gray-900 font-semibold">รหัสฟีดเดอร์</th>
                    <th className="text-right p-2 sm:p-4 text-gray-900 font-semibold w-20 sm:w-24">จำนวน</th>
                  </tr>
                </thead>
                <tbody>
                  {topFeeders.map((feeder, index) => {
                    const isSelected = selectedFeederId === feeder.id.toString()
                    return (
                      <tr
                        key={feeder.id}
                        onClick={() => handleFeederClick(feeder.id.toString())}
                        className={`border-b border-white/20 hover:bg-white/30 transition-all cursor-pointer ${
                          isSelected ? 'bg-amber-500/20 border-l-4 border-l-amber-600 shadow-lg shadow-amber-500/20' : ''
                        }`}
                      >
                        <td className="p-2 sm:p-4">
                          <div className="flex items-center gap-1 sm:gap-2">
                            {index < 3 ? (
                              <Award className={`h-4 w-4 sm:h-5 sm:w-5 ${
                                index === 0 ? 'text-amber-500' :
                                index === 1 ? 'text-gray-400' :
                                'text-amber-600'
                              }`} />
                            ) : (
                              <Badge variant="outline" className="badge-glass-yellow border-amber-500/30 text-amber-700 text-xs px-1.5 py-0.5">
                                #{index + 1}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-2 sm:p-4">
                          <div className="space-y-1">
                            <p className="font-bold text-sm sm:text-base text-gray-900">{feeder.code}</p>
                            <p className="text-xs sm:text-sm text-gray-600">{feeder.stationName}</p>
                          </div>
                        </td>
                        <td className="p-2 sm:p-4 text-right">
                          <p className="text-lg sm:text-xl font-bold text-amber-600">{feeder.count}</p>
                          <p className="text-xs text-gray-500">ครั้ง</p>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div className="p-3 sm:p-4 backdrop-blur-sm bg-white/30 border-t border-white/30">
                <p className="text-xs sm:text-sm text-amber-800 flex items-center gap-2 font-semibold">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                  คลิกที่ฟีดเดอร์เพื่อดูรายละเอียดงานด้านล่าง
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Zap className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>ไม่มีข้อมูลฟีดเดอร์ในปีนี้</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feeder × Job Detail Matrix - Glass */}
      <Card id="feeder-matrix" className="card-glass overflow-hidden scroll-mt-6">
        <CardHeader className="border-b border-white/30">
          <CardTitle className="text-lg sm:text-xl text-gray-900 flex items-center gap-2">
            <div className="icon-glass-green p-2">
              <Zap className="h-5 w-5" />
            </div>
            วิเคราะห์รายละเอียดงานตามฟีดเดอร์
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feederId" className="text-gray-700 font-semibold">เลือกฟีดเดอร์</Label>
            <Select value={selectedFeederId} onValueChange={(value) => setSelectedFeederId(value)}>
              <SelectTrigger className="min-h-11 w-full">
                <SelectValue placeholder="เลือกฟีดเดอร์เพื่อดูรายละเอียด หรือคลิกจากตารางด้านบน" />
              </SelectTrigger>
              <SelectContent>
                {typedFeeders.map((f) => (
                  <SelectItem key={f.id} value={f.id.toString()}>
                    {f.code} - {f.station?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loadingMatrix && (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-green-600" />
              <p className="text-sm text-gray-500">กำลังโหลดข้อมูล...</p>
            </div>
          )}

          {!loadingMatrix && feederMatrix && (
            <div className="space-y-4">
              {/* Summary - Glass Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="card-glass-green hover:scale-[1.02] transition-all">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-1">ฟีดเดอร์</p>
                    <p className="text-xl font-bold text-gray-900">{feederMatrix.feederCode}</p>
                  </CardContent>
                </Card>
                <Card className="card-glass-gray hover:scale-[1.02] transition-all">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-1">สถานี</p>
                    <p className="text-xl font-bold text-gray-900">{feederMatrix.stationName}</p>
                  </CardContent>
                </Card>
                <Card className="card-glass-yellow hover:scale-[1.02] transition-all">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-1">จำนวนงานรวม</p>
                    <p className="text-xl font-bold text-gray-900">{feederMatrix.totalCount} งาน</p>
                  </CardContent>
                </Card>
              </div>

              {feederMatrix.jobDetails && feederMatrix.jobDetails.length > 0 ? (
                <>
                  {/* Horizontal Bar Chart */}
                  <FeederMatrixChart jobDetails={feederMatrix.jobDetails} />

                  {/* Detail Cards - Multi-color Glass */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
                    {feederMatrix.jobDetails.map((item, index) => {
                      const glassClasses = ['card-glass-green', 'card-glass-gray', 'card-glass-yellow', 'card-glass']
                      const badgeClasses = ['badge-glass-green', 'badge-glass-green', 'badge-glass-yellow', 'badge-glass-yellow']
                      const textColors = ['text-emerald-600', 'text-emerald-700', 'text-amber-600', 'text-amber-700']
                      const glassClass = glassClasses[index % glassClasses.length]
                      const badgeClass = badgeClasses[index % badgeClasses.length]
                      const textColor = textColors[index % textColors.length]

                      return (
                        <Card key={item.id} className={`${glassClass} hover:scale-[1.02] transition-all`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <Badge variant="outline" className={`text-xs ${badgeClass}`}>
                                #{index + 1}
                              </Badge>
                            </div>
                            <p className="font-semibold text-sm text-gray-900 mb-2 line-clamp-2">{item.name}</p>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-500">จำนวนครั้ง</p>
                              <p className={`text-2xl font-bold ${textColor}`}>{item.count}</p>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>ไม่มีข้อมูลงานสำหรับฟีดเดอร์นี้ในปีที่เลือก</p>
                </div>
              )}
            </div>
          )}

          {!loadingMatrix && !feederMatrix && selectedFeederId && (
            <div className="text-center py-8 text-gray-500">
              <p>ไม่พบข้อมูลฟีดเดอร์</p>
            </div>
          )}

          {!selectedFeederId && (
            <div className="text-center py-12 text-gray-400">
              <Zap className="h-12 w-12 mx-auto mb-3" />
              <p className="font-medium">กรุณาเลือกฟีดเดอร์เพื่อดูรายละเอียดงาน</p>
              <p className="text-sm mt-2">หรือคลิกที่ฟีดเดอร์จากตาราง Top 10 ด้านบน</p>
            </div>
          )}
        </CardContent>
      </Card>
    </PageShell>
  )
}
