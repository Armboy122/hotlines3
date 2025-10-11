'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Wrench,
  Save,
  X,
  Download,
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  BarChart3,
  Search,
  Users
} from 'lucide-react'
import { useTeams, useTaskDailies, useDeleteTaskDaily, useUpdateTaskDaily } from '@/hooks/useQueries'
import { generateAndDownloadReport, type TaskReportData } from '@/lib/pdf-generator'
import type { UpdateTaskDailyData, TaskDailyFiltered } from '@/lib/actions/task-daily'

type TaskDaily = TaskDailyFiltered

interface TeamGroup {
  team: {
    id: string
    name: string
  }
  tasks: TaskDaily[]
}

const MONTHS = [
  { value: '1', label: 'มกราคม' },
  { value: '2', label: 'กุมภาพันธ์' },
  { value: '3', label: 'มีนาคม' },
  { value: '4', label: 'เมษายน' },
  { value: '5', label: 'พฤษภาคม' },
  { value: '6', label: 'มิถุนายน' },
  { value: '7', label: 'กรกฎาคม' },
  { value: '8', label: 'สิงหาคม' },
  { value: '9', label: 'กันยายน' },
  { value: '10', label: 'ตุลาคม' },
  { value: '11', label: 'พฤศจิกายน' },
  { value: '12', label: 'ธันวาคม' },
]

