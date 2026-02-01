'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCreateJobType, useUpdateJobType } from '@/hooks'
import type { CreateJobTypeData, UpdateJobTypeData } from '@/lib/actions/job-type'

interface JobTypeFormProps {
  initialData?: {
    id: string
    name: string
  }
  onSuccess?: () => void
}

export function JobTypeForm({ initialData, onSuccess }: JobTypeFormProps) {
  const [formData, setFormData] = useState<CreateJobTypeData>({
    name: initialData?.name || '',
  })

  const createMutation = useCreateJobType()
  const updateMutation = useUpdateJobType()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (initialData) {
        await updateMutation.mutateAsync({ ...formData, id: initialData.id } as UpdateJobTypeData)
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
          {initialData ? 'แก้ไขประเภทงาน' : 'เพิ่มประเภทงานใหม่'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">ชื่อประเภทงาน *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="เช่น งานบำรุงรักษา"
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
