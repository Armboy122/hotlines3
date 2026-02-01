'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCreatePea, useUpdatePea } from '@/hooks'
import { useOperationCenters } from '@/hooks/useQueries'
import type { CreatePeaData, UpdatePeaData } from '@/lib/actions/pea'

interface PeaFormProps {
  initialData?: {
    id: string
    shortname: string
    fullname: string
    operationId: string
  }
  onSuccess?: () => void
}

export function PeaForm({ initialData, onSuccess }: PeaFormProps) {
  const [formData, setFormData] = useState<CreatePeaData>({
    shortname: initialData?.shortname || '',
    fullname: initialData?.fullname || '',
    operationId: initialData?.operationId || '',
  })
  
  // ใช้ useQuery แทน useEffect + useState
  const { data: operationCenters = [], isLoading } = useOperationCenters()
  
  const createMutation = useCreatePea()
  const updateMutation = useUpdatePea()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (initialData) {
        await updateMutation.mutateAsync({ ...formData, id: initialData.id } as UpdatePeaData)
      } else {
        await createMutation.mutateAsync(formData)
      }
      
      if (!initialData) {
        setFormData({ shortname: '', fullname: '', operationId: '' }) // Reset form for create
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
          {initialData ? 'แก้ไขการไฟฟ้า' : 'เพิ่มการไฟฟ้าใหม่'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shortname">ชื่อย่อ *</Label>
            <Input
              id="shortname"
              type="text"
              value={formData.shortname}
              onChange={(e) => setFormData({ ...formData, shortname: e.target.value })}
              required
              placeholder="เช่น กฟน."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullname">ชื่อเต็ม *</Label>
            <Input
              id="fullname"
              type="text"
              value={formData.fullname}
              onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
              required
              placeholder="เช่น การไฟฟ้าส่วนภูมิภาคภาคเหนือ"
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
