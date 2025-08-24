'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { VoltageLevel } from '@prisma/client'
import { createPlanLine, updatePlanLine, type CreatePlanLineData, type UpdatePlanLineData } from '@/lib/actions/plan-line'
import { getFeeders } from '@/lib/actions/feeder'

interface Feeder {
  id: bigint
  code: string
  station: {
    id: bigint
    name: string
    codeName: string
    operationId: bigint
    operationCenter: {
      id: bigint
      name: string
    }
  }
  _count: {
    tasks: number
  }
}

interface PlanLineFormProps {
  initialData?: {
    id: string
    year: number
    feederId: string
    level: VoltageLevel
    planDistanceKm: number
    isCancelled: boolean
  }
  onSuccess?: () => void
  onCancel?: () => void
}

export default function PlanLineForm({ initialData, onSuccess, onCancel }: PlanLineFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [feeders, setFeeders] = useState<Feeder[]>([])
  const [loadingFeeders, setLoadingFeeders] = useState(true)

  // Form state
  const [year, setYear] = useState(initialData?.year || new Date().getFullYear())
  const [feederId, setFeederId] = useState(initialData?.feederId || '')
  const [level, setLevel] = useState<VoltageLevel>(initialData?.level || 'MID')
  const [planDistanceKm, setPlanDistanceKm] = useState(initialData?.planDistanceKm || 0)
  const [isCancelled, setIsCancelled] = useState(initialData?.isCancelled || false)

  // Load feeders
  useEffect(() => {
    async function loadFeeders() {
      try {
        const result = await getFeeders()
        if (result.success && result.data) {
          setFeeders(result.data)
        }
      } catch (error) {
        console.error('Error loading feeders:', error)
      } finally {
        setLoadingFeeders(false)
      }
    }

    loadFeeders()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data: CreatePlanLineData | UpdatePlanLineData = {
        year,
        feederId,
        level,
        planDistanceKm,
        isCancelled,
        ...(initialData && { id: initialData.id }),
      }

      const result = initialData 
        ? await updatePlanLine(data as UpdatePlanLineData)
        : await createPlanLine(data)

      if (result.success) {
        if (onSuccess) {
          onSuccess()
        } else {
          router.push('/admin/plan-lines')
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

  const voltageLevelLabels = {
    MID: '33 kV (กลาง)',
    HIGH: '115 kV (สูง)'
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {initialData ? 'แก้ไขแผนฉีดน้ำในไลน์' : 'เพิ่มแผนฉีดน้ำในไลน์'}
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

          {/* ฟีดเดอร์ */}
          <div className="space-y-2">
            <Label htmlFor="feeder">ฟีดเดอร์</Label>
            {loadingFeeders ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2">กำลังโหลดข้อมูลฟีดเดอร์...</span>
              </div>
            ) : (
              <Select value={feederId} onValueChange={setFeederId} required>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกฟีดเดอร์" />
                </SelectTrigger>
                <SelectContent>
                  {feeders.map((feeder) => (
                    <SelectItem key={feeder.id.toString()} value={feeder.id.toString()}>
                      {feeder.code} - {feeder.station.codeName} ({feeder.station.operationCenter.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* ระดับแรงดัน */}
          <div className="space-y-2">
            <Label htmlFor="level">ระดับแรงดัน</Label>
            <Select value={level} onValueChange={(value) => setLevel(value as VoltageLevel)} required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(voltageLevelLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ระยะทางแผน (กม.) */}
          <div className="space-y-2">
            <Label htmlFor="planDistanceKm">ระยะทางแผน (กม.)</Label>
            <Input
              id="planDistanceKm"
              type="number"
              step="0.01"
              value={planDistanceKm}
              onChange={(e) => setPlanDistanceKm(parseFloat(e.target.value) || 0)}
              min="0"
              required
            />
          </div>

          {/* สถานะยกเลิก */}
          <div className="space-y-2">
            <Label>สถานะ</Label>
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
              disabled={loading || loadingFeeders}
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
