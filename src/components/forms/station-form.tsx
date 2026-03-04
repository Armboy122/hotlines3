'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCreateStation, useUpdateStation } from '@/hooks'
import { useOperationCenters } from '@/hooks/useQueries'
import type { CreateStationData, UpdateStationData } from '@/lib/services/station.service'

interface StationFormProps {
  initialData?: {
    id: string
    name: string
    codeName: string
    operationId: string
  }
  onSuccess?: () => void
}

export function StationForm({ initialData, onSuccess }: StationFormProps) {
  const [formData, setFormData] = useState<CreateStationData>({
    name: initialData?.name || '',
    codeName: initialData?.codeName || '',
    operationId: initialData?.operationId || '',
  })
  
  // ใช้ useQuery แทน useEffect + useState
  const { data: operationCenters = [], isLoading } = useOperationCenters()
  
  const createMutation = useCreateStation()
  const updateMutation = useUpdateStation()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (initialData) {
        await updateMutation.mutateAsync({ ...formData, id: initialData.id } as UpdateStationData)
      } else {
        await createMutation.mutateAsync(formData)
      }
      
      if (!initialData) {
        setFormData({ name: '', codeName: '', operationId: '' }) // Reset form for create
      }
      onSuccess?.()
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  if (isLoading) {
    return <div>กำลังโหลด...</div>
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          {initialData ? 'แก้ไขสถานี' : 'เพิ่มสถานีใหม่'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">ชื่อสถานี *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="เช่น สถานีไฟฟ้าแรงสูงลำปาง"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="codeName">รหัสสถานี *</Label>
            <Input
              id="codeName"
              type="text"
              value={formData.codeName}
              onChange={(e) => setFormData({ ...formData, codeName: e.target.value })}
              required
              placeholder="เช่น LMP"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="operationId">จุดรวมงาน *</Label>
            <Select
              value={formData.operationId}
              onValueChange={(value) => setFormData({ ...formData, operationId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือกจุดรวมงาน" />
              </SelectTrigger>
              <SelectContent>
                {operationCenters.map((center) => (
                  <SelectItem key={center.id.toString()} value={center.id.toString()}>
                    {center.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="w-full">
            {createMutation.isPending || updateMutation.isPending ? 'กำลังบันทึก...' : (initialData ? 'อัปเดต' : 'บันทึก')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
