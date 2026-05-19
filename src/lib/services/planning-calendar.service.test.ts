import { strict as assert } from 'node:assert'
import { normalizeCalendarResponse } from './planning-calendar.service'

const apiShape = normalizeCalendarResponse({
  from: '2026-05-01',
  to: '2026-05-31',
  items: [
    {
      sourceType: 'team_plan',
      sourceId: 42,
      title: 'Inspect transformer',
      team: { id: 7, name: 'ทีม A' },
      workTime: '09:00-12:00',
      location: 'สถานี 1',
      status: 'planned',
      dateRange: { startDate: '2026-05-10', endDate: null },
      actions: { canEdit: true, canDelete: false, canCancel: true, canDownload: true, canStartDailyReport: false },
    },
  ],
  summary: { total: 1, byType: { team_plan: 1, monthly_plan: 0, large_work: 0 } },
})

assert.equal(apiShape.items.length, 1, 'normalized API shape should preserve returned items')
assert.equal(apiShape.summary.total, 1, 'normalized API shape should keep total count')
assert.equal(apiShape.items[0].dateKeys[0], '2026-05-10', 'normalized API item should keep its date key')
assert.equal(apiShape.items[0].source.route, '/planning?teamPlanId=42', 'team_plan route should remain intact')

const backendShape = normalizeCalendarResponse({
  monthStart: '2026-05-01',
  monthEnd: '2026-05-31',
  days: [
    {
      date: '2026-05-10',
      items: [
        {
          sourceType: 'large_work',
          sourceId: 99,
          title: 'Emergency response',
          teams: [{ id: 8, name: 'ทีม B' }],
          workTime: null,
          location: 'จุดซ่อม',
          status: 'planned',
          dateRange: { startDate: '2026-05-10', endDate: '2026-05-11' },
          actions: { canEdit: false, canDelete: true, canCancel: true, canDownload: false, canStartDailyReport: true },
        },
      ],
    },
  ],
})

assert.equal(backendShape.items.length, 1, 'backend days shape should still normalize into one item')
assert.equal(backendShape.items[0].dateKeys.length, 1, 'backend days shape should keep the provided day key')
assert.equal(backendShape.items[0].dateKeys[0], '2026-05-10', 'backend days shape should use the day bucket, not the raw date range')
assert.equal(backendShape.items[0].actions.canStartDailyReport, true, 'backend days shape should preserve explicit action flags')
assert.equal(backendShape.summary.byType.large_work, 1, 'backend days shape should count item type')

const rangedApiShape = normalizeCalendarResponse({
  from: '2026-05-01',
  to: '2026-05-31',
  items: [
    {
      sourceType: 'monthly_plan',
      sourceId: 55,
      title: 'Month coverage',
      dateRange: { startDate: '2026-05-10', endDate: '2026-05-12' },
      actions: {},
    },
  ],
})

assert.deepEqual(
  rangedApiShape.items[0].dateKeys,
  ['2026-05-10', '2026-05-11', '2026-05-12'],
  'top-level items shape should expand date ranges when day buckets are absent',
)

console.log('✅ planning-calendar service normalization tests passed')
