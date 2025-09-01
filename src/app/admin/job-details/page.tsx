'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

import { JobDetailForm } from '@/components/forms/job-detail-form'
import { deleteJobDetail } from '@/lib/actions/job-detail'
import { useJobDetails } from '@/hooks/useQueries'
import { Edit, Trash2, Plus, Loader2 } from 'lucide-react'
import type { JobDetail } from '@/types/api'

export default function JobDetailsPage() {
  const [editingItem, setEditingItem] = useState<{ id: string; name: string } | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // ใช้ useQuery แทน useEffect + useState
  const { data: jobDetails = [], isLoading, error, refetch } = useJobDetails()

  const handleEdit = (item: JobDetail) => {
    setEditingItem({
      id: item.id.toString(),
      name: item.name,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบรายละเอียดงานนี้?')) {
      const result = await deleteJobDetail(id)
      if (result.success) {
        // Refetch ข้อมูลใหม่หลังจากลบสำเร็จ
        refetch()
      } else {
        alert('เกิดข้อผิดพลาด: ' + result.error)
      }
    }
  }

  const handleSuccess = () => {
    setIsCreateDialogOpen(false)
    setIsEditDialogOpen(false)
    setEditingItem(null)
    // Refetch ข้อมูลใหม่หลังจากสร้าง/แก้ไขสำเร็จ
    refetch()
  }

  // No grouping needed anymore
  const sortedJobDetails = jobDetails.sort((a, b) => a.name.localeCompare(b.name))

  // แสดง error ถ้ามี
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p className="text-red-500">เกิดข้อผิดพลาด: {error.message}</p>
          <Button onClick={() => refetch()} className="mt-4">
            ลองใหม่
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>กำลังโหลด...</span>
        </div>
      </div>
    )
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

      {/* Job Details Grid */}
      <div className="space-y-4">
        {sortedJobDetails.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            ไม่มีข้อมูลรายละเอียดงาน
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedJobDetails.map((jobDetail: JobDetail) => (
              <Card key={jobDetail.id.toString()} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="font-medium">{jobDetail.name}</div>
                    </div>
                    <div className="flex gap-2 ml-2">
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
                  <div className="text-sm text-gray-600">
                    <p>งานที่เกี่ยวข้อง: {jobDetail._count.tasks} งาน</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขรายละเอียดงาน</DialogTitle>
          </DialogHeader>
          {editingItem && editingItem.id && (
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
