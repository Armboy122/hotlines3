import type { ConfirmUploadRequest, PlanFile, MonthlyPlanYearOverview } from '@/types/monthly-plan'
import {
  DEFAULT_MONTHLY_PLAN_GREGORIAN_YEAR,
  buildMonthlyPlanTeamRows,
  buildYearlyMonthlyPlanCards,
  formatPeriodLabel,
  formatPeriodLabelFull,
  formatMonthlyPlanYearLabel,
  getDefaultMonthlyPlanYear,
} from '@/features/monthly-plan/utils'

const plannedFile: PlanFile = {
  id: 1,
  monthlyPlanId: 10,
  teamId: 2,
  uploadedById: 3,
  fileKey: 'plans/team-a.pdf',
  fileURL: 'https://example.test/team-a.pdf',
  fileName: 'team-a.pdf',
  fileSizeBytes: 2048,
  description: 'งานประจำเดือน',
  workStartDate: '2026-06-01',
  workEndDate: '2026-06-07',
  destination: 'สถานี A',
  remarks: 'เตรียมอุปกรณ์ครบ',
  isMasterPlan: false,
  isDeleted: false,
  deletedAt: null,
  createdAt: '2026-05-08T00:00:00Z',
  updatedAt: '2026-05-08T00:00:00Z',
}

const confirmUpload: ConfirmUploadRequest = {
  fileKey: plannedFile.fileKey,
  fileURL: plannedFile.fileURL,
  fileName: plannedFile.fileName,
  fileSizeBytes: plannedFile.fileSizeBytes,
  description: plannedFile.description ?? undefined,
  workStartDate: plannedFile.workStartDate ?? undefined,
  workEndDate: plannedFile.workEndDate ?? undefined,
  destination: plannedFile.destination ?? undefined,
  remarks: plannedFile.remarks ?? undefined,
  isMasterPlan: false,
  teamId: 2,
}

if (!confirmUpload.workStartDate || !confirmUpload.workEndDate || !confirmUpload.destination) {
  throw new Error('monthly plan structured fields are required by the UI contract')
}

const assertEqual = <T>(actual: T, expected: T, message?: string) => {
  if (actual !== expected) throw new Error(message ?? `expected ${String(actual)} to equal ${String(expected)}`)
}
const assert = (value: boolean, message?: string) => {
  if (!value) throw new Error(message ?? 'monthly plan type assertion failed')
}

assertEqual(DEFAULT_MONTHLY_PLAN_GREGORIAN_YEAR, 2026)
assertEqual(getDefaultMonthlyPlanYear(), 2026)
assertEqual(formatMonthlyPlanYearLabel(2026), 'พ.ศ. 2569 / 2026')
assertEqual(formatPeriodLabel({ year: 2026, month: 5 }), 'พ.ค. 69')
assertEqual(formatPeriodLabelFull({ year: 2026, month: 5 }), 'พฤษภาคม 2569')
assert(!formatPeriodLabelFull({}).includes('undefined'), 'missing monthly plan period should not render undefined')
assert(!formatPeriodLabelFull({}).includes('NaN'), 'missing monthly plan period should not render NaN')

const yearlyOverview: MonthlyPlanYearOverview = {
  year: 2026,
  months: [
    {
      period: { id: 101, year: 2026, month: 1, isLocked: false, createdAt: '2026-01-01T00:00:00Z' },
      month: 1,
      deadline: '2025-12-23',
      isLocked: false,
      status: 'has_files',
      actions: { canUpload: true },
      files: [plannedFile],
    },
    {
      period: { id: 102, year: 2026, month: 2, isLocked: true, createdAt: '2026-02-01T00:00:00Z' },
      month: 2,
      deadline: '2026-01-23',
      isLocked: true,
      status: 'locked',
      actions: { canUpload: false },
      files: [],
    },
  ],
}

const cards = buildYearlyMonthlyPlanCards(yearlyOverview)
assertEqual(cards.length, 12, 'yearly monthly plan cards should always render all 12 months')
assertEqual(cards[0]?.yearLabel, 'พ.ศ. 2569 / 2026')
assertEqual(cards[0]?.month, 1)
assertEqual(cards[0]?.label, 'มกราคม')
assertEqual(cards[0]?.fileCount, 1)
assertEqual(cards[0]?.status, 'has_files')
assertEqual(cards[0]?.canUpload, true)
assertEqual(cards[1]?.month, 2)
assertEqual(cards[1]?.isLocked, true)
assertEqual(cards[1]?.canUpload, false)
assertEqual(cards[11]?.month, 12)
assertEqual(cards[11]?.fileCount, 0)
assertEqual(cards[11]?.status, 'open')
assert(cards.every((card) => card.year === 2026), 'all yearly cards should keep the overview year')

const teamRows = buildMonthlyPlanTeamRows(cards[0]!, [
  { id: 1, name: 'ทีมหนึ่ง' },
  { id: 2, name: 'ทีมสอง' },
  { id: 3, name: 'ทีมสาม' },
], 2)
assertEqual(teamRows.length, 3, 'monthly plan yearly page should render every team row for awareness')
assertEqual(teamRows[0]?.teamName, 'ทีมหนึ่ง')
assertEqual(teamRows[0]?.files.length, 0)
assertEqual(teamRows[1]?.teamName, 'ทีมสอง')
assertEqual(teamRows[1]?.isOwnTeam, true)
assertEqual(teamRows[1]?.files.length, 1)
assertEqual(teamRows[2]?.teamName, 'ทีมสาม')
assertEqual(teamRows[2]?.isOwnTeam, false)
