/**
 * TypeScript assertion-style tests for PageHeader component.
 * Run: npx tsx src/shared/__tests__/page-header.test.tsx
 */

import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'
import { PageHeader } from '../page-header'

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

// ── BASIC RENDER ───────────────────────────────────────
console.log('PageHeader — basic render')

const basic = renderToStaticMarkup(
  React.createElement(PageHeader, { title: 'วางแผนงาน' })
)
assert(basic.includes('วางแผนงาน'), 'should render title text')
assert(basic.includes('text-2xl'), 'title should use text-2xl')
assert(basic.includes('font-semibold'), 'title should be font-semibold')

// ── WITH DESCRIPTION ───────────────────────────────────
console.log('PageHeader — with description')

const withDesc = renderToStaticMarkup(
  React.createElement(PageHeader, {
    title: 'รายงานประจำวัน',
    description: 'สรุปผลการปฏิบัติงานรายวัน',
  })
)
assert(
  withDesc.includes('สรุปผลการปฏิบัติงานรายวัน'),
  'should render description'
)
assert(
  withDesc.includes('text-stone-500'),
  'description should use muted color'
)

// ── WITH ACTION BUTTON ─────────────────────────────────
console.log('PageHeader — with action')

const withAction = renderToStaticMarkup(
  React.createElement(PageHeader, {
    title: 'ผู้ติดต่อ',
    action: React.createElement('button', { className: 'btn-primary' }, 'เพิ่มผู้ติดต่อ'),
  })
)
assert(
  withAction.includes('เพิ่มผู้ติดต่อ'),
  'should render action button'
)

// ── RESPONSIVE LAYOUT ──────────────────────────────────
console.log('PageHeader — responsive layout')

const responsive = renderToStaticMarkup(
  React.createElement(PageHeader, { title: 'ทดสอบ' })
)
assert(
  responsive.includes('flex-col') || responsive.includes('flex'),
  'should use flex layout'
)
assert(
  responsive.includes('sm:flex-row') || responsive.includes('md:flex-row'),
  'should stack on mobile, row on desktop'
)

// ── SUMMARY ────────────────────────────────────────────
console.log(`\n${'='.repeat(50)}`)
console.log(`Results: ${passed} passed, ${failed} failed`)
if (failed > 0) {
  process.exit(1)
}
console.log('All tests passed!')
