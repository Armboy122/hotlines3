'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Ban, Download, Filter, Loader2 } from 'lucide-react'
import { VoltageLevel } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { getPlanLines, deletePlanLine, cancelPlanLine, getPlanLinesOverview } from '@/lib/actions/plan-line'
import PlanLineForm from '@/components/forms/plan-line-form'

interface PlanLine {
  id: bigint
  year: number
  feederId: bigint
  level: VoltageLevel
  planDistanceKm: Decimal
  isCancelled: boolean
  createdAt: Date
}

interface Overview {
  total: number
  active: number
  cancelled: number
  totalDistance: number
  cancelRate: number
}

export default function PlanLinesPage() {
  const [planLines, setPlanLines] = useState<PlanLine[]>([])
  const [overview, setOverview] = useState<Overview | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<PlanLine | null>(null)

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)

  const voltageLevelLabels = {
    MID: '33 kV',
    HIGH: '115 kV'
  }

  // Load data
  const loadData = async (year?: number) => {
    setLoading(true)
    try {
      const [planResult, overviewResult] = await Promise.all([
        getPlanLines(year),
        getPlanLinesOverview(year)
      ])

      if (planResult.success && planResult.data) {
        setPlanLines(planResult.data as any)
      }

      if (overviewResult.success && overviewResult.data) {
        setOverview(overviewResult.data)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData(selectedYear)
  }, [selectedYear])

  // Filter data
  const filteredData = planLines.filter(item => {
    const matchesSearch = item.feederId.toString().includes(searchTerm)
    const matchesLevel = selectedLevel === 'all' || item.level === selectedLevel
    return matchesSearch && matchesLevel
  })

  const handleDelete = async (id: bigint) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบแผนงานนี้?')) return

    const result = await deletePlanLine(id.toString())
    if (result.success) {
      loadData(selectedYear)
    } else {
      alert(result.error || 'เกิดข้อผิดพลาด')
    }
  }

  const handleCancel = async (id: bigint) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะยกเลิกแผนงานนี้?')) return

    const result = await cancelPlanLine(id.toString())
    if (result.success) {
      loadData(selectedYear)
    } else {
      alert(result.error || 'เกิดข้อผิดพลาด')
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingItem(null)
    loadData(selectedYear)
  }

  const exportData = () => {
    const csvContent = [
      ['ปี', 'ฟีดเดอร์', 'ระดับแรงดัน', 'ระยะทางแผน(กม.)', 'สถานะ'].join(','),
      ...filteredData.map(item => [
        item.year,
        item.feederId,
        voltageLevelLabels[item.level],
        Number(item.planDistanceKm),
        item.isCancelled ? 'ยกเลิก' : 'ปกติ'
      ].join(','))
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `แผนฉีดน้ำไลน์_${selectedYear}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">แผนฉีดน้ำในไลน์</h1>
          <p className="text-muted-foreground">จัดการแผนงานฉีดน้ำในไลน์ 33kV และ 115kV</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          เพิ่มแผนงาน
        </Button>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{overview.total}</div>
              <p className="text-sm text-muted-foreground">ทั้งหมด</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{overview.active}</div>
              <p className="text-sm text-muted-foreground">ใช้งาน</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{overview.cancelled}</div>
              <p className="text-sm text-muted-foreground">ยกเลิก</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{overview.totalDistance}</div>
              <p className="text-sm text-muted-foreground">กม. รวม</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{overview.cancelRate}%</div>
              <p className="text-sm text-muted-foreground">อัตรายกเลิก</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">ปี</Label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger>
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
              <Label htmlFor="level">ระดับแรงดัน</Label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  {Object.entries(voltageLevelLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="search">ค้นหา</Label>
              <Input
                id="search"
                placeholder="ค้นหาฟีดเดอร์..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2 flex items-end">
              <Button variant="outline" onClick={exportData} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            รายการแผนงาน ({filteredData.length} รายการ)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">กำลังโหลดข้อมูล...</span>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-muted-foreground">ไม่พบข้อมูลแผนงาน</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">ฟีดเดอร์</th>
                    <th className="text-left p-2">ระดับแรงดัน</th>
                    <th className="text-left p-2">ระยะทางแผน</th>
                    <th className="text-left p-2">สถานะ</th>
                    <th className="text-left p-2">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-mono">{item.feederId}</td>
                      <td className="p-2">
                        <Badge variant={item.level === 'HIGH' ? 'default' : 'secondary'}>
                          {voltageLevelLabels[item.level]}
                        </Badge>
                      </td>
                      <td className="p-2">{Number(item.planDistanceKm)} กม.</td>
                      <td className="p-2">
                        <Badge variant={item.isCancelled ? "destructive" : "default"}>
                          {item.isCancelled ? 'ยกเลิก' : 'ปกติ'}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          {!item.isCancelled && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancel(item.id)}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingItem(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>เพิ่มแผนฉีดน้ำในไลน์</DialogTitle>
          </DialogHeader>
          <PlanLineForm
            onSuccess={handleFormSuccess}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Form Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>แก้ไขแผนฉีดน้ำในไลน์</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <PlanLineForm
              initialData={{
                id: editingItem.id.toString(),
                year: editingItem.year,
                feederId: editingItem.feederId.toString(),
                level: editingItem.level,
                planDistanceKm: Number(editingItem.planDistanceKm),
                isCancelled: editingItem.isCancelled
              }}
              onSuccess={handleFormSuccess}
              onCancel={() => setEditingItem(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
