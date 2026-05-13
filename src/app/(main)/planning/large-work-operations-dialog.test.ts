import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const pagePath = resolve(process.cwd(), 'src/app/(main)/planning/page.tsx')
const dialogPath = resolve(process.cwd(), 'src/features/large-work/components/LargeWorkOperationsDialog.tsx')
const pageSource = readFileSync(pagePath, 'utf8')

assert(existsSync(dialogPath), 'LargeWorkOperationsDialog.tsx must exist')

const dialogSource = readFileSync(dialogPath, 'utf8')
const cardStart = pageSource.indexOf('function LargeWorkCard')
const cardEnd = pageSource.indexOf('function Meta', cardStart)
assert(cardStart >= 0 && cardEnd > cardStart, 'LargeWorkCard source must be discoverable')
const cardSource = pageSource.slice(cardStart, cardEnd)

assert(
  /ดูการปฏิบัติงานของทีมทั้งหมด/.test(cardSource),
  'LargeWorkCard must expose the owner operations primary action in Thai',
)
assert(
  /แจกจ่าย\/แก้ไขจุดงาน/.test(cardSource),
  'LargeWorkCard must keep planning-board assignment as a separate action',
)
assert(
  /onOpenOperations/.test(cardSource) && /onManageTasks/.test(cardSource),
  'LargeWorkCard must wire separate handlers for operations and planning-board actions',
)
assert(
  /LargeWorkOperationsDialog/.test(pageSource) && /operationsItem/.test(pageSource),
  'planning page must mount LargeWorkOperationsDialog with selected item state',
)
assert(
  /useLargeWorkTasks\(open \? item\.id : undefined\)/.test(dialogSource),
  'operations dialog must load task cards with useLargeWorkTasks(item.id) only while open',
)
assert(
  /useLargeWorkOverview\(open \? item\.id : undefined\)/.test(dialogSource),
  'operations dialog must load overview with useLargeWorkOverview(item.id) only while open',
)
assert(
  /groupTasksByTeam/.test(dialogSource) && /activeTeamRows/.test(dialogSource),
  'operations dialog must reuse operations-view helpers for grouped teams and active rows',
)
assert(
  /buildGoogleMapsSearchUrl/.test(dialogSource) && /buildGoogleMapsDirectionsUrl/.test(dialogSource),
  'operations dialog must use Google Maps helper URLs only',
)
assert(
  /beforePhotoUrls/.test(dialogSource) && /afterPhotoUrls/.test(dialogSource),
  'operations dialog must show before and after photo thumbnails when present',
)
assert(
  !/startedByUserId|completedByUserId|displayName|username/.test(dialogSource),
  'operations dialog must not show worker/person names',
)
assert(
  /min-h-\[44px\]|min-h-11|h-11/.test(cardSource) && /min-h-\[44px\]|min-h-11|h-11/.test(dialogSource),
  'operations actions must preserve mobile tap targets of at least 44px',
)

assert(
  /group\.tasks\.length === 0/.test(dialogSource) && /ยังไม่มีจุดงานที่มอบหมายให้ทีมนี้/.test(dialogSource),
  'operations dialog must render a Thai empty lane for participating teams with zero assigned task cards',
)

console.log('All large-work operations dialog tests passed ✓')
