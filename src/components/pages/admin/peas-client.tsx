'use client'

// TODO: [REFACTOR] เปลี่ยนจาก import deletePea เป็นใช้ useDeletePea() hook
// TODO: [REFACTOR] แก้ handleDelete ให้ใช้ mutation.mutateAsync(id) แทน await deletePea(id)
// TODO: [UX] เปลี่ยนจาก confirm() เป็น AlertDialog component
// TODO: [API] เมื่อสร้าง API แล้ว แก้ไข hooks ให้เรียก DELETE /api/peas/:id

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { PeaForm } from '@/components/forms/pea-form'
import { BulkPeaForm } from '@/components/forms/bulk-pea-form'
import { usePeas, useDeletePea } from '@/hooks'
import { Edit, Trash2, Plus, Loader2 } from 'lucide-react'
import type { Pea } from '@/types/api'

interface PeasClientProps {
  initialData: Pea[]
}

export default function PeasClient({ initialData }: PeasClientProps) {
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isBulkCreateDialogOpen, setIsBulkCreateDialogOpen] = useState(false)
  const [selectedOperationCenter, setSelectedOperationCenter] = useState<any>(null)

  // ใช้ useQuery แทน useEffect + useState
  const { data: peas = [], isLoading, error, refetch } = usePeas({ initialData })

  const handleEdit = (item: any) => {
    setEditingItem({
      id: item.id.toString(),
      shortname: item.shortname,
      fullname: item.fullname,
      operationId: item.operationId.toString(),
    })
    setIsEditDialogOpen(true)
  }

  const deleteMutation = useDeletePea()

  const handleDelete = async (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบการไฟฟ้านี้?')) {
      await deleteMutation.mutateAsync(id)
      refetch()
    }
  }

  const handleSuccess = () => {
    setIsCreateDialogOpen(false)
    setIsEditDialogOpen(false)
    setIsBulkCreateDialogOpen(false)
    setEditingItem(null)
    setSelectedOperationCenter(null)
    refetch()
  }

  const handleBulkAdd = (operationCenter: any) => {
    setSelectedOperationCenter(operationCenter)
    setIsBulkCreateDialogOpen(true)
  }

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

  // จัดกลุ่ม PEA ตาม OperationCenter
  const groupedPeas = peas.reduce((groups: any, pea: any) => {
    const operationCenterName = pea.operationCenter.name
    if (!groups[operationCenterName]) {
      groups[operationCenterName] = []
    }
    groups[operationCenterName].push(pea)
    return groups
  }, {})

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-4 pb-28 sm:px-5 sm:py-6 md:pb-10 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-800 p-5 text-white shadow-2xl shadow-emerald-500/20 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">การไฟฟ้า</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="min-h-11 rounded-2xl bg-white text-emerald-700 shadow-lg shadow-emerald-950/10 hover:bg-emerald-50">
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มการไฟฟ้าใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[92dvh] w-[calc(100vw-1rem)] overflow-y-auto rounded-3xl sm:w-full">
            <DialogHeader>
              <DialogTitle>เพิ่มการไฟฟ้าใหม่</DialogTitle>
            </DialogHeader>
            <PeaForm onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      {Object.keys(groupedPeas).length === 0 ? (
        <div className="rounded-3xl border border-dashed border-emerald-200 bg-white/70 py-10 text-center text-gray-500 shadow-sm">
          ไม่มีข้อมูลการไฟฟ้า
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedPeas).map(([operationCenterName, peasInGroup]: [string, any]) => (
            <div key={operationCenterName} className="space-y-4">
              <div className="border-b pb-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <span className="w-1 h-6 bg-emerald-500 rounded"></span>
                    {operationCenterName}
                    <span className="text-sm font-normal text-gray-500">
                      ({peasInGroup.length} หน่วย)
                    </span>
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-h-11 rounded-xl bg-white/70 px-3"
                    onClick={() => handleBulkAdd(peasInGroup[0].operationCenter)}
                  >
                    <Plus className="h-4 w-4" />
                    เพิ่มการไฟฟ้าหลายตัว
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {peasInGroup.map((pea: any) => (
                  <Card key={pea.id.toString()} className="card-glass transition-all hover:shadow-xl hover:shadow-emerald-500/10">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-lg font-bold text-emerald-600">{pea.shortname}</div>
                          <div className="text-sm font-normal text-gray-600">{pea.fullname}</div>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(pea)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(pea.id.toString())}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1 text-sm leading-6 text-gray-600">

                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[92dvh] w-[calc(100vw-1rem)] overflow-y-auto rounded-3xl sm:w-full">
          <DialogHeader>
            <DialogTitle>แก้ไขการไฟฟ้า</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <PeaForm
              initialData={editingItem}
              onSuccess={handleSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isBulkCreateDialogOpen} onOpenChange={setIsBulkCreateDialogOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>เพิ่มการไฟฟ้าหลายตัว</DialogTitle>
          </DialogHeader>
          {selectedOperationCenter && (
            <BulkPeaForm
              operationCenter={selectedOperationCenter}
              onSuccess={handleSuccess}
              existingPeas={peas}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
