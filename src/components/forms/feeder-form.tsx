'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCreateFeeder, useUpdateFeeder } from '@/hooks'
import { useStations } from '@/hooks/useQueries'
import type { CreateFeederData, UpdateFeederData } from '@/lib/actions/feeder'

interface FeederFormProps {
  initialData?: {
    id: string
    code: string
    stationId: string
  }
  onSuccess?: () => void
}

export function FeederForm({ initialData, onSuccess }: FeederFormProps) {
  const [formData, setFormData] = useState<CreateFeederData>({
    code: initialData?.code || '',
    stationId: initialData?.stationId || '',
  })
  
  // ใช้ useQuery แทน useEffect + useState
  const { data: stations = [], isLoading } = useStations()
  
  const createMutation = useCreateFeeder()
  const updateMutation = useUpdateFeeder()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (initialData) {
        await updateMutation.mutateAsync({ ...formData, id: initialData.id } as UpdateFeederData)
      } else {
        await createMutation.mutateAsync(formData)
      }
      
      if (!initialData) {
        setFormData({ code: '', stationId: '' }) // Reset form for create
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
                {stations.map((station) => (
                  <SelectItem key={station.id.toString()} value={station.id.toString()}>
                    {station.codeName} - {station.name}
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
