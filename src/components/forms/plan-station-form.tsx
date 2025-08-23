'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { createPlanStation, updatePlanStation, type CreatePlanStationData, type UpdatePlanStationData } from '@/lib/actions/plan-station'
import { getStations } from '@/lib/actions/station'

interface PlanStationFormProps {
  initialData?: {
    id: string
    year: number
    stationId: string
    isDone: boolean
    doneOn: Date | null
  }
  onSuccess?: () => void
}

export function PlanStationForm({ initialData, onSuccess }: PlanStationFormProps) {
  const [formData, setFormData] = useState<CreatePlanStationData>({
    year: initialData?.year || new Date().getFullYear(),
    stationId: initialData?.stationId || '',
    isDone: initialData?.isDone || false,
    doneOn: initialData?.doneOn || null,
  })
  const [stations, setStations] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStations = async () => {
      const result = await getStations()
      if (result.success && result.data) {
        setStations(result.data)
      }
      setIsLoading(false)
    }
    loadStations()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const result = initialData 
        ? await updatePlanStation({ ...formData, id: initialData.id } as UpdatePlanStationData)
        : await createPlanStation(formData)

      if (result.success) {
        if (!initialData) {
          setFormData({ 
            year: new Date().getFullYear(), 
            stationId: '', 
            isDone: false, 
            doneOn: null 
          }) // Reset form for create
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
          {initialData ? 'แก้ไขแผนฉีดน้ำสถานี' : 'เพิ่มแผนฉีดน้ำสถานีใหม่'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="year">ปี *</Label>
            <Input
              id="year"
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              required
              min="2020"
              max="2030"
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

          <div className="space-y-2">
            <Label htmlFor="isDone">สถานะ</Label>
            <Select
              value={formData.isDone?.toString() || 'false'}
              onValueChange={(value) => {
                const isDone = value === 'true'
                setFormData({ 
                  ...formData, 
                  isDone,
                  doneOn: isDone ? (formData.doneOn || new Date()) : null
                })
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">ยังไม่เสร็จ</SelectItem>
                <SelectItem value="true">เสร็จแล้ว</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.isDone && (
            <div className="space-y-2">
              <Label>วันที่เสร็จ</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.doneOn ? format(formData.doneOn, 'dd MMM yyyy', { locale: th }) : 'เลือกวันที่'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.doneOn || undefined}
                    onSelect={(date) => setFormData({ ...formData, doneOn: date || null })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

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
