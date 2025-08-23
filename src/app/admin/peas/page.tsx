'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { PeaForm } from '@/components/forms/pea-form'
import { getPeas, deletePea } from '@/lib/actions/pea'
import { Edit, Trash2, Plus } from 'lucide-react'

export default function PeasPage() {
  const [peas, setPeas] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    const result = await getPeas()
    if (result.success && result.data) {
      setPeas(result.data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleEdit = (item: any) => {
    setEditingItem({
      id: item.id.toString(),
      shortname: item.shortname,
      fullname: item.fullname,
      operationId: item.operationId.toString(),
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบการไฟฟ้านี้?')) {
      const result = await deletePea(id)
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
        <h1 className="text-3xl font-bold">การไฟฟ้า</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มการไฟฟ้าใหม่
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>เพิ่มการไฟฟ้าใหม่</DialogTitle>
            </DialogHeader>
            <PeaForm onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {peas.map((pea) => (
          <Card key={pea.id.toString()}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <div>
                  <div className="text-lg font-bold text-blue-600">{pea.shortname}</div>
                  <div className="text-sm font-normal text-gray-600">{pea.fullname}</div>
                </div>
                <div className="flex gap-2">
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
              <div className="text-sm text-gray-600">
                <p>จุดรวมงาน: {pea.operationCenter.name}</p>
                <p>แผนไม้ฉนวน: {pea._count.planConductors} แผน</p>
                <p>แผนรถกระเช้า: {pea._count.planCableCars} แผน</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {peas.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          ไม่มีข้อมูลการไฟฟ้า
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
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
    </div>
  )
}
