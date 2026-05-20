import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const assert = (value: boolean, message: string) => {
  if (!value) throw new Error(message)
}

const activeRoutes = ['users', 'teams', 'capabilities', 'master-data', 'settings'] as const

for (const route of activeRoutes) {
  assert(
    existsSync(resolve(root, `src/app/(main)/admin/${route}/page.tsx`)),
    `/admin/${route} must have an active page in Admin round 1`,
  )
}

const adminPageSource = readFileSync(resolve(root, 'src/app/(main)/admin/page.tsx'), 'utf8')
const navigationSource = readFileSync(resolve(root, 'src/config/navigation.tsx'), 'utf8')

assert(navigationSource.includes('label: "จัดการระบบ"'), 'main navigation must keep one Admin entry label จัดการระบบ')
assert(!adminPageSource.includes('Audit'), '/admin overview must not expose Audit in round 1')
assert(!adminPageSource.includes('AUDIT_ROWS'), '/admin overview must not keep static audit rows')
assert(!adminPageSource.includes("id: 'audit'"), '/admin overview must not keep an audit tab')
assert(adminPageSource.includes('/admin/master-data'), '/admin overview must link active master-data route')
assert(adminPageSource.includes('/admin/settings'), '/admin overview must link active settings route')
