/**
 * TypeScript assertion-style tests for shared badge components.
 * Run: npx tsx src/shared/__tests__/badges.test.ts
 *
 * Tests badge utility functions (getBadgeClass, getSourceBadgeClass, etc.)
 * without rendering React components — pure function tests.
 */

import {
  getBadgeClass,
  getSourceBadgeClass,
  getRoleBadgeClass,
  NO_PERMISSION_BADGE_CLASS,
} from '../badge-utils'

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

// ── STATUS BADGE ───────────────────────────────────────
console.log('getBadgeClass — status badges')

const completedClass = getBadgeClass('completed')
assert(completedClass.includes('green'), 'completed badge should include green')
assert(completedClass.includes('rounded'), 'badge should be rounded')

const waitingClass = getBadgeClass('waiting')
assert(waitingClass.includes('amber'), 'waiting badge should include amber')

const inProgressClass = getBadgeClass('in_progress')
assert(inProgressClass.includes('blue'), 'in_progress badge should include blue')

const cancelledClass = getBadgeClass('cancelled')
assert(cancelledClass.includes('red'), 'cancelled badge should include red')

const readOnlyClass = getBadgeClass('read_only')
assert(readOnlyClass.includes('slate'), 'read_only badge should include slate')

// ── SOURCE BADGE ───────────────────────────────────────
console.log('getSourceBadgeClass — source badges')

const teamPlanClass = getSourceBadgeClass('team_plan')
assert(teamPlanClass.includes('blue'), 'team_plan badge should include blue')

const monthlyPlanClass = getSourceBadgeClass('monthly_plan')
assert(monthlyPlanClass.includes('teal'), 'monthly_plan badge should include teal')

// ── ROLE BADGE ─────────────────────────────────────────
console.log('getRoleBadgeClass — role badges')

const adminClass = getRoleBadgeClass('super_admin')
assert(adminClass.includes('blue'), 'super_admin badge should include blue')

const teamLeadClass = getRoleBadgeClass('team_lead')
assert(teamLeadClass.includes('blue'), 'team_lead badge should use redesign blue, not stale emerald')

const userClass = getRoleBadgeClass('user')
assert(userClass.includes('slate'), 'user badge should include slate')

const viewerClass = getRoleBadgeClass('viewer')
assert(viewerClass.includes('gray'), 'viewer badge should include gray')

// ── NO-PERMISSION BADGE ────────────────────────────────
console.log('NO_PERMISSION_BADGE_CLASS')

assert(
  NO_PERMISSION_BADGE_CLASS.includes('gray'),
  'no-permission badge should include gray'
)
assert(
  NO_PERMISSION_BADGE_CLASS.includes('cursor-not-allowed'),
  'no-permission badge should be cursor-not-allowed'
)

// ── SUMMARY ────────────────────────────────────────────
console.log(`\n${'='.repeat(50)}`)
console.log(`Results: ${passed} passed, ${failed} failed`)
if (failed > 0) {
  process.exit(1)
}
console.log('All tests passed!')
