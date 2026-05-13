import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const navigationSource = readFileSync(resolve(process.cwd(), 'src/config/navigation.tsx'), 'utf8')
const navbarSource = readFileSync(resolve(process.cwd(), 'src/components/navbar.tsx'), 'utf8')
const homeSource = readFileSync(resolve(process.cwd(), 'src/app/(main)/page.tsx'), 'utf8')
const loginSource = readFileSync(resolve(process.cwd(), 'src/app/(auth)/login/page.tsx'), 'utf8')
const adminGuardSource = readFileSync(resolve(process.cwd(), 'src/lib/auth/admin-guard.tsx'), 'utf8')
const notFoundSource = readFileSync(resolve(process.cwd(), 'src/app/not-found.tsx'), 'utf8')
const mainErrorSource = readFileSync(resolve(process.cwd(), 'src/app/(main)/error.tsx'), 'utf8')

const planningIndex = navigationSource.indexOf('href: "/planning"')
const dailyReportIndex = navigationSource.indexOf('href: "/daily-report"')
const listIndex = navigationSource.indexOf('href: "/list"')

assert(planningIndex >= 0, 'mobile primary nav must keep planning/calendar as an explicit route')
assert(dailyReportIndex >= 0, 'task recording must move to a dedicated /daily-report route')
assert(planningIndex < dailyReportIndex, 'planning/work queue must be first before task recording')
assert(planningIndex < listIndex, 'planning/work queue must be first before historical report list')

assert(
  /mobileLabel:\s*"แผนงาน"/.test(navigationSource),
  'mobile planning label must say แผนงาน, not the vague ปฏิทิน label',
)
assert(
  !/mobileLabel:\s*"ปฏิทิน"/.test(navigationSource),
  'bottom navigation must not use the vague ปฏิทิน label for the primary work queue',
)
assert(
  /label:\s*"บันทึกงาน"/.test(navigationSource) && /mobileLabel:\s*"บันทึก"/.test(navigationSource),
  'daily report form must be labeled as a recording action, not the app home',
)

assert(
  /redirect\(['"]\/planning['"]\)/.test(homeSource),
  'root route must open the planning/work-queue page first',
)
assert(
  /router\.replace\(['"]\/planning['"]\)/.test(loginSource),
  'successful login/already-authenticated flow must land on the planning/work-queue page',
)
assert(
  !/router\.replace\(['"]\/['"]\)/.test(adminGuardSource),
  'admin guard fallback buttons must not route users back through the old root report form',
)
assert(
  /href=\"\/planning\"/.test(notFoundSource) && /href=\"\/planning\"/.test(mainErrorSource),
  'not-found and error recovery links must return users to planning/work queue',
)
assert(
  /gridTemplateColumns/.test(navbarSource),
  'mobile bottom nav must distribute visible items evenly instead of relying on oversized floating buttons',
)
assert(
  !/max-w-md/.test(navbarSource) && !/rounded-t-3xl/.test(navbarSource) && !/shadow-2xl/.test(navbarSource),
  'mobile bottom nav must not use the old floating rounded dock treatment',
)
assert(
  /aria-label=\"เมนูหลักมือถือ\"/.test(navbarSource),
  'mobile bottom nav must expose a clear Thai aria-label',
)

console.log('Mobile navigation UX tests passed ✓')
