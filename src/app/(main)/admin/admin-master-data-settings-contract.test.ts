import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const assert = (value: boolean, message: string) => {
  if (!value) throw new Error(message)
}

const read = (path: string) => readFileSync(resolve(root, path), 'utf8')

const masterPageSource = read('src/app/(main)/admin/master-data/page.tsx')
const settingsPageSource = read('src/app/(main)/admin/settings/page.tsx')
const masterClientSource = read('src/components/pages/admin/admin-master-data-client.tsx')
const settingsClientSource = read('src/components/pages/admin/admin-settings-client.tsx')
const adminShellSource = read('src/components/pages/admin/admin-shell.tsx')

const requiredMasterGroups = [
  'job-types',
  'job-details',
  'feeders',
  'stations',
  'peas',
  'operation-centers',
] as const

for (const group of requiredMasterGroups) {
  assert(masterClientSource.includes(`id: '${group}'`), `/admin/master-data must group ${group}`)
}

assert(masterPageSource.includes('AdminMasterDataClient'), '/admin/master-data must render backend-backed master data client')
assert(!masterClientSource.includes('การแก้ไขข้อมูลจริงต้องใช้ backend-backed UI'), 'master-data page must not keep placeholder copy')
assert(masterClientSource.includes('useMutation'), 'master-data grouped CRUD must use mutations for create/update/delete')
assert(masterClientSource.includes('queryClient.invalidateQueries'), 'master-data mutations must refresh backend query data')
assert(masterClientSource.includes('Dialog'), 'master-data CRUD must use mobile-safe dialog/sheet UI')
assert(masterClientSource.includes('กำลังโหลดข้อมูลหลัก'), 'master-data must expose Thai loading state')
assert(masterClientSource.includes('ยังไม่มีข้อมูล'), 'master-data must expose Thai empty state')
assert(masterClientSource.includes('เกิดข้อผิดพลาด'), 'master-data must expose Thai error state')
assert(masterClientSource.includes('บันทึกสำเร็จ'), 'master-data must expose Thai success state')
assert(masterClientSource.includes('min-h-11'), 'master-data touch targets must be mobile safe')

assert(settingsPageSource.includes('AdminSettingsClient'), '/admin/settings must render backend-backed settings client')
assert(settingsClientSource.includes('useMonthlyPlanSettings'), 'settings page must load backend monthly plan settings')
assert(settingsClientSource.includes('monthlyPlanService.updateSettings'), 'settings page must persist through backend settings endpoint')
assert(settingsClientSource.includes('ตัวอย่างผลกระทบ'), 'settings page must show impact preview before saving')
assert(settingsClientSource.includes('ยืนยันบันทึกการตั้งค่า'), 'settings page must require Thai confirmation')
assert(settingsClientSource.includes('บันทึกการตั้งค่าสำเร็จ'), 'settings page must show Thai success state')
assert(!settingsClientSource.includes('Audit'), 'settings page must not expose Audit settings in round 1')

for (const legacy of ['/admin/job-types', '/admin/job-details', '/admin/feeders', '/admin/stations', '/admin/peas', '/admin/operation-centers']) {
  assert(!adminShellSource.includes(`href: '${legacy}'`), `legacy per-entity route ${legacy} must not be linked in active admin nav`)
}
