'use client'

// TODO: [REFACTOR] เปลี่ยนจาก import server action เป็นใช้ useCreateOperationCenter(), useUpdateOperationCenter() hooks
// TODO: [API] เมื่อสร้าง API แล้ว แก้ไข hooks ให้เรียก POST /api/operation-centers และ PATCH /api/operation-centers/:id

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createOperationCenter, updateOperationCenter, type CreateOperationCenterData, type UpdateOperationCenterData } from '@/lib/actions/operation-center'

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const result = initialData 
        ? await updateOperationCenter({ ...formData, id: initialData.id } as UpdateOperationCenterData)
        : await createOperationCenter(formData)

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
