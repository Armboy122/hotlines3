import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const dashboardClient = readFileSync(
  join(root, 'src/components/pages/admin/dashboard-client.tsx'),
  'utf8',
)

const failures = []

if (/from ['"]recharts['"]/.test(dashboardClient)) {
  failures.push('dashboard-client.tsx must not statically import recharts; lazy-load the feeder matrix chart instead')
}

if (!/dynamic\(\s*\(\)\s*=>\s*import\(['"]@\/components\/pages\/admin\/feeder-matrix-chart['"]\)/s.test(dashboardClient)) {
  failures.push('dashboard-client.tsx must dynamically import the feeder matrix chart component')
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('performance regression checks passed')
