'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { JobTypeForm } from '@/components/forms/job-type-form'
import { getJobTypes, deleteJobType } from '@/lib/actions/job-type'
import { Edit, Trash2, Plus } from 'lucide-react'

export default function JobTypesPage() {
  const [jobTypes, setJobTypes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    const result = await getJobTypes()
    if (result.success && result.data) {
      setJobTypes(result.data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleEdit = (item: any) => {
    setEditingItem({
      id: item.id.toString(),
      name: item.name,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบประเภทงานนี้?')) {
      const result = await deleteJobType(id)
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
        <h1 className="text-3xl font-bold">ประเภทงาน</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มประเภทงานใหม่
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>เพิ่มประเภทงานใหม่</DialogTitle>
            </DialogHeader>
            <JobTypeForm onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobTypes.map((jobType) => (
          <Card key={jobType.id.toString()}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{jobType.name}</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(jobType)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(jobType.id.toString())}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                <p>รายละเอียดงาน: {jobType._count.details} รายการ</p>
                <p>งานที่เกี่ยวข้อง: {jobType._count.tasks} งาน</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {jobTypes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          ไม่มีข้อมูลประเภทงาน
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขประเภทงาน</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <JobTypeForm
              initialData={editingItem}
              onSuccess={handleSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
