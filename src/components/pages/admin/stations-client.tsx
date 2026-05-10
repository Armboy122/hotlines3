'use client'

// TODO: [REFACTOR] เปลี่ยนจาก import deleteStation เป็นใช้ useDeleteStation() hook
// TODO: [REFACTOR] แก้ handleDelete ให้ใช้ mutation.mutateAsync(id) แทน await deleteStation(id)
// TODO: [UX] เปลี่ยนจาก confirm() เป็น AlertDialog component
// TODO: [API] เมื่อสร้าง API แล้ว แก้ไข hooks ให้เรียก DELETE /api/stations/:id

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { StationForm } from '@/components/forms/station-form'
import { stationService } from '@/lib/services/station.service'
import { useStations } from '@/hooks/useQueries'
import { Edit, Trash2, Plus, Loader2 } from 'lucide-react'
import type { Station } from '@/types/api'

interface StationsClientProps {
  initialData: Station[]
}

export default function StationsClient({ initialData }: StationsClientProps) {
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // ใช้ useQuery แทน useEffect + useState
  const { data: stations = [], isLoading, error, refetch } = useStations({ initialData })

  const handleEdit = (item: any) => {
    setEditingItem({
      id: item.id.toString(),
      name: item.name,
      codeName: item.codeName,
      operationId: item.operationId.toString(),
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบสถานีนี้?')) {
      try {
        await stationService.delete(id)
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
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">สถานี</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="min-h-11 rounded-2xl bg-white text-emerald-700 shadow-lg shadow-emerald-950/10 hover:bg-emerald-50">
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มสถานีใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[92dvh] w-[calc(100vw-1rem)] overflow-y-auto rounded-3xl sm:w-full">
            <DialogHeader>
              <DialogTitle>เพิ่มสถานีใหม่</DialogTitle>
            </DialogHeader>
            <StationForm onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stations.map((station) => (
          <Card className="card-glass transition-all hover:shadow-xl hover:shadow-emerald-500/10" key={station.id.toString()}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-start justify-between gap-3">
                <div>
                  <div>{station.name}</div>
                  <div className="text-sm font-normal text-emerald-600">{station.codeName}</div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-11 w-11 rounded-xl bg-white/70 p-0"
                    onClick={() => handleEdit(station)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-11 w-11 rounded-xl p-0"
                    onClick={() => handleDelete(station.id.toString())}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm leading-6 text-gray-600">
                <p>จุดรวมงาน: {station.operationCenter?.name}</p>

              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stations.length === 0 && (
        <div className="rounded-3xl border border-dashed border-emerald-200 bg-white/70 py-10 text-center text-gray-500 shadow-sm">
          ไม่มีข้อมูลสถานี
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[92dvh] w-[calc(100vw-1rem)] overflow-y-auto rounded-3xl sm:w-full">
          <DialogHeader>
            <DialogTitle>แก้ไขสถานี</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <StationForm
              initialData={editingItem}
              onSuccess={handleSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
