import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const pageSource = readFileSync(resolve(process.cwd(), 'src/app/(main)/planning/page.tsx'), 'utf8')
const cardStart = pageSource.indexOf('function LargeWorkCard')
const cardEnd = pageSource.indexOf('function Meta', cardStart)

assert(cardStart >= 0 && cardEnd > cardStart, 'LargeWorkCard source must be discoverable')

const cardSource = pageSource.slice(cardStart, cardEnd)
const expandedGateIndex = cardSource.indexOf('{expanded &&')
const alwaysVisibleSource = expandedGateIndex >= 0 ? cardSource.slice(0, expandedGateIndex) : cardSource

assert(
  /แจกจ่ายงานให้ทีม|เปิดโต๊ะวางแผนงาน/.test(alwaysVisibleSource),
  'large-work mobile assignment CTA must be visible on the card before expanding the overview panel',
)

assert(
  /min-h-\[44px\]|min-h-11|h-11/.test(alwaysVisibleSource),
  'large-work assignment CTA must keep a mobile tap target of at least 44px',
)

assert(
  /assignBlockedReason/.test(alwaysVisibleSource) &&
    /งานเสร็จสิ้นแล้ว ไม่สามารถแจกจ่ายงานเพิ่มได้/.test(pageSource) &&
    /งานถูกยกเลิกแล้ว ไม่สามารถแจกจ่ายงานได้/.test(pageSource),
  'completed/cancelled large-work cards must show a clear Thai reason instead of opening assignment',
)

const boardSource = readFileSync(resolve(process.cwd(), 'src/features/large-work/components/LargeWorkPlanningBoard.tsx'), 'utf8')
assert(
  /<select[\s\S]*ทีมที่มอบหมาย/.test(boardSource) || /ทีมที่มอบหมาย[\s\S]*<select/.test(boardSource),
  'planning board must include a plain team dropdown fallback for mobile assignment without drag/drop',
)
assert(
  /สร้างการ์ดงาน/.test(boardSource) && /ชื่อจุด\/ป้ายจุด/.test(boardSource) && /รายละเอียดงาน/.test(boardSource),
  'planning board must include plain add-card, point, and work-detail form fields',
)

console.log('All large-work card action tests passed ✓')
