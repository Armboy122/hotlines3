import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const guidelinePath = 'plan/39-u3-thai-state-copy-guideline-2026-05-22.md'
const absolutePath = resolve(root, guidelinePath)

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message)
}

assert(existsSync(absolutePath), `${guidelinePath} must exist`)

const source = readFileSync(absolutePath, 'utf8')

const requiredHeadings = [
  '# U3 Thai State Copy and No-Permission Design Rules',
  '## Scope and user goal',
  '## Approved Thai copy patterns',
  '## Component behavior rules',
  '## No-permission and disabled-action rules',
  '## Unreliable or missing data rules',
  '## Anti-patterns',
  '## Frontend worker acceptance checklist',
]

for (const heading of requiredHeadings) {
  assert(source.includes(heading), `guideline must include heading: ${heading}`)
}

const requiredCopy = [
  'กำลังโหลดข้อมูล...',
  'ยังไม่มีข้อมูล',
  'เกิดข้อผิดพลาดในการโหลดข้อมูล',
  'ลองใหม่',
  'ไม่มีสิทธิ์',
  'ข้อมูลยังไม่พร้อมใช้งาน',
  'ไม่สามารถแสดงจำนวนได้',
]

for (const copy of requiredCopy) {
  assert(source.includes(copy), `guideline must approve Thai copy: ${copy}`)
}

const requiredRules = [
  'ห้ามแสดง 0 เมื่อ backend ยังไม่ส่งข้อมูลที่ยืนยันได้',
  'viewer ต้องไม่เห็นหรือกด download/export/write actions',
  'ต้องมี retry ที่เชื่อมกับ refetch หรือ action เดิมจริง',
  '390x844',
]

for (const rule of requiredRules) {
  assert(source.includes(rule), `guideline must lock rule: ${rule}`)
}

console.log('U3 Thai state copy guideline contract passed')
