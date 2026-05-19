/**
 * TypeScript assertion-style tests for design tokens.
 * Run: npx tsx src/shared/__tests__/design-tokens.test.ts
 */

import {
  STATUS_COLORS,
  SOURCE_COLORS,
  ROLE_COLORS,
  PLANNING_STATUS_LABELS,
  PLANNING_SOURCE_LABELS,
  type PlanningStatus,
  type PlanningSource,
  getStatusColor,
  getSourceColor,
  getRoleBadgeStyle,
  NO_PERMISSION_LABEL,
} from '../design-tokens'

let passed = 0
let failed = 0

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++
  } else {
    failed++
    console.error(`  FAIL: ${message}`)
  }
}

// ── STATUS COLORS ──────────────────────────────────────
console.log('STATUS_COLORS')

assert(
  STATUS_COLORS.completed === 'green',
  'completed status should be green'
)
assert(
  STATUS_COLORS.draft === 'amber',
  'draft status should be amber'
)
assert(
  STATUS_COLORS.in_progress === 'blue',
  'in_progress status should be blue'
)
assert(
  STATUS_COLORS.cancelled === 'red',
  'cancelled status should be red'
)
assert(
  STATUS_COLORS.read_only === 'slate',
  'read_only status should be slate'
)

// ── SOURCE COLORS ──────────────────────────────────────
console.log('SOURCE_COLORS')

assert(
  SOURCE_COLORS.team_plan === 'blue',
  'team_plan source should be blue'
)
assert(
  SOURCE_COLORS.monthly_plan === 'teal',
  'monthly_plan source should be teal'
)

// ── ROLE COLORS ────────────────────────────────────────
console.log('ROLE_COLORS')

assert(ROLE_COLORS.super_admin === 'blue', 'super_admin should be blue')
assert(ROLE_COLORS.team_lead === 'blue', 'team_lead should use redesign blue, not stale emerald')
assert(ROLE_COLORS.user === 'slate', 'user should be slate')
assert(ROLE_COLORS.viewer === 'gray', 'viewer should be gray')

// ── THAI LABELS ────────────────────────────────────────
console.log('PLANNING_STATUS_LABELS')

assert(
  PLANNING_STATUS_LABELS.waiting === 'รอวางแผน',
  'waiting label should be รอวางแผน'
)
assert(
  PLANNING_STATUS_LABELS.scheduled === 'กำหนดวันแล้ว',
  'scheduled label should be กำหนดวันแล้ว'
)
assert(
  PLANNING_STATUS_LABELS.in_progress === 'กำลังทำ',
  'in_progress label should be กำลังทำ'
)
assert(
  PLANNING_STATUS_LABELS.completed === 'เสร็จแล้ว',
  'completed label should be เสร็จแล้ว'
)

console.log('PLANNING_SOURCE_LABELS')

assert(
  PLANNING_SOURCE_LABELS.team_plan === 'งานแผนของทีม',
  'team_plan source label should be งานแผนของทีม'
)
assert(
  PLANNING_SOURCE_LABELS.monthly_plan === 'งานจากแผนเดือน',
  'monthly_plan source label should be งานจากแผนเดือน'
)

// ── HELPER FUNCTIONS ───────────────────────────────────
console.log('getStatusColor')

assert(
  getStatusColor('completed') === STATUS_COLORS.completed,
  'getStatusColor returns correct color for known status'
)

console.log('getSourceColor')

assert(
  getSourceColor('team_plan') === SOURCE_COLORS.team_plan,
  'getSourceColor returns correct color for team_plan'
)

console.log('getRoleBadgeStyle')

const adminStyle = getRoleBadgeStyle('super_admin')
assert(
  adminStyle.includes('blue'),
  'super_admin badge style should contain blue'
)

console.log('NO_PERMISSION_LABEL')

assert(
  NO_PERMISSION_LABEL === 'ไม่มีสิทธิ์',
  'NO_PERMISSION_LABEL should be ไม่มีสิทธิ์'
)

// ── TYPE SAFETY ────────────────────────────────────────
console.log('Type safety')

// These should compile; if they don't, tsc catches it.
const _status: PlanningStatus = 'completed'
const _source: PlanningSource = 'team_plan'
assert(!!_status, 'PlanningStatus type accepts valid value')
assert(!!_source, 'PlanningSource type accepts valid value')

// ── SUMMARY ────────────────────────────────────────────
console.log(`\n${'='.repeat(50)}`)
console.log(`Results: ${passed} passed, ${failed} failed`)
if (failed > 0) {
  process.exit(1)
}
console.log('All tests passed!')
