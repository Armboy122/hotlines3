'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { JobDetailForm } from '@/components/forms/job-detail-form'
import { getJobDetails, deleteJobDetail } from '@/lib/actions/job-detail'
import { Edit, Trash2, Plus } from 'lucide-react'

export default function JobDetailsPage() {
  const [jobDetails, setJobDetails] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    const result = await getJobDetails()
    if (result.success && result.data) {
      setJobDetails(result.data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleEdit = (item: any) => {
    setEditingItem({
      id: item.id.toString(),
      jobTypeId: item.jobTypeId.toString(),
      name: item.name,
      active: item.active,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบรายละเอียดงานนี้?')) {
      const result = await deleteJobDetail(id)
      if (result.success) {
        await loadData()
      } else {
        alert('เกิดข้อผิดพลาด: ' + result.error)
      }
    }
  }

  const handleSuccess = () => {
    setIsCreateDialogOpen(false)
    setIsEditDialogOpen(false)
    setEditingItem(null)
    loadData()
  }

  if (isLoading) {
    return <div className="container mx-auto py-8">กำลังโหลด...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">รายละเอียดงาน</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มรายละเอียดงานใหม่
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>เพิ่มรายละเอียดงานใหม่</DialogTitle>
            </DialogHeader>
            <JobDetailForm onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobDetails.map((jobDetail) => (
          <Card key={jobDetail.id.toString()}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <div>
                  <div>{jobDetail.name}</div>
                  <div className="text-sm font-normal text-gray-500 mt-1">
                    {jobDetail.jobType.name}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(jobDetail)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(jobDetail.id.toString())}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <p>งานที่เกี่ยวข้อง: {jobDetail._count.tasks} งาน</p>
                </div>
                <Badge variant={jobDetail.active ? 'default' : 'secondary'}>
                  {jobDetail.active ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {jobDetails.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          ไม่มีข้อมูลรายละเอียดงาน
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขรายละเอียดงาน</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <JobDetailForm
              initialData={editingItem}
              onSuccess={handleSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
