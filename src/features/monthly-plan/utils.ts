import type { MonthlyPlanPeriod, SubmissionStatus, TeamSubmissionStatus } from '@/types/monthly-plan'

export function formatPeriodLabel(period: MonthlyPlanPeriod): string {
  const thaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
  ]
  const thaiYear = period.year + 543
  return `${thaiMonths[period.month - 1]} ${String(thaiYear).slice(-2)}`
}

export function formatPeriodLabelFull(period: MonthlyPlanPeriod): string {
  const thaiMonthsFull = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
  ]
  const thaiYear = period.year + 543
  return `${thaiMonthsFull[period.month - 1]} ${thaiYear}`
}

export function isPeriodLocked(period: MonthlyPlanPeriod): boolean {
  return period.isLocked
}

export function getSubmissionStatus(submission: TeamSubmissionStatus): SubmissionStatus {
  return submission.status
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getStatusLabel(status: SubmissionStatus): string {
  switch (status) {
    case 'submitted': return 'ส่งแล้ว'
    case 'pending': return 'ยังไม่ส่ง'
    case 'missed': return 'ไม่ได้ส่ง'
  }
}

export function filterFiles<T extends { fileName: string; teamId: number; isDeleted: boolean }>(
  files: T[],
  search: string,
  teamId: number | null,
  includeDeleted = false
): T[] {
  return files.filter((f) => {
    if (!includeDeleted && f.isDeleted) return false
    if (teamId !== null && f.teamId !== teamId) return false
    if (search && !f.fileName.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })
}
