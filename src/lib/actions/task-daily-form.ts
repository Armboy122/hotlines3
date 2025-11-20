'use server'

import { createTaskDaily } from './task-daily'
import type { CreateTaskDailyData } from '@/types/task-daily'
import { redirect } from 'next/navigation'

export async function submitTaskDailyForm(formData: FormData) {
  const parseCoordinate = (value: FormDataEntryValue | null) => {
    if (typeof value !== 'string') return undefined
    const trimmed = value.trim()
    if (!trimmed) return undefined
    const parsed = Number(trimmed)
    return Number.isFinite(parsed) ? parsed : undefined
  }

  const latitude = parseCoordinate(formData.get('latitude'))
  const longitude = parseCoordinate(formData.get('longitude'))

  const data: CreateTaskDailyData = {
    workDate: formData.get('workDate') as string,
    teamId: formData.get('teamId') as string,
    jobTypeId: formData.get('jobTypeId') as string,
    jobDetailId: formData.get('jobDetailId') as string,
    feederId: formData.get('feederId') as string || undefined,
    numPole: formData.get('numPole') as string || undefined,
    deviceCode: formData.get('deviceCode') as string || undefined,
    detail: formData.get('detail') as string || undefined,
    urlsBefore: JSON.parse(formData.get('urlsBefore') as string || '[]'),
    urlsAfter: JSON.parse(formData.get('urlsAfter') as string || '[]'),
  }

  if (latitude !== undefined) {
    data.latitude = latitude
  }

  if (longitude !== undefined) {
    data.longitude = longitude
  }

  const result = await createTaskDaily(data)
  
  if (result.success) {
    redirect('/?success=true')
  } else {
    redirect(`/?error=${encodeURIComponent(result.error || 'เกิดข้อผิดพลาด')}`)
  }
}
