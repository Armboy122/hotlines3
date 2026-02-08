'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCreateJobDetail, useUpdateJobDetail } from '@/hooks'
import type { CreateJobDetailData, UpdateJobDetailData } from '@/lib/services/job-detail.service'

interface JobDetailFormProps {
  initialData?: {
    id: string
    name: string
  }
  onSuccess?: () => void
}

export function JobDetailForm({ initialData, onSuccess }: JobDetailFormProps) {
  const [formData, setFormData] = useState<CreateJobDetailData>({
    name: initialData?.name || '',
  })

  const createMutation = useCreateJobDetail()
  const updateMutation = useUpdateJobDetail()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (initialData) {
        await updateMutation.mutateAsync({ ...formData, id: initialData.id } as UpdateJobDetailData)
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
          {initialData ? 'แก้ไขรายละเอียดงาน' : 'เพิ่มรายละเอียดงานใหม่'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">ชื่อรายละเอียดงาน *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="เช่น ตรวจสอบอุปกรณ์"
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