export default function TaskListPage() {
  const currentYear = new Date().getFullYear()
  const currentMonth = (new Date().getMonth() + 1).toString()

  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString())
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth)
  const [selectedTeamId, setSelectedTeamId] = useState<string>('all')
  const [hasSearched, setHasSearched] = useState(false)

  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set())
  const [editForm, setEditForm] = useState<Partial<TaskDaily>>({})

  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [downloadModalOpen, setDownloadModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)

  const { data: teams = [] } = useTeams()

  // React Query hooks
  const {
    data: teamGroups = {},
    isLoading: loading,
    error: fetchError
  } = useTaskDailies(
    hasSearched ? { year: selectedYear, month: selectedMonth, teamId: selectedTeamId } : undefined
  )

  const deleteTaskMutation = useDeleteTaskDaily()
  const updateTaskMutation = useUpdateTaskDaily()

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  // Auto-expand first team when data changes
  useEffect(() => {
    if (teamGroups && Object.keys(teamGroups).length > 0) {
      const teamNames = Object.keys(teamGroups)
      setExpandedTeams(new Set([teamNames[0]]))
    }
  }, [teamGroups])

  const handleSearch = () => {
    setHasSearched(true)
  }

  const toggleTeamExpansion = (teamName: string) => {
    const newExpanded = new Set(expandedTeams)
    if (newExpanded.has(teamName)) {
      newExpanded.delete(teamName)
    } else {
      newExpanded.add(teamName)
    }
    setExpandedTeams(newExpanded)
  }

  const handleDeleteTask = (taskId: string) => {
    setTaskToDelete(taskId)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteTask = () => {
    if (taskToDelete) {
      deleteTaskMutation.mutate(taskToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false)
          setTaskToDelete(null)
        },
        onError: (error) => {
          console.error('Error deleting task:', error)
          alert('เกิดข้อผิดพลาดในการลบงาน กรุณาลองใหม่อีกครั้ง')
        }
      })
    }
  }

  const handleEditTask = (task: TaskDaily) => {
    setEditForm(task)
    setEditingTask(task.id)
  }

  const handleSaveEdit = () => {
    if (!editingTask || !editForm) return

    const updateData: UpdateTaskDailyData = {
      id: editingTask,
      workDate: editForm.workDate || '',
      teamId: editForm.team?.id || '',
      jobTypeId: editForm.jobType?.id || '',
      jobDetailId: editForm.jobDetail?.id || '',
      feederId: editForm.feeder?.id,
      numPole: editForm.numPole || undefined,
      deviceCode: editForm.deviceCode || undefined,
      detail: editForm.detail || undefined,
      urlsBefore: editForm.urlsBefore || [],
      urlsAfter: editForm.urlsAfter || [],
    }

    updateTaskMutation.mutate(updateData, {
      onSuccess: () => {
        setEditingTask(null)
        setEditForm({})
      },
      onError: (error) => {
        console.error('Error updating task:', error)
        alert('เกิดข้อผิดพลาดในการอัพเดตงาน กรุณาลองใหม่อีกครั้ง')
      }
    })
  }

  const handleCancelEdit = () => {
    setEditingTask(null)
    setEditForm({})
  }

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setImageModalOpen(true)
  }

  const closeImageModal = () => {
    setImageModalOpen(false)
    setSelectedImage(null)
  }

  const handleDownloadReport = () => {
    setDownloadModalOpen(true)
  }

  const handleConfirmDownload = () => {
    const teamGroupsArray = Object.values(teamGroups);

    // ดาวน์โหลด PDF
    const allTasks: TaskReportData[] = teamGroupsArray.flatMap(group =>
      group.tasks.map(task => ({
        id: BigInt(task.id),
        workDate: new Date(task.workDate),
        team: {
          name: task.team.name,
        },
        jobType: {
          name: task.jobType.name,
        },
        jobDetail: {
          name: task.jobDetail.name,
        },
        feeder: task.feeder ? {
          code: task.feeder.code,
          station: {
            name: task.feeder.station.name,
          },
        } : null,
        numPole: task.numPole,
        deviceCode: task.deviceCode,
        detail: task.detail,
      }))
    );

    const teamName = selectedTeamId !== 'all'
      ? teams.find(t => t.id.toString() === selectedTeamId)?.name
      : undefined;

    generateAndDownloadReport(allTasks, {
      month: parseInt(selectedMonth),
      year: parseInt(selectedYear),
      teamName,
    });

    setDownloadModalOpen(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const totalTasks = Object.values(teamGroups).reduce((total, group) => total + group.tasks.length, 0)
  const selectedMonthLabel = MONTHS.find(m => m.value === selectedMonth)?.label

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-32 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-3 text-2xl sm:text-3xl font-bold text-gray-900">
              <BarChart3 className="h-8 w-8 text-green-500" />
              รายงานงานประจำวัน
            </h1>
            <p className="text-sm text-gray-600 mt-1">เลือกเดือนและชุดงานที่ต้องการดูรายงาน</p>
          </div>
        </div>

        {/* Filter Section */}
        <Card className="shadow-sm border-gray-200 bg-white">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Year Selector */}
              <div className="space-y-2">
                <Label htmlFor="year" className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <Calendar className="h-4 w-4 text-green-500" />
                  ปี
                </Label>
                <Select value={selectedYear}  onValueChange={setSelectedYear}>
                  <SelectTrigger className="h-10 w-full border-gray-200 focus:border-green-500">
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

              {/* Month Selector */}
              <div className="space-y-2">
                <Label htmlFor="month" className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <Calendar className="h-4 w-4 text-green-500" />
                  เดือน
                </Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="h-10 w-full border-gray-200 focus:border-green-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map(month => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Team Selector */}
              <div className="space-y-2">
                <Label htmlFor="team" className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <Users className="h-4 w-4 text-green-500" />
                  ชุดงาน
                </Label>
                <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                  <SelectTrigger className="h-10 w-full border-gray-200 focus:border-green-500">
                    <SelectValue placeholder="ทั้งหมด" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    {teams.map(team => (
                      <SelectItem key={team.id.toString()} value={team.id.toString()}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-transparent">Actions</Label>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSearch}
                    disabled={loading}
                    className="flex-1 h-10 bg-green-500 hover:bg-green-600 text-white"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        กำลังค้นหา
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        ค้นหา
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Download Button - Full Width */}
            {hasSearched && totalTasks > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button
                  onClick={handleDownloadReport}
                  variant="outline"
                  className="w-full h-10 border-green-500 text-green-600 hover:bg-green-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  ดาวน์โหลดรายงาน ({totalTasks} งาน)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        {fetchError && (
          <Card className="shadow-sm bg-red-50 border-l-4 border-l-red-500">
            <CardContent className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <p className="text-lg text-red-700 mb-2">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
              <p className="text-sm text-red-600">กรุณาลองใหม่อีกครั้ง</p>
            </CardContent>
          </Card>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-green-500" />
              <p className="text-lg text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        )}

        {!loading && !hasSearched && !fetchError && (
          <Card className="shadow-sm border-gray-200 bg-white">
            <CardContent className="text-center py-16">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg text-gray-500 mb-2">กรุณาเลือกเดือนและกดค้นหา</p>
              <p className="text-sm text-gray-400">เพื่อดูรายงานงานประจำวัน</p>
            </CardContent>
          </Card>
        )}

        {!loading && !fetchError && hasSearched && Object.keys(teamGroups).length === 0 && (
          <Card className="shadow-sm border-gray-200 bg-white">
            <CardContent className="text-center py-16">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg text-gray-500 mb-2">ไม่พบข้อมูลงาน</p>
              <p className="text-sm text-gray-400">
                ไม่มีงานในเดือน {selectedMonthLabel} {selectedYear}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Task List by Team */}
        {!loading && !fetchError && hasSearched && Object.keys(teamGroups).length > 0 && (
          <div className="space-y-4">
            {Object.entries(teamGroups).map(([teamName, group]) => (
              <Card key={teamName} className="shadow-sm border-l-4 border-l-green-500 bg-white">
                <CardHeader
                  className="cursor-pointer hover:bg-gray-50 transition-colors p-4 sm:p-6"
                  onClick={() => toggleTeamExpansion(teamName)}
                >
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg sm:text-xl text-gray-900">{teamName}</span>
                      <Badge variant="secondary" className="bg-green-50 text-green-600">
                        {group.tasks.length} งาน
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm">
                      {expandedTeams.has(teamName) ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>

                {expandedTeams.has(teamName) && (
                  <CardContent className="space-y-3 p-4 sm:p-6 pt-0">
                    {group.tasks.map((task) => (
                      <Card key={task.id} className="border border-gray-200 hover:shadow-md transition-shadow bg-white">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex-1 space-y-3">
                              {/* Date and Job Type */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <Calendar className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium text-gray-900">
                                  {formatDate(task.workDate)}
                                </span>
                                <Badge variant="outline" className="text-xs border-green-200 text-green-600">
                                  {task.jobType.name}
                                </Badge>
                              </div>

                              {/* Job Detail */}
                              <h3 className="font-semibold text-base sm:text-lg text-gray-900">
                                {task.jobDetail.name}
                              </h3>

                              {/* Location */}
                              {task.feeder && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <MapPin className="h-4 w-4 text-green-500" />
                                  <span>{task.feeder.station.name} - {task.feeder.code}</span>
                                  <span className="text-gray-400">•</span>
                                  <span className="text-gray-500">{task.feeder.station.operationCenter.name}</span>
                                </div>
                              )}

                              {/* Pole Number */}
                              {task.numPole && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Wrench className="h-4 w-4 text-yellow-600" />
                                  <span>เสา: {task.numPole}</span>
                                </div>
                              )}

                              {/* Device Code */}
                              {task.deviceCode && (
                                <div className="text-sm text-gray-600">
                                  รหัสอุปกรณ์: <span className="font-mono">{task.deviceCode}</span>
                                </div>
                              )}

                              {/* Detail */}
                              {task.detail && (
                                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                                  {task.detail}
                                </div>
                              )}

                              {/* Timestamps */}
                              <div className="flex gap-2 text-xs text-gray-500">
                                <span>สร้าง: {formatDateTime(task.createdAt)}</span>
                                {task.updatedAt !== task.createdAt && (
                                  <span>• แก้ไข: {formatDateTime(task.updatedAt)}</span>
                                )}
                              </div>

                              {/* Images */}
                              {(task.urlsBefore.length > 0 || task.urlsAfter.length > 0) && (
                                <div className="flex gap-3 pt-2">
                                  {task.urlsBefore[0] && (
                                    <div className="flex flex-col items-center">
                                      <div
                                        className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden cursor-pointer border-2 border-gray-200 hover:border-green-500 transition-colors"
                                        onClick={() => handleImageClick(task.urlsBefore[0])}
                                      >
                                        <Image
                                          src={task.urlsBefore[0]}
                                          alt="ภาพก่อน"
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                      <Badge variant="outline" className="mt-2 text-xs border-gray-200 text-gray-600">
                                        ภาพก่อน
                                      </Badge>
                                    </div>
                                  )}
                                  {task.urlsAfter[0] && (
                                    <div className="flex flex-col items-center">
                                      <div
                                        className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden cursor-pointer border-2 border-gray-200 hover:border-green-500 transition-colors"
                                        onClick={() => handleImageClick(task.urlsAfter[0])}
                                      >
                                        <Image
                                          src={task.urlsAfter[0]}
                                          alt="ภาพหลัง"
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                      <Badge variant="outline" className="mt-2 text-xs border-gray-200 text-gray-600">
                                        ภาพหลัง
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex sm:flex-col gap-2 sm:ml-4 flex-shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditTask(task)}
                                className="flex-1 sm:flex-none h-9 border-gray-200 text-green-600 hover:bg-green-50 hover:border-green-500"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteTask(task.id)}
                                className="flex-1 sm:flex-none h-9 border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingTask} onOpenChange={handleCancelEdit}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-gray-900">แก้ไขงาน</DialogTitle>
            </DialogHeader>

            {editForm && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">วันที่ทำงาน</label>
                    <Input
                      type="date"
                      value={editForm.workDate ? new Date(editForm.workDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setEditForm({ ...editForm, workDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">ทีม</label>
                    <Input
                      value={editForm.team?.name || ''}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">ประเภทงาน</label>
                    <Input
                      value={editForm.jobType?.name || ''}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">รายละเอียดงาน</label>
                    <Input
                      value={editForm.jobDetail?.name || ''}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                {editForm.feeder && (
                  <div>
                    <label className="text-sm font-medium">สถานี - ฟีดเดอร์</label>
                    <Input
                      value={`${editForm.feeder.station.name} - ${editForm.feeder.code}`}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">หมายเลขเสา</label>
                    <Input
                      value={editForm.numPole || ''}
                      onChange={(e) => setEditForm({ ...editForm, numPole: e.target.value })}
                      placeholder="หมายเลขเสา"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">รหัสอุปกรณ์</label>
                    <Input
                      value={editForm.deviceCode || ''}
                      onChange={(e) => setEditForm({ ...editForm, deviceCode: e.target.value })}
                      placeholder="รหัสอุปกรณ์"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">รายละเอียดเพิ่มเติม</label>
                  <Textarea
                    value={editForm.detail || ''}
                    onChange={(e) => setEditForm({ ...editForm, detail: e.target.value })}
                    placeholder="รายละเอียดเพิ่มเติม"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">ภาพก่อนทำงาน</label>
                    <div className="text-sm text-gray-500">
                      {editForm.urlsBefore?.length || 0} ภาพ
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">ภาพหลังทำงาน</label>
                    <div className="text-sm text-gray-500">
                      {editForm.urlsAfter?.length || 0} ภาพ
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={handleCancelEdit} disabled={updateTaskMutation.isPending}>
                <X className="h-4 w-4 mr-2" />
                ยกเลิก
              </Button>
              <Button onClick={handleSaveEdit} disabled={updateTaskMutation.isPending} className="bg-green-500 hover:bg-green-600">
                {updateTaskMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    บันทึก
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Image Modal */}
        <Dialog open={imageModalOpen} onOpenChange={closeImageModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <div className="relative">
              {selectedImage && (
                <Image
                  src={selectedImage}
                  alt="ภาพงาน"
                  width={800}
                  height={600}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
              )}
              <Button
                variant="outline"
                size="sm"
                className="absolute top-4 right-4 bg-white/80 hover:bg-white"
                onClick={closeImageModal}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-900">
                <AlertCircle className="h-5 w-5" />
                ยืนยันการลบงาน
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-600">
                คุณแน่ใจหรือไม่ที่จะลบงานนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleteTaskMutation.isPending}>
                ยกเลิก
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteTask}
                disabled={deleteTaskMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteTaskMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    กำลังลบ...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    ลบงาน
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Download Report Dialog */}
        <Dialog open={downloadModalOpen} onOpenChange={setDownloadModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-gray-900">
                <Download className="h-5 w-5" />
                ดาวน์โหลดรายงาน PDF
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-3 bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-900">รายงานสรุปพร้อมรูปภาพ</span>
                </div>
                <p className="text-sm text-gray-600">
                  ไฟล์ PDF จะรวมข้อมูลทั้งหมดตามที่เลือก
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">ช่วงข้อมูล:</span>
                  <span className="font-medium text-gray-900">{selectedMonthLabel} {selectedYear}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">ชุดงาน:</span>
                  <span className="font-medium text-gray-900">
                    {selectedTeamId === 'all' ? 'ทั้งหมด' : teams.find(t => t.id.toString() === selectedTeamId)?.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">จำนวนงาน:</span>
                  <span className="font-medium text-green-600">{totalTasks} งาน</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDownloadModalOpen(false)}>
                ยกเลิก
              </Button>
              <Button onClick={handleConfirmDownload} className="bg-green-500 hover:bg-green-600 text-white">
                <Download className="h-4 w-4 mr-2" />
                ดาวน์โหลด PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
