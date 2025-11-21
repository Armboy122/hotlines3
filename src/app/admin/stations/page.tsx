'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { StationForm } from '@/components/forms/station-form'
import { deleteStation } from '@/lib/actions/station'
import { useStations } from '@/hooks/useQueries'
import { Edit, Trash2, Plus, Loader2 } from 'lucide-react'

interface Station {
  id: string | number
  name: string
  codeName: string
  operationId: string | number
  operationCenter: {
    name: string
  }
  _count: {
    feeders: number
  }
}

export default function StationsPage() {
  const [editingItem, setEditingItem] = useState<{ id: string; name: string; codeName: string; operationId: string } | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // ใช้ useQuery แทน useEffect + useState
  const { data: stations = [], isLoading, error, refetch } = useStations() as { data: Station[], isLoading: boolean, error: unknown, refetch: () => void }

  const handleEdit = (item: Station) => {
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
      const result = await deleteStation(id)
      if (result.success) {
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
    refetch()
  }

  // แสดง error ถ้ามี
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p className="text-red-500">เกิดข้อผิดพลาด: {error instanceof Error ? error.message : 'Unknown error'}</p>
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
        <h1 className="text-3xl font-bold">สถานี</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มสถานีใหม่
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>เพิ่มสถานีใหม่</DialogTitle>
            </DialogHeader>
            <StationForm onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stations.map((station) => (
          <Card key={station.id.toString()}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <div>
                  <div>{station.name}</div>
                  <div className="text-sm font-normal text-blue-600">{station.codeName}</div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(station)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(station.id.toString())}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                <p>จุดรวมงาน: {station.operationCenter.name}</p>
                <p>ฟีดเดอร์: {station._count.feeders} เส้น</p>

              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stations.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          ไม่มีข้อมูลสถานี
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
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
