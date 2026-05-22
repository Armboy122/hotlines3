'use client'

// TODO: [REFACTOR] เปลี่ยนจาก import deleteJobType เป็นใช้ useDeleteJobType() hook
// TODO: [REFACTOR] แก้ handleDelete ให้ใช้ mutation.mutateAsync(id) แทน await deleteJobType(id)
// TODO: [UX] เปลี่ยนจาก confirm() เป็น AlertDialog component
// TODO: [API] เมื่อสร้าง API แล้ว แก้ไข hooks ให้เรียก DELETE /api/job-types/:id

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { JobTypeForm } from '@/components/forms/job-type-form'
import { jobTypeService } from '@/lib/services/job-type.service'
import { useJobTypes } from '@/hooks/useQueries'
import { Edit, Trash2, Plus, Loader2 } from 'lucide-react'
import type { JobType } from '@/types/api'

interface JobTypesClientProps {
  initialData: JobType[]
}

export default function JobTypesClient({ initialData }: JobTypesClientProps) {
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // ใช้ useQuery แทน useEffect + useState
  const { data: jobTypes = [], isLoading, error, refetch } = useJobTypes({ initialData })

  const handleEdit = (item: any) => {
    setEditingItem({
      id: item.id.toString(),
      name: item.name,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบประเภทงานนี้?')) {
      try {
        await jobTypeService.delete(id)
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
    refetch()
  }

  // แสดง error ถ้ามี
  if (error) {
    return (
      <div className="mx-auto w-full max-w-7xl px-3 py-4 pb-28 sm:px-5 sm:py-6 md:pb-10 lg:px-8">
        <div className="smart-home-card p-6 text-center">
          <p className="text-red-500">เกิดข้อผิดพลาด: {error.message}</p>
          <Button onClick={() => refetch()} className="mt-4 min-h-11 rounded-2xl bg-blue-600 text-white hover:bg-blue-700">
            ลองใหม่
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-3 py-4 pb-28 sm:px-5 sm:py-6 md:pb-10 lg:px-8">
        <div className="smart-home-card flex min-h-40 items-center justify-center text-slate-600">
          <Loader2 className="mr-2 h-8 w-8 animate-spin text-blue-600" />
          <span>กำลังโหลด...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-4 pb-28 sm:px-5 sm:py-6 md:pb-10 lg:px-8">
      <div className="smart-home-hero mb-6 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-white/20" />
        <h1 className="relative z-10 text-2xl font-black tracking-tight sm:text-3xl">ประเภทงาน</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="relative z-10 min-h-11 rounded-2xl bg-white text-blue-700 shadow-lg shadow-blue-950/10 hover:bg-sky-50">
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มประเภทงานใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[92dvh] w-[calc(100vw-1rem)] overflow-y-auto rounded-3xl sm:w-full">
            <DialogHeader>
              <DialogTitle>เพิ่มประเภทงานใหม่</DialogTitle>
            </DialogHeader>
            <JobTypeForm onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobTypes.map((jobType) => (
          <Card className="smart-home-card-hover transition-all" key={jobType.id.toString()}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-start justify-between gap-3">
                <span className="break-words text-slate-900">{jobType.name}</span>
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="smart-home-control h-11 w-11 rounded-xl p-0"
                    onClick={() => handleEdit(jobType)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-11 w-11 rounded-xl p-0"
                    onClick={() => handleDelete(jobType.id.toString())}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {jobTypes.length === 0 && (
        <div className="rounded-2xl border border-dashed border-sky-200 bg-white/70 py-10 text-center text-gray-500 shadow-sm">
          ไม่มีข้อมูลประเภทงาน
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[92dvh] w-[calc(100vw-1rem)] overflow-y-auto rounded-3xl sm:w-full">
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
