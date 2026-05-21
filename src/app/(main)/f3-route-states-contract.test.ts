import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'

const root = process.cwd()
const read = (path: string) => readFileSync(resolve(root, path), 'utf8')

const largeWorkPage = read('src/app/(main)/large-work/page.tsx')
const workReportClient = read('src/features/work-report/work-report-client.tsx')
const contactsPage = read('src/app/(main)/contacts/page.tsx')

assert.match(
  largeWorkPage,
  /const canShowReliableLargeWorkStats = !largeWorksQuery\.isLoading && !largeWorksQuery\.isError && largeWorksQuery\.data != null/,
  '/large-work summary counters must be gated by successful backend data before showing zeros',
)
assert.match(
  largeWorkPage,
  /StatCard label="งานในเดือนนี้" value=\{canShowReliableLargeWorkStats \? items\.length : '—'\}/,
  '/large-work total count must render unavailable instead of 0 while loading/error/missing data',
)

assert.match(
  workReportClient,
  /const canShowReliableReportSummary = !isLoading && !isError && data != null/,
  '/work-report summary counters must be gated by successful report data',
)
assert.match(
  workReportClient,
  /SummaryCard label="บันทึกทั้งหมด" value=\{canShowReliableReportSummary \? summary\.total : '—'\}/,
  '/work-report summary must not present zero totals while report API is loading or failed',
)

assert.match(
  contactsPage,
  /const canShowReliableContactStats = !isLoading && !isError && contacts != null/,
  '/contacts summary counters must distinguish unavailable API data from true empty data',
)
assert.match(
  contactsPage,
  /StatCard label="รายชื่อทั้งหมด" value=\{canShowReliableContactStats \? visibleContacts\.length : '—'\}/,
  '/contacts total count must render unavailable instead of 0 while loading/error/missing data',
)
assert.doesNotMatch(
  contactsPage,
  /รายการโปรด\/ใช้บ่อย[\s\S]*?<Star[\s\S]*?>0</,
  '/contacts must not ship a static favorites zero that looks authoritative without backend truth',
)
assert.match(
  contactsPage,
  /โหลดข้อมูลไม่ได้|กำลังโหลดข้อมูล/,
  '/contacts status card must disclose loading/error instead of always saying ready',
)

console.log('F3 route state contract tests passed ✓')
