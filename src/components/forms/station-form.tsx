'use client'

// TODO: [REFACTOR] เปลี่ยนจาก import server action เป็นใช้ useCreateStation(), useUpdateStation() hooks
// TODO: [API] เมื่อสร้าง API แล้ว แก้ไข hooks ให้เรียก POST /api/stations และ PATCH /api/stations/:id

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createStation, updateStation, type CreateStationData, type UpdateStationData } from '@/lib/actions/station'
import { useOperationCenters } from '@/hooks/useQueries'

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // ใช้ useQuery แทน useEffect + useState
  const { data: operationCenters = [], isLoading } = useOperationCenters()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const result = initialData 
        ? await updateStation({ ...formData, id: initialData.id } as UpdateStationData)
        : await createStation(formData)

      if (result.success) {
        if (!initialData) {
          setFormData({ name: '', codeName: '', operationId: '' }) // Reset form for create
        }
        onSuccess?.()
      } else {
        setError(result.error || 'เกิดข้อผิดพลาด')
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
    } finally {
      setIsSubmitting(false)
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

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'กำลังบันทึก...' : (initialData ? 'อัปเดต' : 'บันทึก')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
