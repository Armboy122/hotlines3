'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { createPlanConductor, updatePlanConductor, type CreatePlanConductorData, type UpdatePlanConductorData } from '@/lib/actions/plan-conductor'
import { getPeas } from '@/lib/actions/pea'

interface Pea {
  id: bigint
  shortname: string
  fullname: string
  operationCenter: {
    id: bigint
    name: string
  }
}

interface PlanConductorFormProps {
  initialData?: {
    id: string
    year: number
    peaId: string
    description: string | null
    isDone: boolean
    doneOn: Date | null
    isCancelled: boolean
  }
  onSuccess?: () => void
  onCancel?: () => void
}

export default function PlanConductorForm({ initialData, onSuccess, onCancel }: PlanConductorFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [peas, setPeas] = useState<Pea[]>([])
  const [loadingPeas, setLoadingPeas] = useState(true)

  // Form state
  const [year, setYear] = useState(initialData?.year || new Date().getFullYear())
  const [peaId, setPeaId] = useState(initialData?.peaId || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [isDone, setIsDone] = useState(initialData?.isDone || false)
  const [doneOn, setDoneOn] = useState<Date | undefined>(
    initialData?.doneOn ? new Date(initialData.doneOn) : undefined
  )
  const [isCancelled, setIsCancelled] = useState(initialData?.isCancelled || false)

  // Load PEAs
  useEffect(() => {
    async function loadPeas() {
      try {
        const result = await getPeas()
        if (result.success && result.data) {
          setPeas(result.data)
        }
      } catch (error) {
        console.error('Error loading peas:', error)
      } finally {
        setLoadingPeas(false)
      }
    }

    loadPeas()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data: CreatePlanConductorData | UpdatePlanConductorData = {
        year,
        peaId,
        description: description.trim() || undefined,
        isDone,
        doneOn: doneOn || null,
        isCancelled,
        ...(initialData && { id: initialData.id }),
      }

      const result = initialData 
        ? await updatePlanConductor(data as UpdatePlanConductorData)
        : await createPlanConductor(data)

      if (result.success) {
        if (onSuccess) {
          onSuccess()
        } else {
          router.push('/admin/plan-conductors')
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
          {initialData ? 'แก้ไขแผนบำรุงรักษาไม้ฉนวน' : 'เพิ่มแผนบำรุงรักษาไม้ฉนวน'}
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

          {/* การไฟฟ้า */}
          <div className="space-y-2">
            <Label htmlFor="pea">การไฟฟ้า</Label>
            {loadingPeas ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2">กำลังโหลดข้อมูลการไฟฟ้า...</span>
              </div>
            ) : (
              <Select value={peaId} onValueChange={setPeaId} required>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกการไฟฟ้า" />
                </SelectTrigger>
                <SelectContent>
                  {peas.map((pea) => (
                    <SelectItem key={pea.id.toString()} value={pea.id.toString()}>
                      {pea.shortname} - {pea.fullname} ({pea.operationCenter.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* รายละเอียด */}
          <div className="space-y-2">
            <Label htmlFor="description">รายละเอียด</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="รายละเอียดเพิ่มเติมของแผนงาน (ไม่บังคับ)"
              rows={3}
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
              disabled={loading || loadingPeas}
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
