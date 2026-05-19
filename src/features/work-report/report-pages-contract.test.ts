import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as assert from 'node:assert/strict'

const dailyPage = readFileSync(resolve(process.cwd(), 'src/app/(main)/daily-report/page.tsx'), 'utf8')
const workPage = readFileSync(resolve(process.cwd(), 'src/app/(main)/work-report/page.tsx'), 'utf8')
const workClient = readFileSync(resolve(process.cwd(), 'src/features/work-report/work-report-client.tsx'), 'utf8')

assert.match(dailyPage, /บันทึกงาน/, 'daily-report page must use Requirement C Thai title')
assert.match(dailyPage, /เลือกงานที่วางแผนไว้/, 'daily-report must expose planned-work source selection section')
assert.match(dailyPage, /viewer/, 'daily-report must branch viewer into read-only mode')
assert.doesNotMatch(dailyPage, /bg-gradient-to-br from-emerald|Hotline System/, 'daily-report shell must not use stale green/glass production styling')

assert.match(workPage, /WorkReportClient/, 'work-report route must render a dedicated report client')
assert.match(workClient, /รายงานการปฏิบัติงาน/, 'work-report title must use the confirmed Thai label')
assert.match(workClient, /md:hidden/, 'work-report mobile must render cards rather than squeezed tables')
assert.match(workClient, /hidden md:block/, 'work-report desktop table must be hidden on mobile')
assert.match(workClient, /viewer/, 'work-report must explicitly suppress viewer write/export actions')
assert.doesNotMatch(workClient, />\s*(ดาวน์โหลด|Export)\s*</, 'viewer-sensitive work-report scope must not introduce download/export UI')
assert.doesNotMatch(workClient, /Dashboard|\/list/, 'work-report must not resurrect Dashboard or legacy list concepts')

console.log('daily/work report page contract tests passed ✓')
