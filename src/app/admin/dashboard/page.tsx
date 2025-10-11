'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Combobox } from '@/components/ui/combobox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
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
import { useTopJobDetails, useTopFeeders, useFeederJobMatrix, useFeeders, useDashboardSummary } from '@/hooks/useQueries'
import type { FeederWithStation } from '@/types/query-types'

const COLORS = {
  green: ['#22c55e', '#16a34a', '#15803d', '#4ade80', '#86efac'],  // green-500, green-600, green-700, lighter variations
  yellow: ['#eab308', '#f59e0b', '#fbbf24', '#facc15', '#fde047'],  // yellow-500, amber-500, yellow-400, lighter variations
}

export default function DashboardPage() {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedFeederId, setSelectedFeederId] = useState<string>('')

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)

  // Fetch data
  const { data: summary, isLoading: loadingSummary } = useDashboardSummary(selectedYear)
  const { data: topJobDetails = [], isLoading: loadingJobDetails } = useTopJobDetails(selectedYear, 10)
  const { data: topFeeders = [], isLoading: loadingFeeders } = useTopFeeders(selectedYear, 10)
  const { data: feederMatrix, isLoading: loadingMatrix } = useFeederJobMatrix(selectedFeederId, selectedYear)
  const { data: allFeeders = [] } = useFeeders()

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
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-green-600" />
            <p className="text-lg text-muted-foreground">กำลังโหลดข้อมูล Dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <h1 className="flex items-center gap-3 text-2xl sm:text-3xl font-bold text-gray-900">
            <BarChart3 className="h-8 w-8 text-green-500" />
            Dashboard วิเคราะห์งาน
          </h1>
          <p className="text-gray-600 mt-1">สรุปสถิติและวิเคราะห์รายงานงานประจำวัน</p>
        </div>
        <div className="space-y-2 w-full sm:w-auto">
          <Label htmlFor="year" className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4 text-green-500" />
            ปี
          </Label>
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-full sm:w-32 border-green-200 focus:border-green-500">
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
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="shadow-sm border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">จำนวนงานทั้งหมด</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{summary.totalTasks}</p>
                  <p className="text-xs text-gray-500 mt-1">งานในปี {selectedYear}</p>
                </div>
                <Briefcase className="h-12 w-12 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200 bg-white">
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
                <Users className="h-12 w-12 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top 10 Job Details - Table Style */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="bg-white border-b border-gray-200 flex items-center py-4">
          <CardTitle className="text-lg sm:text-xl flex items-center justify-center gap-2 text-gray-900 w-full">
            <Trophy className="h-5 w-5 text-green-500" />
            Top 10 รายละเอียดงานที่ทำบ่อยที่สุด
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {topJobDetails && topJobDetails.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-2 sm:p-4 text-gray-900 font-semibold w-16 sm:w-20">อันดับ</th>
                    <th className="text-left p-2 sm:p-4 text-gray-900 font-semibold">รายละเอียดงาน</th>
                    <th className="text-right p-2 sm:p-4 text-gray-900 font-semibold w-20 sm:w-24">จำนวน</th>
                  </tr>
                </thead>
                <tbody>
                  {topJobDetails.map((item, index) => {
                    return (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-green-50/50 transition-colors">
                        <td className="p-2 sm:p-4">
                          <div className="flex items-center gap-1 sm:gap-2">
                            {index < 3 ? (
                              <Award className={`h-4 w-4 sm:h-5 sm:w-5 ${
                                index === 0 ? 'text-yellow-500' :
                                index === 1 ? 'text-gray-400' :
                                'text-yellow-600'
                              }`} />
                            ) : (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs px-1.5 py-0.5">
                                #{index + 1}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-2 sm:p-4">
                          <div className="space-y-1">
                            <p className="font-semibold text-sm sm:text-base text-green-900 leading-tight">{item.name}</p>
                          </div>
                        </td>
                        <td className="p-2 sm:p-4 text-right">
                          <p className="text-lg sm:text-xl font-bold text-green-600">{item.count}</p>
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

      {/* Top 10 Feeders - Clickable Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200 flex items-center py-4">
          <CardTitle className="text-lg sm:text-xl flex items-center justify-center gap-2 text-green-900 w-full">
            <Zap className="h-5 w-5 sm:h-6 sm:w-6" />
            Top 10 ฟีดเดอร์ที่มีงานเยอะที่สุด
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {topFeeders && topFeeders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-green-50 border-b-2 border-green-200">
                  <tr>
                    <th className="text-left p-2 sm:p-4 text-green-900 font-semibold w-16 sm:w-20">อันดับ</th>
                    <th className="text-left p-2 sm:p-4 text-green-900 font-semibold">รหัสฟีดเดอร์</th>
                    <th className="text-right p-2 sm:p-4 text-green-900 font-semibold w-20 sm:w-24">จำนวน</th>
                  </tr>
                </thead>
                <tbody>
                  {topFeeders.map((feeder, index) => {
                    const isSelected = selectedFeederId === feeder.id
                    return (
                      <tr
                        key={feeder.id}
                        onClick={() => handleFeederClick(feeder.id)}
                        className={`border-b border-gray-100 hover:bg-green-50 transition-colors cursor-pointer ${
                          isSelected ? 'bg-green-100 border-l-4 border-l-green-600' : ''
                        }`}
                      >
                        <td className="p-2 sm:p-4">
                          <div className="flex items-center gap-1 sm:gap-2">
                            {index < 3 ? (
                              <Award className={`h-4 w-4 sm:h-5 sm:w-5 ${
                                index === 0 ? 'text-yellow-500' :
                                index === 1 ? 'text-gray-400' :
                                'text-yellow-600'
                              }`} />
                            ) : (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs px-1.5 py-0.5">
                                #{index + 1}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-2 sm:p-4">
                          <div className="space-y-1">
                            <p className="font-bold text-sm sm:text-base text-green-900">{feeder.code}</p>
                            <p className="text-xs sm:text-sm text-gray-600">{feeder.stationName}</p>
                          </div>
                        </td>
                        <td className="p-2 sm:p-4 text-right">
                          <p className="text-lg sm:text-xl font-bold text-green-600">{feeder.count}</p>
                          <p className="text-xs text-gray-500">ครั้ง</p>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div className="p-3 sm:p-4 bg-green-50 border-t border-green-200">
                <p className="text-xs sm:text-sm text-green-700 flex items-center gap-2">
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

      {/* Feeder × Job Detail Matrix */}
      <Card id="feeder-matrix" className="border-0 shadow-lg scroll-mt-6">
        <CardHeader className="bg-gradient-to-r from-green-50 via-yellow-50 to-yellow-100 border-b border-green-200">
          <CardTitle className="text-lg sm:text-xl text-green-900">
            🔍 วิเคราะห์รายละเอียดงานตามฟีดเดอร์
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feederId" className="text-green-900">เลือกฟีดเดอร์</Label>
            <Combobox
              options={typedFeeders.map((f) => ({
                value: f.id.toString(),
                label: `${f.code} - ${f.station?.name}`,
              }))}
              value={selectedFeederId}
              onValueChange={(value) => setSelectedFeederId(value)}
              placeholder="เลือกฟีดเดอร์เพื่อดูรายละเอียด หรือคลิกจากตารางด้านบน"
              searchPlaceholder="ค้นหาฟีดเดอร์..."
              emptyText="ไม่พบฟีดเดอร์"
            />
          </div>

          {loadingMatrix && (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-green-600" />
              <p className="text-sm text-gray-500">กำลังโหลดข้อมูล...</p>
            </div>
          )}

          {!loadingMatrix && feederMatrix && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <p className="text-sm text-green-700 mb-1">ฟีดเดอร์</p>
                    <p className="text-xl font-bold text-green-900">{feederMatrix.feederCode}</p>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <p className="text-sm text-green-700 mb-1">สถานี</p>
                    <p className="text-xl font-bold text-green-900">{feederMatrix.stationName}</p>
                  </CardContent>
                </Card>
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4">
                    <p className="text-sm text-green-700 mb-1">จำนวนงานรวม</p>
                    <p className="text-xl font-bold text-green-900">{feederMatrix.totalCount} งาน</p>
                  </CardContent>
                </Card>
              </div>

              {feederMatrix.jobDetails && feederMatrix.jobDetails.length > 0 ? (
                <>
                  {/* Horizontal Bar Chart */}
                  <ResponsiveContainer width="100%" height={Math.max(300, feederMatrix.jobDetails.length * 50)}>
                    <BarChart data={feederMatrix.jobDetails} layout="vertical" margin={{ left: 20, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={200}
                        tick={{ fontSize: 12 }}
                        interval={0}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className="bg-white p-3 border border-green-200 rounded-lg shadow-lg">
                                <p className="font-semibold text-green-900">{data.name}</p>
                                <p className="text-sm text-green-700">ประเภท: {data.jobTypeName}</p>
                                <p className="text-sm font-bold text-green-600">จำนวน: {data.count} ครั้ง</p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                        {feederMatrix.jobDetails.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS.green[index % COLORS.green.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Detail Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
                    {feederMatrix.jobDetails.map((item, index) => (
                      <Card key={item.id} className="border border-yellow-100 hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <Badge variant="outline" className="text-xs bg-yellow-50 text-green-700 border-yellow-200">
                              #{index + 1}
                            </Badge>
                            
                          </div>
                          <p className="font-semibold text-sm text-green-900 mb-2 line-clamp-2">{item.name}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">จำนวนครั้ง</p>
                            <p className="text-2xl font-bold text-green-600">{item.count}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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
    </div>
  )
}
