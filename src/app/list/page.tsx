'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
// ใช้ API แทน Server Actions
import { Edit, Trash2, Calendar, MapPin, Wrench, Save, X, Search, Filter, ImageIcon, Eye } from 'lucide-react'

interface TaskDaily {
  id: string
  workDate: string
  team: {
    id: string
    name: string
  }
  jobType: {
    id: string
    name: string
  }
  jobDetail: {
    id: string
    name: string
  }
  feeder?: {
    id: string
    code: string
    station: {
      name: string
      operationCenter: {
        name: string
      }
    }
  }
  numPole?: string
  deviceCode?: string
  detail?: string
  urlsBefore: string[]
  urlsAfter: string[]
  createdAt: string
  updatedAt: string
}

interface TeamGroup {
  team: {
    id: string
    name: string
  }
  tasks: TaskDaily[]
}

export default function TaskListPage() {
  const [teamGroups, setTeamGroups] = useState<Record<string, TeamGroup>>({})
  const [loading, setLoading] = useState(true)
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set())
  const [editForm, setEditForm] = useState<Partial<TaskDaily>>({})
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTeam, setSelectedTeam] = useState<string>('')
  const [dateFilter, setDateFilter] = useState('')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageModalOpen, setImageModalOpen] = useState(false)

  useEffect(() => {
    fetchTaskDailies()
  }, [])

  const fetchTaskDailies = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tasks')
      const result = await response.json()
      
      if (result.success && result.data) {
        setTeamGroups(result.data as Record<string, TeamGroup>)
        // ขยายทีมแรกโดยอัตโนมัติ
        const teamNames = Object.keys(result.data)
        if (teamNames.length > 0) {
          setExpandedTeams(new Set([teamNames[0]]))
        }
      }
    } catch (error) {
      console.error('Error fetching task dailies:', error)
    } finally {
      setLoading(false)
    }
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

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบงานนี้?')) {
      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: 'DELETE',
        })
        const result = await response.json()
        
        if (result.success) {
          await fetchTaskDailies()
        }
      } catch (error) {
        console.error('Error deleting task:', error)
      }
    }
  }

  const handleEditTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        setEditForm(result.data)
        setEditingTask(taskId)
      }
    } catch (error) {
      console.error('Error fetching task for edit:', error)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingTask || !editForm) return

    try {
      setSaving(true)
      const response = await fetch(`/api/tasks/${editingTask}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workDate: editForm.workDate || '',
          teamId: editForm.team?.id || '',
          jobTypeId: editForm.jobType?.id || '',
          jobDetailId: editForm.jobDetail?.id || '',
          feederId: editForm.feeder?.id || '',
          numPole: editForm.numPole || '',
          deviceCode: editForm.deviceCode || '',
          detail: editForm.detail || '',
          urlsBefore: editForm.urlsBefore || [],
          urlsAfter: editForm.urlsAfter || [],
        }),
      })
      
      const result = await response.json()

      if (result.success) {
        setEditingTask(null)
        setEditForm({})
        await fetchTaskDailies()
      }
    } catch (error) {
      console.error('Error updating task:', error)
    } finally {
      setSaving(false)
    }
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

  const filteredTeamGroups = () => {
    let filtered = { ...teamGroups }

    // กรองตามทีม
    if (selectedTeam) {
      filtered = { [selectedTeam]: filtered[selectedTeam] }
    }

    // กรองตามคำค้นหา
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      Object.keys(filtered).forEach(teamName => {
        filtered[teamName] = {
          ...filtered[teamName],
          tasks: filtered[teamName].tasks.filter(task =>
            task.jobDetail.name.toLowerCase().includes(searchLower) ||
            task.jobType.name.toLowerCase().includes(searchLower) ||
            (task.feeder?.station.name.toLowerCase().includes(searchLower)) ||
            (task.feeder?.code.toLowerCase().includes(searchLower)) ||
            (task.numPole?.toLowerCase().includes(searchLower)) ||
            (task.deviceCode?.toLowerCase().includes(searchLower)) ||
            (task.detail?.toLowerCase().includes(searchLower))
          )
        }
      })
    }

    // กรองตามวันที่
    if (dateFilter) {
      const filterDate = new Date(dateFilter)
      Object.keys(filtered).forEach(teamName => {
        filtered[teamName] = {
          ...filtered[teamName],
          tasks: filtered[teamName].tasks.filter(task => {
            const taskDate = new Date(task.workDate)
            return taskDate.toDateString() === filterDate.toDateString()
          })
        }
      })
    }

    return filtered
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

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">กำลังโหลดข้อมูล...</div>
        </div>
      </div>
    )
  }

  const filteredData = filteredTeamGroups()

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">รายงานงานประจำวัน</h1>
        <Badge variant="outline" className="text-sm w-fit">
          {Object.values(filteredData).reduce((total, group) => total + group.tasks.length, 0)} งานทั้งหมด
        </Badge>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ค้นหางาน..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full h-9 px-3 py-1 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">ทุกทีม</option>
                {Object.keys(teamGroups).map(teamName => (
                  <option key={teamName} value={teamName}>
                    {teamName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                placeholder="กรองตามวันที่"
              />
            </div>
          </div>

          {(searchTerm || selectedTeam || dateFilter) && (
            <div className="mt-3 flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">กรองแล้ว</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedTeam('')
                  setDateFilter('')
                }}
                className="text-xs"
              >
                ล้างตัวกรอง
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {Object.entries(filteredData).map(([teamName, group]) => (
          <Card key={teamName} className="border-l-4 border-l-blue-500">
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleTeamExpansion(teamName)}
            >
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{teamName}</span>
                  <Badge variant="secondary">
                    {group.tasks.length} งาน
                  </Badge>
                </div>
                <Button variant="ghost" size="sm">
                  {expandedTeams.has(teamName) ? 'ซ่อน' : 'แสดง'}
                </Button>
              </CardTitle>
            </CardHeader>

            {expandedTeams.has(teamName) && (
              <CardContent className="space-y-3">
                {group.tasks.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    ยังไม่มีงานที่บันทึก
                  </div>
                ) : (
                  group.tasks.map((task) => (
                    <Card key={task.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium">
                                {formatDate(task.workDate)}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {task.jobType.name}
                              </Badge>
                            </div>

                            <div className="space-y-1">
                              <h3 className="font-semibold text-lg">{task.jobDetail.name}</h3>
                              
                              {task.feeder && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <MapPin className="h-4 w-4" />
                                  <span>{task.feeder.station.name} - {task.feeder.code}</span>
                                  <span className="text-gray-400">•</span>
                                  <span>{task.feeder.station.operationCenter.name}</span>
                                </div>
                              )}

                              {task.numPole && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Wrench className="h-4 w-4" />
                                  <span>เสา: {task.numPole}</span>
                                </div>
                              )}

                              {task.deviceCode && (
                                <div className="text-sm text-gray-600">
                                  รหัสอุปกรณ์: {task.deviceCode}
                                </div>
                              )}

                              {task.detail && (
                                <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                  {task.detail}
                                </div>
                              )}

                              <div className="flex gap-2 text-xs text-gray-500">
                                <span>สร้าง: {formatDateTime(task.createdAt)}</span>
                                {task.updatedAt !== task.createdAt && (
                                  <span>• แก้ไข: {formatDateTime(task.updatedAt)}</span>
                                )}
                              </div>

                              {(task.urlsBefore.length > 0 || task.urlsAfter.length > 0) && (
                                <div className="flex gap-2">
                                  {task.urlsBefore[0] && (
                                    <div className="flex flex-col items-center">
                                      <Image 
                                        src={task.urlsBefore[0]} 
                                        alt="ภาพก่อน"
                                        width={96}
                                        height={96}
                                        className="object-cover rounded"
                                        onClick={() => handleImageClick(task.urlsBefore[0])}
                                      />
                                      <Badge variant="outline" className="mt-1 text-xs">ภาพก่อน</Badge>
                                    </div>
                                  )}
                                  {task.urlsAfter[0] && (
                                    <div className="flex flex-col items-center">
                                      <Image
                                        src={task.urlsAfter[0]}
                                        alt="ภาพหลัง" 
                                        width={96}
                                        height={96}
                                        className="object-cover rounded"
                                        onClick={() => handleImageClick(task.urlsAfter[0])}
                                      />
                                      <Badge variant="outline" className="mt-1 text-xs">ภาพหลัง</Badge>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 sm:ml-4 flex-shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditTask(task.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            )}
          </Card>
        ))}

        {Object.keys(filteredData).length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-500 text-lg">
                {Object.keys(teamGroups).length === 0 
                  ? 'ยังไม่มีงานที่บันทึกในระบบ'
                  : 'ไม่พบงานที่ตรงกับเงื่อนไขการค้นหา'
                }
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingTask} onOpenChange={handleCancelEdit}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>แก้ไขงาน</DialogTitle>
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
            <Button variant="outline" onClick={handleCancelEdit} disabled={saving}>
              <X className="h-4 w-4 mr-2" />
              ยกเลิก
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
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
    </div>
  )
}