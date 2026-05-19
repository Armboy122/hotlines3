import { existsSync, readFileSync } from 'node:fs'
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
const workReportRoutePath = resolve(process.cwd(), 'src/app/(main)/work-report/page.tsx')
const legacyListRoutePath = resolve(process.cwd(), 'src/app/(main)/list/page.tsx')
const legacyDashboardRoutePath = resolve(process.cwd(), 'src/app/(main)/admin/dashboard/page.tsx')

const planningIndex = navigationSource.indexOf('href: "/planning"')
const dailyReportIndex = navigationSource.indexOf('href: "/daily-report"')
const listIndex = navigationSource.indexOf('href: "/list"')
const workReportIndex = navigationSource.indexOf('href: "/work-report"')

assert(planningIndex >= 0, 'mobile primary nav must keep planning/calendar as an explicit route')
assert(dailyReportIndex >= 0, 'task recording must move to a dedicated /daily-report route')
assert(workReportIndex >= 0, 'Requirement B nav must include /work-report for รายงานการปฏิบัติงาน')
assert(existsSync(workReportRoutePath), 'Requirement B /work-report route must exist before linking it in nav')
assert(!existsSync(legacyListRoutePath), 'Requirement B/C must remove the legacy /list route and use /work-report instead')
assert(!existsSync(legacyDashboardRoutePath), 'Requirement B/C/D must remove the legacy Dashboard route from the redesigned app')
assert(listIndex === -1, 'Requirement B nav must not expose the legacy /list route')
assert(planningIndex < dailyReportIndex, 'planning/work queue must be first before task recording')
assert(dailyReportIndex < workReportIndex, 'daily-report must appear before work-report in Requirement B nav order')

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
  /grid-cols-5/.test(navbarSource) && /เมนูเพิ่มเติม/.test(navbarSource),
  'mobile/tablet bottom nav must keep five stable slots and move overflow routes into More',
)
assert(
  !/max-w-md/.test(navbarSource) && !/rounded-t-3xl/.test(navbarSource) && !/shadow-2xl/.test(navbarSource),
  'mobile bottom nav must not use the old floating rounded dock treatment',
)
assert(
  /aria-label=\"เมนูหลักมือถือและแท็บเล็ต\"/.test(navbarSource),
  'mobile/tablet bottom nav must expose a clear Thai aria-label',
)
assert(
  !/emerald|glass|backdrop-blur|text-gradient-green/.test(navbarSource + navigationSource),
  'redesign navigation foundation must not use stale green/glassmorphism classes',
)

console.log('Mobile navigation UX tests passed ✓')
