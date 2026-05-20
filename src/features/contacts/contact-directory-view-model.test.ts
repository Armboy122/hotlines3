import assert from 'node:assert/strict'
import {
  buildContactTypeOptions,
  contactCallHref,
  contactDisplayName,
  contactTypeLabel,
  filterContactsByType,
  mobilePrimaryAction,
} from './contact-directory-view-model'
import type { ContactDirectoryEntry } from '@/types/contact-directory'

const contact = (overrides: Partial<ContactDirectoryEntry>): ContactDirectoryEntry => ({
  id: 1,
  username: '100001',
  displayName: 'นายช่าง Hotline',
  position: 'ช่างแก้ไฟ',
  phoneNumber: '081-234-5678',
  role: 'user',
  teamId: 10,
  team: { id: 10, name: 'ทีม Hotline' },
  isActive: true,
  actions: { canEdit: false, canEditRoleOrTeam: false },
  updatedAt: '2026-05-21T00:00:00Z',
  source: 'user',
  type: 'user',
  organization: null,
  notes: null,
  ...overrides,
})

const internal = contact({ id: 1, source: 'user', type: 'user' })
const external = contact({ id: 2, username: 'ext-2', source: 'external_contact', type: 'external', displayName: 'เทศบาลเมือง', organization: 'เทศบาล', role: 'viewer' })
const emergency = contact({ id: 3, username: 'emergency-3', source: 'external_contact', type: 'emergency', displayName: '191', phoneNumber: '191', role: 'viewer' })
const center = contact({ id: 4, username: 'center-4', source: 'external_contact', type: 'operation_center', displayName: 'ศูนย์ควบคุม', role: 'viewer' })

assert.deepEqual(buildContactTypeOptions().map((option) => option.value), ['all', 'user', 'external', 'emergency', 'operation_center'])
assert.equal(contactTypeLabel(internal), 'บุคลากรภายใน')
assert.equal(contactTypeLabel(external), 'หน่วยงานภายนอก')
assert.equal(contactTypeLabel(emergency), 'เบอร์ฉุกเฉิน/สำคัญ')
assert.equal(contactTypeLabel(center), 'ศูนย์ปฏิบัติการ')
assert.deepEqual(filterContactsByType([internal, external, emergency, center], 'external').map((item) => item.id), [2])
assert.deepEqual(filterContactsByType([internal, external, emergency, center], 'emergency').map((item) => item.id), [3])
assert.equal(contactDisplayName(contact({ displayName: null, organization: 'PEA Partner', username: 'ext-5' })), 'PEA Partner')
assert.equal(contactCallHref(contact({ phoneNumber: '+66 81-234-5678 ต่อ 9' })), 'tel:+668123456789')
assert.deepEqual(mobilePrimaryAction(emergency), { kind: 'call', label: 'โทร 191', href: 'tel:191', disabled: false })
assert.equal(mobilePrimaryAction(contact({ phoneNumber: null })).disabled, true)

console.log('contact directory view-model tests passed ✓')
