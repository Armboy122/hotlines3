/**
 * TypeScript assertion-style tests for ResponsiveTableCard component.
 * Run: npx tsx src/shared/__tests__/responsive-table-card.test.tsx
 */

import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'
import { ResponsiveTableCard } from '../responsive-table-card'

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

// ── BASIC RENDER WITH DATA ─────────────────────────────
console.log('ResponsiveTableCard — basic render with data')

const columns = [
  { key: 'name', header: 'ชื่อ' },
  { key: 'status', header: 'สถานะ' },
]
const data = [
  { id: '1', name: 'งาน A', status: 'เสร็จแล้ว' },
  { id: '2', name: 'งาน B', status: 'กำลังทำ' },
]

const basic = renderToStaticMarkup(
  React.createElement(ResponsiveTableCard, {
    columns,
    data,
    cardLabelKey: 'name',
  })
)
assert(basic.includes('งาน A'), 'should render data row 1')
assert(basic.includes('งาน B'), 'should render data row 2')
assert(basic.includes('ชื่อ'), 'should render column header')
assert(basic.includes('สถานะ'), 'should render column header')

// ── RESPONSIVE: hidden table on mobile, hidden cards on desktop ─
console.log('ResponsiveTableCard — responsive hiding')

assert(
  basic.includes('hidden lg:block') || basic.includes('lg:block'),
  'table should be hidden on mobile/tablet, visible on desktop'
)
assert(
  basic.includes('lg:hidden') || basic.includes('block lg:hidden'),
  'cards should be visible on mobile/tablet, hidden on desktop'
)

// ── EMPTY STATE ────────────────────────────────────────
console.log('ResponsiveTableCard — empty state')

const empty = renderToStaticMarkup(
  React.createElement(ResponsiveTableCard, {
    columns,
    data: [],
    emptyMessage: 'ไม่มีข้อมูล',
    cardLabelKey: 'name',
  })
)
assert(
  empty.includes('ไม่มีข้อมูล'),
  'should render empty message when data is empty'
)

// ── SUMMARY ────────────────────────────────────────────
console.log(`\n${'='.repeat(50)}`)
console.log(`Results: ${passed} passed, ${failed} failed`)
if (failed > 0) {
  process.exit(1)
}
console.log('All tests passed!')
