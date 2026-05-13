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
  /ดูการปฏิบัติงานของทีมทั้งหมด/.test(alwaysVisibleSource),
  'large-work operations CTA must be visible on the card before expanding the overview panel',
)
assert(
  /useSearchParams/.test(pageSource) && /view.*operations/.test(pageSource) && /setOperationsItem/.test(pageSource),
  'planning page must open the large-work operations view naturally from a route query after users create or update a large-work card',
)
assert(
  /แจกจ่าย\/แก้ไขจุดงาน/.test(alwaysVisibleSource),
  'large-work assignment CTA must remain visible as a separate card action before expanding the overview panel',
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

const serviceSource = readFileSync(resolve(process.cwd(), 'src/lib/services/planning-calendar.service.ts'), 'utf8')
assert(
  /large_work[\s\S]*`\/planning\?largeWorkId=\$\{sourceId\}&view=operations`/.test(serviceSource),
  'large-work calendar cards must link directly to the operations view instead of a generic planning route',
)

const boardSource = readFileSync(resolve(process.cwd(), 'src/features/large-work/components/LargeWorkPlanningBoard.tsx'), 'utf8')
assert(
  /<select[\s\S]*ทีมที่มอบหมาย/.test(boardSource) || /ทีมที่มอบหมาย[\s\S]*<select/.test(boardSource),
  'planning board must include a plain team dropdown fallback for mobile assignment without drag/drop',
)
assert(
  !/card\.assignedTeamId === null \?/.test(boardSource),
  'planning board team dropdown fallback must remain available after a card is assigned',
)
assert(
  /สร้างการ์ดงาน/.test(boardSource) && /ตำแหน่งหน้างาน/.test(boardSource) && /กรอก lat,long เอง/.test(boardSource) && /รายละเอียดหน้างาน/.test(boardSource),
  'planning board must include plain add-card, location, manual lat/long, and work-detail fields',
)
assert(
  !/ชื่อจุด\/ป้ายจุด/.test(boardSource) && !/ประเภทงาน/.test(boardSource) && !/จำนวนจุด/.test(boardSource) && !/หมายเหตุ/.test(boardSource),
  'planning board lite form must hide point label, work type, counts, and separate notes fields',
)
assert(
  /รูปหน้างาน[\s\S]*คิวงานของทีม/.test(boardSource),
  'planning board before-photo copy must tell owners that photos are shown to teams in the worker queue',
)
const hydrationKeyStart = boardSource.indexOf('const nextHydratedTasksKey')
const hydrationKeyEnd = boardSource.indexOf('if (hydratedTasksKey === nextHydratedTasksKey)', hydrationKeyStart)
assert(
  hydrationKeyStart >= 0 && hydrationKeyEnd > hydrationKeyStart && /beforePhotoUrls/.test(boardSource.slice(hydrationKeyStart, hydrationKeyEnd)),
  'planning board hydration key must include beforePhotoUrls so reopening the board preserves and refreshes existing before photos',
)

console.log('All large-work card action tests passed ✓')
