// ============================================================
// Tests for planning-calendar view-model helpers
// TDD: RED first — these test the pure functions in planning-calendar.ts
// ============================================================

import {
  expandDateKeys,
  groupItemsByDateKey,
  countByType,
  getPlanningItemTypeLabel,
  type PlanningCalendarItem,
  type PlanningItemType,
} from './planning-calendar'

// ── expandDateKeys ──────────────────────────────────────────

function assert(condition: boolean, message?: string) {
  if (!condition) throw new Error(message || 'Assertion failed')
}

function assertEqual<T>(actual: T, expected: T, message?: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `${message || 'assertEqual failed'}: got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`
    )
  }
}

// Test: single day (endDate is null)
{
  const keys = expandDateKeys('2026-06-15', null)
  assertEqual(keys, ['2026-06-15'], 'single day should return one key')
}

// Test: single day (endDate equals startDate)
{
  const keys = expandDateKeys('2026-06-15', '2026-06-15')
  assertEqual(keys, ['2026-06-15'], 'same start/end should return one key')
}

// Test: multi-day range inclusive
{
  const keys = expandDateKeys('2026-06-14', '2026-06-16')
  assertEqual(keys, ['2026-06-14', '2026-06-15', '2026-06-16'], 'multi-day range should include all dates')
}

// Test: end before start returns empty
{
  const keys = expandDateKeys('2026-06-16', '2026-06-14')
  assertEqual(keys, [], 'end before start should return empty')
}

// Test: invalid date returns empty
{
  const keys = expandDateKeys('not-a-date', null)
  assertEqual(keys, [], 'invalid date should return empty')
}

// Test: month boundary crossing
{
  const keys = expandDateKeys('2026-06-29', '2026-07-02')
  assertEqual(keys, ['2026-06-29', '2026-06-30', '2026-07-01', '2026-07-02'], 'month boundary should be correct')
}

// ── groupItemsByDateKey ──────────────────────────────────────

function makeItem(overrides: Partial<PlanningCalendarItem> = {}): PlanningCalendarItem {
  return {
    id: 'test-1',
    type: 'team_plan',
    sourceId: 1,
    title: 'Test item',
    startDate: '2026-06-15',
    endDate: null,
    workTime: null,
    dateKeys: ['2026-06-15'],
    teamIds: [1],
    teams: [],
    locationText: null,
    electricArea: {
      peaId: null, peaName: null,
      operationCenterId: null, operationCenterName: null,
      feederId: null, feederCode: null,
      stationId: null, stationName: null,
    },
    status: 'active',
    source: { route: '/planning/team-plans/1' },
    actions: {
      canView: true, canEdit: false, canCancel: false,
      canUpload: false, canDownload: false, canStartDailyReport: false,
    },
    ...overrides,
  }
}

// Test: single item on single day
{
  const item = makeItem({ dateKeys: ['2026-06-15'] })
  const map = groupItemsByDateKey([item])
  assert(map.size === 1, 'should have one date entry')
  assertEqual(map.get('2026-06-15')!.length, 1, 'should have one item for date')
}

// Test: multi-day item appears under multiple dates
{
  const item = makeItem({ dateKeys: ['2026-06-14', '2026-06-15', '2026-06-16'] })
  const map = groupItemsByDateKey([item])
  assertEqual(map.size, 3, 'multi-day should span 3 dates')
  for (const key of ['2026-06-14', '2026-06-15', '2026-06-16']) {
    assert(map.has(key), `should have entry for ${key}`)
  }
}

// Test: multiple items on same date
{
  const item1 = makeItem({ id: 'tp-1', type: 'team_plan', dateKeys: ['2026-06-15'] })
  const item2 = makeItem({ id: 'mp-1', type: 'monthly_plan', dateKeys: ['2026-06-15'] })
  const map = groupItemsByDateKey([item1, item2])
  assertEqual(map.get('2026-06-15')!.length, 2, 'same date should have 2 items')
}

// Test: empty items returns empty map
{
  const map = groupItemsByDateKey([])
  assertEqual(map.size, 0, 'empty items should return empty map')
}

// ── countByType ──────────────────────────────────────────────

// Test: mixed types counted correctly
{
  const items = [
    makeItem({ id: '1', type: 'team_plan' }),
    makeItem({ id: '2', type: 'team_plan' }),
    makeItem({ id: '3', type: 'monthly_plan' }),
    makeItem({ id: '4', type: 'large_work' }),
  ]
  const counts = countByType(items)
  assertEqual(counts.team_plan, 2, 'team_plan count')
  assertEqual(counts.monthly_plan, 1, 'monthly_plan count')
  assertEqual(counts.large_work, 1, 'large_work count')
}

// Test: empty array returns zeros
{
  const counts = countByType([])
  assertEqual(counts.team_plan, 0)
  assertEqual(counts.monthly_plan, 0)
  assertEqual(counts.large_work, 0)
}

// ── getPlanningItemTypeLabel ─────────────────────────────────

// Test: Thai labels for each type
{
  assertEqual(getPlanningItemTypeLabel('team_plan'), 'แผนงานทีม', 'team_plan label')
  assertEqual(getPlanningItemTypeLabel('monthly_plan'), 'แผนเดือน', 'monthly_plan label')
  assertEqual(getPlanningItemTypeLabel('large_work'), 'งานระดมทีม', 'large_work label')
}

console.log('✅ All planning-calendar view-model tests passed')
