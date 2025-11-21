'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createFeeder, updateFeeder, type CreateFeederData, type UpdateFeederData } from '@/lib/actions/feeder'
import { useStations } from '@/hooks/useQueries'

interface FeederFormProps {
  initialData?: {
    id: string
    code: string
    stationId: string
  }
  onSuccess?: () => void
}

interface Station {
  id: string | number
  name: string
  codeName: string
}

export function FeederForm({ initialData, onSuccess }: FeederFormProps) {
  const [formData, setFormData] = useState<CreateFeederData>({
    code: initialData?.code || '',
    stationId: initialData?.stationId || '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // ใช้ useQuery แทน useEffect + useState
  const { data: stations = [], isLoading } = useStations() as { data: Station[], isLoading: boolean }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const result = initialData 
        ? await updateFeeder({ ...formData, id: initialData.id } as UpdateFeederData)
        : await createFeeder(formData)

      if (result.success) {
        if (!initialData) {
          setFormData({ code: '', stationId: '' }) // Reset form for create
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
          {initialData ? 'แก้ไขฟีดเดอร์' : 'เพิ่มฟีดเดอร์ใหม่'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">รหัสฟีดเดอร์ *</Label>
            <Input
              id="code"
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
              placeholder="เช่น LMP-01"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stationId">สถานี *</Label>
            <Select
              value={formData.stationId}
              onValueChange={(value) => setFormData({ ...formData, stationId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือกสถานี" />
              </SelectTrigger>
              <SelectContent>
                {stations.map((station: Station) => (
                  <SelectItem key={station.id.toString()} value={station.id.toString()}>
                    {station.codeName} - {station.name}
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
