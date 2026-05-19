/**
 * TypeScript assertion-style tests for badge React components.
 * Run: npx tsx src/shared/__tests__/badge-components.test.ts
 *
 * Tests badge components via SSR rendering to verify correct labels and classes.
 */

import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'
import {
  SourceBadge,
  StatusBadge,
  RoleBadge,
  NoPermissionBadge,
} from '../badges'
import {
  PLANNING_STATUS_LABELS,
  PLANNING_SOURCE_LABELS,
  ROLE_LABELS,
  NO_PERMISSION_LABEL,
  type SemanticStatus,
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

// ── SOURCE BADGE ───────────────────────────────────────
console.log('SourceBadge')

const teamHtml = renderToStaticMarkup(
  React.createElement(SourceBadge, { source: 'team_plan' })
)
assert(
  teamHtml.includes(PLANNING_SOURCE_LABELS.team_plan),
  'team_plan badge should contain Thai label'
)
assert(
  teamHtml.includes('rounded-full'),
  'team_plan badge should be rounded-full'
)

const monthlyHtml = renderToStaticMarkup(
  React.createElement(SourceBadge, { source: 'monthly_plan' })
)
assert(
  monthlyHtml.includes(PLANNING_SOURCE_LABELS.monthly_plan),
  'monthly_plan badge should contain Thai label'
)

const extraClassHtml = renderToStaticMarkup(
  React.createElement(SourceBadge, { source: 'team_plan', className: 'extra-cls' })
)
assert(
  extraClassHtml.includes('extra-cls'),
  'badge should pass through extra className'
)

// ── STATUS BADGE ───────────────────────────────────────
console.log('StatusBadge')

const completedHtml = renderToStaticMarkup(
  React.createElement(StatusBadge, { status: 'completed' })
)
assert(
  completedHtml.includes(PLANNING_STATUS_LABELS.completed),
  'completed badge should contain Thai label'
)

const customLabelHtml = renderToStaticMarkup(
  React.createElement(StatusBadge, { status: 'completed', label: 'Custom' })
)
assert(
  customLabelHtml.includes('Custom'),
  'custom label override should work'
)

const allStatuses: SemanticStatus[] = [
  'waiting', 'scheduled', 'in_progress', 'completed', 'cancelled',
  'draft', 'read_only',
]
for (const s of allStatuses) {
  const html = renderToStaticMarkup(
    React.createElement(StatusBadge, { status: s })
  )
  assert(html.includes('rounded-full'), `${s} badge should be rounded-full`)
}

// ── ROLE BADGE ─────────────────────────────────────────
console.log('RoleBadge')

const teamLeadHtml = renderToStaticMarkup(
  React.createElement(RoleBadge, { role: 'team_lead' })
)
assert(
  teamLeadHtml.includes(ROLE_LABELS.team_lead),
  'team lead badge should contain Thai role label'
)

const roles = Object.keys(ROLE_LABELS) as Array<keyof typeof ROLE_LABELS>
for (const r of roles) {
  const html = renderToStaticMarkup(
    React.createElement(RoleBadge, { role: r })
  )
  assert(html.includes('rounded-full'), `${r} role badge should be rounded-full`)
}

// ── NO-PERMISSION BADGE ────────────────────────────────
console.log('NoPermissionBadge')

const noPermHtml = renderToStaticMarkup(
  React.createElement(NoPermissionBadge, null)
)
assert(
  noPermHtml.includes(NO_PERMISSION_LABEL),
  'no-permission badge should contain default Thai label'
)

const customNoPerm = renderToStaticMarkup(
  React.createElement(NoPermissionBadge, { label: 'Custom No' })
)
assert(
  customNoPerm.includes('Custom No'),
  'no-permission badge should accept custom label'
)

// ── SUMMARY ────────────────────────────────────────────
console.log(`\n${'='.repeat(50)}`)
console.log(`Results: ${passed} passed, ${failed} failed`)
if (failed > 0) {
  process.exit(1)
}
console.log('All tests passed!')
