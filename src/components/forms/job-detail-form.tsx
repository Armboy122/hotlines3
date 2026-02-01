'use client'

// TODO: [REFACTOR] เปลี่ยนจาก import server action เป็นใช้ useCreateJobDetail(), useUpdateJobDetail() hooks
// TODO: [API] เมื่อสร้าง API แล้ว แก้ไข hooks ให้เรียก POST /api/job-details และ PATCH /api/job-details/:id

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createJobDetail, updateJobDetail, type CreateJobDetailData, type UpdateJobDetailData } from '@/lib/actions/job-detail'

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const result = initialData 
        ? await updateJobDetail({ ...formData, id: initialData.id } as UpdateJobDetailData)
        : await createJobDetail(formData)

      if (result.success) {
        if (!initialData) {
          setFormData({ name: '' }) // Reset form for create
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
