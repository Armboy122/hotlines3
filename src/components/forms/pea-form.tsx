'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createPea, updatePea, type CreatePeaData, type UpdatePeaData } from '@/lib/actions/pea'
import { getOperationCenters } from '@/lib/actions/operation-center'

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
  const [operationCenters, setOperationCenters] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadOperationCenters = async () => {
      const result = await getOperationCenters()
      if (result.success && result.data) {
        setOperationCenters(result.data)
      }
      setIsLoading(false)
    }
    loadOperationCenters()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const result = initialData 
        ? await updatePea({ ...formData, id: initialData.id } as UpdatePeaData)
        : await createPea(formData)

      if (result.success) {
        if (!initialData) {
          setFormData({ shortname: '', fullname: '', operationId: '' }) // Reset form for create
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
