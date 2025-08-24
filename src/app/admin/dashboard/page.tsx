'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  Activity, 
  CheckCircle, 
  Clock, 
  Ban, 
  Zap, 
  MapPin, 
  Settings, 
  Wrench, 
  Car,
  Loader2,
  TrendingUp
} from 'lucide-react'
import { getDashboardOverview, type DashboardOverview } from '@/lib/actions/dashboard'



export default function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)

  const loadData = async (year?: number) => {
    setLoading(true)
    try {
      const result = await getDashboardOverview(year)
      if (result.success) {
        setOverview(result.data!)
      } else {
        console.error('Failed to load dashboard data:', result.error)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData(selectedYear)
  }, [selectedYear])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">กำลังโหลดข้อมูล Dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!overview) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">ไม่สามารถโหลดข้อมูล Dashboard ได้</p>
        </div>
      </div>
    )
  }

  // Prepare chart data
  const planTypesData = [
    {
      name: 'ฉีดน้ำสถานี',
      total: overview.planStations.total,
      completed: overview.planStations.completed,
      pending: overview.planStations.pending,
      rate: overview.planStations.completionRate
    },
    {
      name: 'ฉีดน้ำไลน์',
      total: overview.planLines.total,
      completed: overview.planLines.active,
      pending: overview.planLines.cancelled,
      rate: overview.planLines.cancelRate
    },
    {
      name: 'ABS',
      total: overview.planAbs.total,
      completed: overview.planAbs.completed,
      pending: overview.planAbs.pending,
      rate: overview.planAbs.completionRate
    },
    {
      name: 'ไม้ฉนวน',
      total: overview.planConductors.total,
      completed: overview.planConductors.completed,
      pending: overview.planConductors.pending,
      rate: overview.planConductors.completionRate
    },
    {
      name: 'รถกระเช้า',
      total: overview.planCableCars.total,
      completed: overview.planCableCars.completed,
      pending: overview.planCableCars.pending,
      rate: overview.planCableCars.completionRate
    }
  ]

  const summaryPieData = [
    { name: 'เสร็จแล้ว', value: overview.summary.totalCompleted, color: '#10b981' },
    { name: 'ยังไม่เสร็จ', value: overview.summary.totalPending, color: '#f59e0b' },
    { name: 'ยกเลิก', value: overview.summary.totalCancelled, color: '#ef4444' }
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard ภาพรวมแผนงาน</h1>
          <p className="text-muted-foreground">สรุปสถานะแผนงานทั้งหมดในระบบ</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="year">ปี</Label>
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-32">
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{overview.summary.totalPlans}</div>
                <p className="text-sm text-muted-foreground">แผนทั้งหมด</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">{overview.summary.totalCompleted}</div>
                <p className="text-sm text-muted-foreground">เสร็จแล้ว</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">{overview.summary.totalPending}</div>
                <p className="text-sm text-muted-foreground">ยังไม่เสร็จ</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Ban className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">{overview.summary.totalCancelled}</div>
                <p className="text-sm text-muted-foreground">ยกเลิก</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-600">{overview.summary.overallCompletionRate}%</div>
                <p className="text-sm text-muted-foreground">ความสำเร็จ</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Type Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Plan Stations */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              ฉีดน้ำสถานี
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">ทั้งหมด</span>
              <Badge variant="outline">{overview.planStations.total}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">เสร็จแล้ว</span>
              <Badge variant="default">{overview.planStations.completed}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">ยังไม่เสร็จ</span>
              <Badge variant="secondary">{overview.planStations.pending}</Badge>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">ความสำเร็จ</span>
                <span className="text-lg font-bold text-green-600">
                  {overview.planStations.completionRate}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan Lines */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-600" />
              ฉีดน้ำไลน์
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">ทั้งหมด</span>
              <Badge variant="outline">{overview.planLines.total}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">ใช้งาน</span>
              <Badge variant="default">{overview.planLines.active}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">ยกเลิก</span>
              <Badge variant="destructive">{overview.planLines.cancelled}</Badge>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">รวม</span>
                <span className="text-lg font-bold text-blue-600">
                  {overview.planLines.totalDistance} กม.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan ABS */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              ABS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">ทั้งหมด</span>
              <Badge variant="outline">{overview.planAbs.total}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">เสร็จแล้ว</span>
              <Badge variant="default">{overview.planAbs.completed}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">ยกเลิก</span>
              <Badge variant="destructive">{overview.planAbs.cancelled}</Badge>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">ความสำเร็จ</span>
                <span className="text-lg font-bold text-green-600">
                  {overview.planAbs.completionRate}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan Conductors */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wrench className="h-5 w-5 text-green-600" />
              ไม้ฉนวน
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">ทั้งหมด</span>
              <Badge variant="outline">{overview.planConductors.total}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">เสร็จแล้ว</span>
              <Badge variant="default">{overview.planConductors.completed}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">ยกเลิก</span>
              <Badge variant="destructive">{overview.planConductors.cancelled}</Badge>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">ความสำเร็จ</span>
                <span className="text-lg font-bold text-green-600">
                  {overview.planConductors.completionRate}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan Cable Cars */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Car className="h-5 w-5 text-red-600" />
              รถกระเช้า
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">ทั้งหมด</span>
              <Badge variant="outline">{overview.planCableCars.total}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">ผ่าน</span>
              <Badge className="bg-green-600">{overview.planCableCars.passed}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">ไม่ผ่าน</span>
              <Badge variant="destructive">{overview.planCableCars.failed}</Badge>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">อัตราผ่าน</span>
                <span className="text-lg font-bold text-green-600">
                  {overview.planCableCars.passRate}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>สถานะแผนงานแต่ละประเภท</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={planTypesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#10b981" name="เสร็จแล้ว" />
                <Bar dataKey="pending" fill="#f59e0b" name="ยังไม่เสร็จ" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>สัดส่วนสถานะรวม</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={summaryPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {summaryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
