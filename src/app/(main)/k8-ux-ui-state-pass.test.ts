import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const read = (path: string) => readFileSync(resolve(root, path), 'utf8')
const assert = (value: boolean, message: string) => {
  if (!value) throw new Error(message)
}

const planningPage = read('src/app/(main)/planning/page.tsx')
const monthlyPlanPage = read('src/app/(main)/monthly-plan/page.tsx')
const contactsPage = read('src/app/(main)/contacts/page.tsx')
const adminShell = read('src/components/pages/admin/admin-shell.tsx')
const adminPage = read('src/app/(main)/admin/page.tsx')
const adminUsers = read('src/components/pages/admin/users-client.tsx')
const adminCapabilities = read('src/components/pages/admin/capabilities-client.tsx')
const adminMaster = read('src/components/pages/admin/admin-master-data-client.tsx')
const adminSettings = read('src/components/pages/admin/admin-settings-client.tsx')
const routePolicy = read('src/lib/auth/role-policy.ts')

const criticalSources = [
  ['planning', planningPage],
  ['monthly-plan', monthlyPlanPage],
  ['contacts', contactsPage],
  ['admin-shell', adminShell],
  ['admin-hub', adminPage],
  ['admin-users', adminUsers],
  ['admin-capabilities', adminCapabilities],
  ['admin-master-data', adminMaster],
  ['admin-settings', adminSettings],
] as const

for (const [name, source] of criticalSources) {
  assert(!/\b(?:demo|Demo|mock|Mock|fake|Fake)\b/.test(source), `${name} must not expose demo/mock/fake production copy or static fake rows`)
  assert(!/เครดิต|credit/i.test(source), `${name} must not expose production credit copy`)
}

for (const [name, source] of [
  ['planning', planningPage],
  ['monthly-plan', monthlyPlanPage],
  ['contacts', contactsPage],
  ['admin-users', adminUsers],
  ['admin-capabilities', adminCapabilities],
  ['admin-master-data', adminMaster],
] as const) {
  assert(/กำลังโหลด|loading/i.test(source), `${name} must expose loading state`)
  assert(/ยังไม่มี|ไม่พบ/.test(source), `${name} must expose empty/no-result state`)
  assert(/เกิดข้อผิดพลาด|ไม่สำเร็จ|ลองใหม่/.test(source), `${name} must expose error/retry state`)
  assert(/สำเร็จ|toast\.success/.test(source), `${name} must expose success feedback`)
  assert(/min-h-11|h-11|h-12/.test(source), `${name} must keep mobile touch targets at least 44px`)
}

assert(/กำลังโหลด|loading/i.test(adminSettings), 'admin-settings must expose loading state')
assert(/เกิดข้อผิดพลาด|ไม่สำเร็จ|ลองใหม่/.test(adminSettings), 'admin-settings must expose error/retry state')
assert(/สำเร็จ|toast\.success/.test(adminSettings), 'admin-settings must expose success feedback')
assert(/min-h-11|h-11|h-12/.test(adminSettings), 'admin-settings must keep mobile touch targets at least 44px')

assert(adminShell.includes('overflow-x-auto'), 'admin subnav must avoid 320px overflow with horizontal scroll')
assert(adminShell.includes('shrink-0'), 'admin subnav items must not squeeze on narrow viewports')
assert(adminPage.includes('sm:grid-cols-2') && adminPage.includes('xl:grid-cols-3'), 'admin hub cards must be single column on mobile and responsive on larger widths')
assert(routePolicy.includes("if (normalized === '/admin/settings'"), 'round-1 admin settings route must be active')
assert(!routePolicy.includes("normalized === '/admin/audit'"), 'round-1 admin audit route must not be active')
assert(!routePolicy.includes("normalized === '/admin/monthly-plan'"), 'legacy admin monthly-plan route must not be active')

assert(
  new RegExp('ลบงาน[^`]*\\$\\{item\\.title\\}[^`]*ไม่สามารถย้อนกลับ|ไม่สามารถย้อนกลับ[^`]*\\$\\{item\\.title\\}').test(planningPage),
  'planning delete confirmation must name the work item and irreversible consequence in Thai',
)
assert(
  new RegExp("ลบแผนทีม[^']*ไม่สามารถย้อนกลับ|ไม่สามารถย้อนกลับ[^']*ลบแผนทีม").test(monthlyPlanPage),
  'monthly plan team delete confirmation must explain irreversible consequence in Thai',
)
assert(
  new RegExp("ลบไฟล์อนุมัติ[^']*ไม่สามารถย้อนกลับ|ไม่สามารถย้อนกลับ[^']*ลบไฟล์อนุมัติ").test(monthlyPlanPage),
  'monthly plan approved-file delete confirmation must explain irreversible consequence in Thai',
)
