'use client'

// TODO: [REFACTOR] เปลี่ยนจาก import deleteJobDetail เป็นใช้ useDeleteJobDetail() hook
// TODO: [REFACTOR] แก้ handleDelete ให้ใช้ mutation.mutateAsync(id) แทน await deleteJobDetail(id)
// TODO: [UX] เปลี่ยนจาก confirm() เป็น AlertDialog component
// TODO: [API] เมื่อสร้าง API แล้ว แก้ไข hooks ให้เรียก DELETE /api/job-details/:id

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

import { JobDetailForm } from '@/components/forms/job-detail-form'
import { jobDetailService } from '@/lib/services/job-detail.service'
import { useJobDetails } from '@/hooks/useQueries'
import { Edit, Trash2, Plus, Loader2 } from 'lucide-react'
import type { JobDetail } from '@/types/api'

interface JobDetailsClientProps {
  initialData: JobDetail[]
}

export default function JobDetailsClient({ initialData }: JobDetailsClientProps) {
  const [editingItem, setEditingItem] = useState<{ id: string; name: string } | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // ใช้ useQuery แทน useEffect + useState
  const { data: jobDetails = [], isLoading, error, refetch } = useJobDetails({ initialData })

  const handleEdit = (item: JobDetail) => {
    setEditingItem({
      id: item.id.toString(),
      name: item.name,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบรายละเอียดงานนี้?')) {
      try {
        await jobDetailService.delete(id)
        refetch()
      } catch (err) {
        alert('เกิดข้อผิดพลาด: ' + (err instanceof Error ? err.message : 'Unknown error'))
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
      <div className="mx-auto w-full max-w-7xl px-3 py-4 pb-28 sm:px-5 sm:py-6 md:pb-10 lg:px-8">
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
      <div className="mx-auto w-full max-w-7xl px-3 py-4 pb-28 sm:px-5 sm:py-6 md:pb-10 lg:px-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>กำลังโหลด...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-4 pb-28 sm:px-5 sm:py-6 md:pb-10 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-800 p-5 text-white shadow-2xl shadow-emerald-500/20 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">รายละเอียดงาน</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="min-h-11 rounded-2xl bg-white text-emerald-700 shadow-lg shadow-emerald-950/10 hover:bg-emerald-50">
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มรายละเอียดงานใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[92dvh] w-[calc(100vw-1rem)] overflow-y-auto rounded-3xl sm:w-full">
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
          <div className="rounded-3xl border border-dashed border-emerald-200 bg-white/70 py-10 text-center text-gray-500 shadow-sm">
            ไม่มีข้อมูลรายละเอียดงาน
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedJobDetails.map((jobDetail: JobDetail) => (
              <Card key={jobDetail.id.toString()} className="card-glass transition-all hover:shadow-xl hover:shadow-emerald-500/10">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-start justify-between gap-3">
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
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[92dvh] w-[calc(100vw-1rem)] overflow-y-auto rounded-3xl sm:w-full">
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
