import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const root = process.cwd()
const contactsSource = readFileSync(resolve(root, 'src/app/(main)/contacts/page.tsx'), 'utf8')

assert(
  /isFetching/.test(contactsSource) && /disabled=\{isFetching\}/.test(contactsSource),
  '/contacts retry action must expose disabled/in-flight state while refetching',
)

assert(
  /ไม่ใช่รายชื่อว่าง/.test(contactsSource) && /ยังสรุปไม่ได้ว่ามีรายชื่อหรือไม่/.test(contactsSource),
  '/contacts API failure copy must honestly distinguish cannot-load from true empty',
)

assert(
  /ยังไม่มีรายชื่อที่มองเห็นได้/.test(contactsSource) && /รายชื่อจะแสดงที่นี่/.test(contactsSource),
  '/contacts true empty copy must remain separate from cannot-load copy',
)

assert(
  /กำลังติดต่อระบบสมุดโทรศัพท์/.test(contactsSource) && /กำลังเตรียมรายชื่อ/.test(contactsSource),
  '/contacts loading copy must be explicit while API data is pending',
)

assert(
  /canEditEntry[\s\S]{0,160}canEditAny[\s\S]{0,160}canEditOwn/.test(contactsSource) &&
    /โทรหา \$\{displayName\(entry\)\}/.test(contactsSource) &&
    /คัดลอกเบอร์โทร \$\{displayName\(entry\)\}/.test(contactsSource) &&
    /ดูรายละเอียด \$\{displayName\(entry\)\}/.test(contactsSource),
  '/contacts viewer-safe action surface must preserve call/copy/detail while edit stays capability-gated',
)

console.log('Contacts page state contract assertions passed ✓')
