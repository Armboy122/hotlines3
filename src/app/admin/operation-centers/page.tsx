'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { OperationCenterForm } from '@/components/forms/operation-center-form'
import { getOperationCenters, deleteOperationCenter } from '@/lib/actions/operation-center'
import { Edit, Trash2, Plus } from 'lucide-react'

export default function OperationCentersPage() {
  const [operationCenters, setOperationCenters] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    const result = await getOperationCenters()
    if (result.success && result.data) {
      setOperationCenters(result.data)
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
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบจุดรวมงานนี้?')) {
      const result = await deleteOperationCenter(id)
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
        <h1 className="text-3xl font-bold">จุดรวมงาน</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มจุดรวมงานใหม่
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>เพิ่มจุดรวมงานใหม่</DialogTitle>
            </DialogHeader>
            <OperationCenterForm onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {operationCenters.map((center) => (
          <Card key={center.id.toString()}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{center.name}</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(center)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(center.id.toString())}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                <p>การไฟฟ้า: {center._count.peas} หน่วย</p>
                <p>สถานี: {center._count.stations} แห่ง</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {operationCenters.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          ไม่มีข้อมูลจุดรวมงาน
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขจุดรวมงาน</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <OperationCenterForm
              initialData={editingItem}
              onSuccess={handleSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
