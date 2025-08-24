'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { createPlanAbs, updatePlanAbs, type CreatePlanAbsData, type UpdatePlanAbsData } from '@/lib/actions/plan-abs'

interface PlanAbsFormProps {
  initialData?: {
    id: string
    year: number
    deviceLabel: string
    isDone: boolean
    doneOn: Date | null
    isCancelled: boolean
  }
  onSuccess?: () => void
  onCancel?: () => void
}

export default function PlanAbsForm({ initialData, onSuccess, onCancel }: PlanAbsFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Form state
  const [year, setYear] = useState(initialData?.year || new Date().getFullYear())
  const [deviceLabel, setDeviceLabel] = useState(initialData?.deviceLabel || '')
  const [isDone, setIsDone] = useState(initialData?.isDone || false)
  const [doneOn, setDoneOn] = useState<Date | undefined>(
    initialData?.doneOn ? new Date(initialData.doneOn) : undefined
  )
  const [isCancelled, setIsCancelled] = useState(initialData?.isCancelled || false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data: CreatePlanAbsData | UpdatePlanAbsData = {
        year,
        deviceLabel: deviceLabel.trim(),
        isDone,
        doneOn: doneOn || null,
        isCancelled,
        ...(initialData && { id: initialData.id }),
      }

      const result = initialData 
        ? await updatePlanAbs(data as UpdatePlanAbsData)
        : await createPlanAbs(data)

      if (result.success) {
        if (onSuccess) {
          onSuccess()
        } else {
          router.push('/admin/plan-abs')
        }
      } else {
        alert(result.error || 'เกิดข้อผิดพลาด')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {initialData ? 'แก้ไขแผน ABS' : 'เพิ่มแผน ABS'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ปี */}
          <div className="space-y-2">
            <Label htmlFor="year">ปี</Label>
            <Input
              id="year"
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              min="2020"
              max="2030"
              required
            />
          </div>

          {/* รหัสอุปกรณ์ */}
          <div className="space-y-2">
            <Label htmlFor="deviceLabel">รหัสอุปกรณ์</Label>
            <Input
              id="deviceLabel"
              type="text"
              value={deviceLabel}
              onChange={(e) => setDeviceLabel(e.target.value)}
              placeholder="กรอกรหัสอุปกรณ์ ABS"
              required
            />
          </div>

          {/* สถานะการทำงาน */}
          <div className="space-y-2">
            <Label>สถานะการทำงาน</Label>
            <Select value={isDone.toString()} onValueChange={(value) => setIsDone(value === 'true')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">ยังไม่เสร็จ</SelectItem>
                <SelectItem value="true">เสร็จแล้ว</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* วันที่เสร็จ (ถ้าเสร็จแล้ว) */}
          {isDone && (
            <div className="space-y-2">
              <Label>วันที่เสร็จ</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {doneOn ? format(doneOn, 'PPP', { locale: th }) : 'เลือกวันที่'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={doneOn}
                    onSelect={setDoneOn}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* สถานะยกเลิก */}
          <div className="space-y-2">
            <Label>สถานะแผนงาน</Label>
            <Select value={isCancelled.toString()} onValueChange={(value) => setIsCancelled(value === 'true')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">ปกติ</SelectItem>
                <SelectItem value="true">ยกเลิก</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ปุ่มต่างๆ */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? 'บันทึกการแก้ไข' : 'เพิ่มแผนงาน'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel || (() => router.back())}
              disabled={loading}
              className="flex-1"
            >
              ยกเลิก
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
