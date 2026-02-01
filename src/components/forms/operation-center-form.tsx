'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCreateOperationCenter, useUpdateOperationCenter } from '@/hooks'
import type { CreateOperationCenterData, UpdateOperationCenterData } from '@/lib/actions/operation-center'

interface OperationCenterFormProps {
  initialData?: {
    id: string
    name: string
  }
  onSuccess?: () => void
}

export function OperationCenterForm({ initialData, onSuccess }: OperationCenterFormProps) {
  const [formData, setFormData] = useState<CreateOperationCenterData>({
    name: initialData?.name || '',
  })

  const createMutation = useCreateOperationCenter()
  const updateMutation = useUpdateOperationCenter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (initialData) {
        await updateMutation.mutateAsync({ ...formData, id: initialData.id } as UpdateOperationCenterData)
      } else {
        await createMutation.mutateAsync(formData)
      }

      if (!initialData) {
        setFormData({ name: '' }) // Reset form for create
      }
      onSuccess?.()
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          {initialData ? 'แก้ไขจุดรวมงาน' : 'เพิ่มจุดรวมงานใหม่'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">ชื่อจุดรวมงาน *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="เช่น จุดรวมงานภาคเหนือ"
            />
          </div>

          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="w-full">
            {createMutation.isPending || updateMutation.isPending ? 'กำลังบันทึก...' : (initialData ? 'อัปเดต' : 'บันทึก')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
