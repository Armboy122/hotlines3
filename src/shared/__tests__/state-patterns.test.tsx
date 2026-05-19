/**
 * TypeScript assertion-style tests for state-pattern components.
 * Run: npx tsx src/shared/__tests__/state-patterns.test.tsx
 *
 * Tests: LoadingState, EmptyState, ErrorState, NoPermissionState
 * per Requirement D §D.8.
 */

import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'
import {
  LoadingState,
  EmptyState,
  ErrorState,
  NoPermissionState,
} from '../state-patterns'

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

// ── LOADING STATE ──────────────────────────────────────
console.log('LoadingState')

const loading = renderToStaticMarkup(
  React.createElement(LoadingState)
)
assert(loading.includes('animate-pulse'), 'loading should have animate-pulse')
assert(loading.includes('rounded'), 'loading skeleton should have rounded shape')

const loadingCustom = renderToStaticMarkup(
  React.createElement(LoadingState, { rows: 3 })
)
// Should render 3 skeleton rows
const matchCount = (loadingCustom.match(/animate-pulse/g) || []).length
assert(matchCount >= 3, 'loading with rows=3 should render at least 3 pulse elements')

// ── EMPTY STATE ────────────────────────────────────────
console.log('EmptyState')

const empty = renderToStaticMarkup(
  React.createElement(EmptyState, { message: 'ไม่มีข้อมูล' })
)
assert(
  empty.includes('ไม่มีข้อมูล'),
  'empty state should show message'
)
assert(
  empty.includes('text-center'),
  'empty state should be centered'
)

// ── ERROR STATE ────────────────────────────────────────
console.log('ErrorState')

const errorState = renderToStaticMarkup(
  React.createElement(ErrorState, {
    message: 'เกิดข้อผิดพลาด',
    onRetry: 'ลองอีกครั้ง',
  })
)
assert(
  errorState.includes('เกิดข้อผิดพลาด'),
  'error state should show message'
)
assert(
  errorState.includes('ลองอีกครั้ง'),
  'error state should show retry button text'
)
assert(
  errorState.includes('red') || errorState.includes('destructive'),
  'error state should use red/destructive color'
)

// ── NO-PERMISSION STATE ────────────────────────────────
console.log('NoPermissionState')

const noPerm = renderToStaticMarkup(
  React.createElement(NoPermissionState, {
    message: 'ไม่มีสิทธิ์เข้าถึง',
  })
)
assert(
  noPerm.includes('ไม่มีสิทธิ์เข้าถึง'),
  'no-permission state should show message'
)
assert(
  noPerm.includes('stone-400') || noPerm.includes('gray') || noPerm.includes('slate'),
  'no-permission state should use muted colors'
)

// ── SUMMARY ────────────────────────────────────────────
console.log(`\n${'='.repeat(50)}`)
console.log(`Results: ${passed} passed, ${failed} failed`)
if (failed > 0) {
  process.exit(1)
}
console.log('All tests passed!')
