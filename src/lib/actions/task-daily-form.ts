'use server'

import { createTaskDaily, type CreateTaskDailyData } from './task-daily'
import { redirect } from 'next/navigation'

export async function submitTaskDailyForm(formData: FormData) {
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

  const result = await createTaskDaily(data)
  
  if (result.success) {
    redirect('/?success=true')
  } else {
    redirect(`/?error=${encodeURIComponent(result.error || 'เกิดข้อผิดพลาด')}`)
  }
}
