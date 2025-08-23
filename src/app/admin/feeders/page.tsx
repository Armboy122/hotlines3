'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FeederForm } from '@/components/forms/feeder-form'
import { getFeeders, deleteFeeder } from '@/lib/actions/feeder'
import { Edit, Trash2, Plus } from 'lucide-react'

export default function FeedersPage() {
  const [feeders, setFeeders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    const result = await getFeeders()
    if (result.success && result.data) {
      setFeeders(result.data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleEdit = (item: any) => {
    setEditingItem({
      id: item.id.toString(),
      code: item.code,
      stationId: item.stationId.toString(),
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบฟีดเดอร์นี้?')) {
      const result = await deleteFeeder(id)
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
        <h1 className="text-3xl font-bold">ฟีดเดอร์</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มฟีดเดอร์ใหม่
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>เพิ่มฟีดเดอร์ใหม่</DialogTitle>
            </DialogHeader>
            <FeederForm onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {feeders.map((feeder) => (
          <Card key={feeder.id.toString()}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <div>
                  <div className="text-lg font-bold text-blue-600">{feeder.code}</div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(feeder)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(feeder.id.toString())}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                <p>สถานี: {feeder.station.codeName} - {feeder.station.name}</p>
                <p>จุดรวมงาน: {feeder.station.operationCenter.name}</p>
                <p>งานที่เกี่ยวข้อง: {feeder._count.tasks} งาน</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {feeders.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          ไม่มีข้อมูลฟีดเดอร์
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขฟีดเดอร์</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <FeederForm
              initialData={editingItem}
              onSuccess={handleSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
