import type { ContactDirectoryEntry } from '@/types/contact-directory'

export type ContactTypeFilter = 'all' | 'user' | 'external' | 'emergency' | 'operation_center'

export interface ContactTypeOption {
  value: ContactTypeFilter
  label: string
}

export interface MobileContactAction {
  kind: 'call'
  label: string
  href: string | null
  disabled: boolean
}

const CONTACT_TYPE_LABELS: Record<ContactTypeFilter, string> = {
  all: 'ทั้งหมด',
  user: 'บุคลากรภายใน',
  external: 'หน่วยงานภายนอก',
  emergency: 'เบอร์ฉุกเฉิน/สำคัญ',
  operation_center: 'ศูนย์ปฏิบัติการ',
}

export function buildContactTypeOptions(): ContactTypeOption[] {
  return [
    { value: 'all', label: CONTACT_TYPE_LABELS.all },
    { value: 'user', label: CONTACT_TYPE_LABELS.user },
    { value: 'external', label: CONTACT_TYPE_LABELS.external },
    { value: 'emergency', label: CONTACT_TYPE_LABELS.emergency },
    { value: 'operation_center', label: CONTACT_TYPE_LABELS.operation_center },
  ]
}

export function contactDisplayName(entry: ContactDirectoryEntry): string {
  const displayName = entry.displayName?.trim()
  if (displayName) return displayName
  const organization = entry.organization?.trim()
  if (organization) return organization
  return 'ไม่ระบุชื่อ'
}

export function contactTypeLabel(entry: Pick<ContactDirectoryEntry, 'type' | 'source' | 'role'>): string {
  const type = normalizeContactType(entry)
  return CONTACT_TYPE_LABELS[type]
}

export function filterContactsByType<T extends Pick<ContactDirectoryEntry, 'type' | 'source' | 'role'>>(
  entries: T[],
  type: ContactTypeFilter,
): T[] {
  if (type === 'all') return entries
  return entries.filter((entry) => normalizeContactType(entry) === type)
}

export function contactCallHref(entry: Pick<ContactDirectoryEntry, 'phoneNumber'>): string | null {
  if (!entry.phoneNumber) return null
  const sanitized = entry.phoneNumber.replace(/[^0-9+]/g, '')
  return sanitized ? `tel:${sanitized}` : null
}

export function mobilePrimaryAction(entry: ContactDirectoryEntry): MobileContactAction {
  const href = contactCallHref(entry)
  return {
    kind: 'call',
    label: href ? `โทร ${entry.phoneNumber}` : 'ยังไม่มีเบอร์',
    href,
    disabled: !href,
  }
}

export function normalizeContactType(entry: Pick<ContactDirectoryEntry, 'type' | 'source' | 'role'>): ContactTypeFilter {
  if (entry.type === 'emergency') return 'emergency'
  if (entry.type === 'operation_center') return 'operation_center'
  if (entry.type === 'external') return 'external'
  if (entry.type === 'user') return 'user'
  if (entry.source === 'external_contact') return 'external'
  return 'user'
}
