'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createJobDetail, updateJobDetail, type CreateJobDetailData, type UpdateJobDetailData } from '@/lib/actions/job-detail'
import { getJobTypes } from '@/lib/actions/job-type'

interface JobDetailFormProps {
  initialData?: {
    id: string
    jobTypeId: string
    name: string
    active: boolean
  }
  onSuccess?: () => void
}

export function JobDetailForm({ initialData, onSuccess }: JobDetailFormProps) {
  const [formData, setFormData] = useState<CreateJobDetailData>({
    jobTypeId: initialData?.jobTypeId || '',
    name: initialData?.name || '',
    active: initialData?.active ?? true,
  })
  const [jobTypes, setJobTypes] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadJobTypes = async () => {
      const result = await getJobTypes()
      if (result.success && result.data) {
        setJobTypes(result.data)
      }
      setIsLoading(false)
    }
    loadJobTypes()
  }, [])

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
          setFormData({ jobTypeId: '', name: '', active: true }) // Reset form for create
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
          {initialData ? 'แก้ไขรายละเอียดงาน' : 'เพิ่มรายละเอียดงานใหม่'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jobTypeId">ประเภทงาน *</Label>
            <Select
              value={formData.jobTypeId}
              onValueChange={(value) => setFormData({ ...formData, jobTypeId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือกประเภทงาน" />
              </SelectTrigger>
              <SelectContent>
                {jobTypes.map((jobType) => (
                  <SelectItem key={jobType.id.toString()} value={jobType.id.toString()}>
                    {jobType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="active">สถานะ *</Label>
            <Select
              value={formData.active?.toString() || 'true'}
              onValueChange={(value) => setFormData({ ...formData, active: value === 'true' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">ใช้งาน</SelectItem>
                <SelectItem value="false">ไม่ใช้งาน</SelectItem>
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
