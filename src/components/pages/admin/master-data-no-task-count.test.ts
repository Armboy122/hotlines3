import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'

const root = process.cwd()
for (const file of [
  'src/components/pages/admin/job-types-client.tsx',
  'src/components/pages/admin/job-details-client.tsx',
]) {
  const source = readFileSync(resolve(root, file), 'utf8')
  assert(
    !/งานที่เกี่ยวข้อง/.test(source),
    `${file} must not show task-count copy for job types/details because backend counts are not reliable for this admin detail context`,
  )
  assert(
    !/_count\??\.?tasks|_count\.tasks|getCount\(/.test(source),
    `${file} must not read _count.tasks for job types/details`,
  )
}

const masterDataSource = readFileSync(resolve(root, 'src/components/pages/admin/admin-master-data-client.tsx'), 'utf8')
assert(
  /id: 'job-types',[\s\S]*renderDetails: \(\) => \[\]/.test(masterDataSource),
  'admin master-data job-types details must not render task counts',
)
assert(
  /id: 'job-details',[\s\S]*renderDetails: \(record\) => \[`ประเภทงาน ID/.test(masterDataSource),
  'admin master-data job-details should keep type context only',
)
assert(
  !/id: 'job-details',[\s\S]*งานที่เกี่ยวข้อง[\s\S]*id: 'feeders'/.test(masterDataSource),
  'admin master-data job-details must not render task counts',
)

console.log('admin master-data no task-count regression passed ✓')
