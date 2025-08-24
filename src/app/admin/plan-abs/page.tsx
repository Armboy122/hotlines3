'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, CheckCircle, Ban, Download, Filter, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { getPlanAbsItems, deletePlanAbs, markPlanAbsDone, cancelPlanAbs, getPlanAbsOverview } from '@/lib/actions/plan-abs'
import PlanAbsForm from '@/components/forms/plan-abs-form'

interface PlanAbs {
  id: bigint
  year: number
  deviceLabel: string
  isDone: boolean
  doneOn: Date | null
  isCancelled: boolean
  createdAt: Date
  _count: {
    tasks: number
  }
}

interface Overview {
  total: number
  completed: number
  pending: number
  cancelled: number
  completionRate: number
}

export default function PlanAbsPage() {
  const [planAbsItems, setPlanAbsItems] = useState<PlanAbs[]>([])
  const [overview, setOverview] = useState<Overview | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<PlanAbs | null>(null)

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)

  // Load data
  const loadData = async (year?: number) => {
    setLoading(true)
    try {
      const [planResult, overviewResult] = await Promise.all([
        getPlanAbsItems(year),
        getPlanAbsOverview(year)
      ])

      if (planResult.success && planResult.data) {
        setPlanAbsItems(planResult.data)
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
  const filteredData = planAbsItems.filter(item => {
    const matchesSearch = item.deviceLabel.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'done' && item.isDone && !item.isCancelled) ||
      (selectedStatus === 'pending' && !item.isDone && !item.isCancelled) ||
      (selectedStatus === 'cancelled' && item.isCancelled)
    return matchesSearch && matchesStatus
  })

  const handleDelete = async (id: bigint) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบแผนงานนี้?')) return

    const result = await deletePlanAbs(id.toString())
    if (result.success) {
      loadData(selectedYear)
    } else {
      alert(result.error || 'เกิดข้อผิดพลาด')
    }
  }

  const handleMarkDone = async (id: bigint) => {
    const result = await markPlanAbsDone(id.toString())
    if (result.success) {
      loadData(selectedYear)
    } else {
      alert(result.error || 'เกิดข้อผิดพลาด')
    }
  }

  const handleCancel = async (id: bigint) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะยกเลิกแผนงานนี้?')) return

    const result = await cancelPlanAbs(id.toString())
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
      ['ปี', 'รหัสอุปกรณ์', 'สถานะ', 'วันที่เสร็จ', 'จำนวนงาน'].join(','),
      ...filteredData.map(item => [
        item.year,
        item.deviceLabel,
        item.isCancelled ? 'ยกเลิก' : item.isDone ? 'เสร็จแล้ว' : 'ยังไม่เสร็จ',
        item.doneOn ? format(new Date(item.doneOn), 'dd/MM/yyyy', { locale: th }) : '',
        item._count.tasks
      ].join(','))
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `แผนABS_${selectedYear}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusBadge = (item: PlanAbs) => {
    if (item.isCancelled) return <Badge variant="destructive">ยกเลิก</Badge>
    if (item.isDone) return <Badge variant="default">เสร็จแล้ว</Badge>
    return <Badge variant="secondary">ยังไม่เสร็จ</Badge>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">แผน ABS</h1>
          <p className="text-muted-foreground">จัดการแผนงาน ABS (Automatic Bus Sectionalizer)</p>
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
              <div className="text-2xl font-bold text-green-600">{overview.completed}</div>
              <p className="text-sm text-muted-foreground">เสร็จแล้ว</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{overview.pending}</div>
              <p className="text-sm text-muted-foreground">ยังไม่เสร็จ</p>
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
              <div className="text-2xl font-bold text-purple-600">{overview.completionRate}%</div>
              <p className="text-sm text-muted-foreground">ความสำเร็จ</p>
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
              <Label htmlFor="status">สถานะ</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="done">เสร็จแล้ว</SelectItem>
                  <SelectItem value="pending">ยังไม่เสร็จ</SelectItem>
                  <SelectItem value="cancelled">ยกเลิก</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="search">ค้นหา</Label>
              <Input
                id="search"
                placeholder="ค้นหารหัสอุปกรณ์..."
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
                    <th className="text-left p-2">รหัสอุปกรณ์</th>
                    <th className="text-left p-2">สถานะ</th>
                    <th className="text-left p-2">วันที่เสร็จ</th>
                    <th className="text-left p-2">งาน</th>
                    <th className="text-left p-2">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-mono">{item.deviceLabel}</td>
                      <td className="p-2">{getStatusBadge(item)}</td>
                      <td className="p-2">
                        {item.doneOn ? format(new Date(item.doneOn), 'dd/MM/yyyy', { locale: th }) : '-'}
                      </td>
                      <td className="p-2">
                        <Badge variant="outline">{item._count.tasks}</Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          {!item.isDone && !item.isCancelled && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkDone(item.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
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
            <DialogTitle>เพิ่มแผน ABS</DialogTitle>
          </DialogHeader>
          <PlanAbsForm
            onSuccess={handleFormSuccess}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Form Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>แก้ไขแผน ABS</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <PlanAbsForm
              initialData={{
                id: editingItem.id.toString(),
                year: editingItem.year,
                deviceLabel: editingItem.deviceLabel,
                isDone: editingItem.isDone,
                doneOn: editingItem.doneOn,
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
