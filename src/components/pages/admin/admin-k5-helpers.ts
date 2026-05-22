import type { CreateUserRequest, ResetPasswordRequest, UpdateUserRequest, UserRole } from '@/types/auth'

export const APPROVED_MONTHLY_PLAN_CAPABILITY = 'can_upload_approved_monthly_plan' as const
export const ADMIN_MUTABLE_ROLES = ['team_lead', 'user', 'viewer'] as const satisfies readonly UserRole[]
export type AdminMutableRole = (typeof ADMIN_MUTABLE_ROLES)[number]

export interface AdminUserFormState {
  username: string
  role: UserRole
  teamId: string
  displayName?: string
  isActive: boolean
}

export interface AdminBulkUserRow {
  username: string
  displayName: string
}

export interface AdminBulkJsonParseResult {
  teamId?: string
  teamName?: string
  rows: AdminBulkUserRow[]
}

function assertMutableRole(role: UserRole): asserts role is AdminMutableRole {
  if (!ADMIN_MUTABLE_ROLES.includes(role as AdminMutableRole)) {
    throw new Error('Admin UI does not allow creating or promoting extra super_admin users')
  }
}

function normalizeTeamId(value: string): number | null {
  const trimmed = value.trim()
  return trimmed ? Number(trimmed) : null
}

function normalizeOptionalText(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function valueToString(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return ''
}

function firstString(record: Record<string, unknown>, keys: readonly string[]): string {
  for (const key of keys) {
    const value = valueToString(record[key])
    if (value) return value
  }
  return ''
}

function extractBulkRows(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  if (!isRecord(value)) {
    throw new Error('JSON ต้องเป็น array หรือ object ที่มี employees/users/rows')
  }
  const rows = value.employees ?? value.users ?? value.rows
  if (!Array.isArray(rows)) {
    throw new Error('JSON object ต้องมี employees, users หรือ rows เป็น array')
  }
  return rows
}

function parseBulkUserPlainTextInput(text: string): AdminBulkJsonParseResult {
  const rows = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const match = line.match(/^(.*?)\s+(\d{6})$/)
      if (!match) {
        throw new Error(`บรรทัดที่ ${index + 1} ต้องเป็น "ชื่อพนักงาน รหัสพนักงาน 6 หลัก"`)
      }
      const displayName = match[1].trim()
      const username = match[2].trim()
      if (!displayName) {
        throw new Error(`บรรทัดที่ ${index + 1} ต้องมีชื่อพนักงาน`)
      }
      return { displayName, username }
    })

  if (rows.length === 0) {
    throw new Error('กรุณาวางรายชื่อพนักงาน')
  }

  return { rows }
}

export function parseBulkUserJsonInput(text: string): AdminBulkJsonParseResult {
  const trimmed = text.trim()
  if (!trimmed) {
    throw new Error('กรุณาวางรายชื่อพนักงาน')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed)
  } catch {
    return parseBulkUserPlainTextInput(trimmed)
  }

  const container = isRecord(parsed) ? parsed : undefined
  const rows = extractBulkRows(parsed).map((item, index) => {
    if (!isRecord(item)) {
      throw new Error(`รายการที่ ${index + 1} ต้องเป็น object`)
    }
    const displayName = firstString(item, ['displayName', 'name', 'fullName', 'employeeName', 'ชื่อ', 'ชื่อพนักงาน'])
    const username = firstString(item, ['username', 'code', 'employeeCode', 'employeeId', 'รหัส', 'รหัสพนักงาน'])
    if (!displayName || !username) {
      throw new Error(`รายการที่ ${index + 1} ต้องมีชื่อและรหัสพนักงาน`)
    }
    return { displayName, username }
  })

  if (rows.length === 0) {
    throw new Error('JSON ไม่มีรายชื่อพนักงาน')
  }

  const teamId = container ? firstString(container, ['teamId', 'team_id']) : ''
  const teamName = container ? firstString(container, ['teamName', 'team', 'ทีม']) : ''
  return {
    ...(teamId ? { teamId } : {}),
    ...(teamName ? { teamName } : {}),
    rows,
  }
}

export function buildCreateUserPayload(form: AdminUserFormState): Omit<CreateUserRequest, 'password'> {
  assertMutableRole(form.role)
  const payload: Omit<CreateUserRequest, 'password'> = {
    username: form.username.trim(),
    role: form.role,
    teamId: normalizeTeamId(form.teamId),
    isActive: form.isActive,
  }
  const displayName = normalizeOptionalText(form.displayName)
  if (displayName) {
    payload.displayName = displayName
  }
  return payload
}

export function buildBulkCreateUserPayloads(input: {
  teamId: string
  rows: readonly AdminBulkUserRow[]
}): Array<Omit<CreateUserRequest, 'password'>> {
  const teamId = normalizeTeamId(input.teamId)
  if (teamId == null) {
    throw new Error('กรุณาเลือกทีมก่อนเพิ่มพนักงาน')
  }

  const seen = new Set<string>()
  const payloads = input.rows
    .map((row) => ({ username: row.username.trim(), displayName: row.displayName.trim() }))
    .filter((row) => row.username || row.displayName)
    .map((row) => {
      if (!/^\d{6}$/.test(row.username)) {
        throw new Error('รหัสพนักงานต้องเป็นตัวเลข 6 หลัก')
      }
      if (!row.displayName) {
        throw new Error('กรุณากรอกชื่อพนักงานให้ครบ')
      }
      if (seen.has(row.username)) {
        throw new Error(`รหัสพนักงาน ${row.username} ซ้ำในรายการ`)
      }
      seen.add(row.username)
      return {
        username: row.username,
        displayName: row.displayName,
        role: 'user' as const,
        teamId,
        isActive: true,
      }
    })
  if (payloads.length === 0) {
    throw new Error('กรุณาเพิ่มพนักงานอย่างน้อย 1 คน')
  }
  return payloads
}

export function buildUpdateUserPayload(form: AdminUserFormState): UpdateUserRequest {
  assertMutableRole(form.role)
  return {
    username: form.username.trim(),
    role: form.role,
    teamId: normalizeTeamId(form.teamId),
    isActive: form.isActive,
  }
}

export function buildResetPasswordPayload(): ResetPasswordRequest {
  return {}
}

export function buildCapabilityReplacement(existingCapabilities: readonly string[], action: 'grant' | 'revoke') {
  const base = existingCapabilities.filter((code) => code === APPROVED_MONTHLY_PLAN_CAPABILITY)
  const next = action === 'grant' ? [APPROVED_MONTHLY_PLAN_CAPABILITY] : base.filter((code) => code !== APPROVED_MONTHLY_PLAN_CAPABILITY)
  return { capabilities: Array.from(new Set(next)) }
}

export function shouldForcePasswordChange(user: { mustChangePassword?: boolean } | null | undefined, pathname: string) {
  if (!user?.mustChangePassword) return false
  return pathname !== '/change-password'
}

export function buildTeamLeadConfirmationCopy({
  teamName,
  nextLeadName,
  currentLeadNames,
}: {
  teamName: string
  nextLeadName: string
  currentLeadNames: readonly string[]
}) {
  if (currentLeadNames.length > 0) {
    return `ยืนยันแทนที่หัวหน้าทีมเดิมของ ${teamName}: ${currentLeadNames.join(', ')} ด้วย ${nextLeadName} ผู้ใช้ที่ถูกเลือกจะถูกตั้งเป็น team_lead และย้ายมาอยู่ทีมนี้ทันที`
  }
  return `ยืนยันตั้งหัวหน้าทีม ${teamName} เป็น ${nextLeadName} ผู้ใช้ที่ถูกเลือกจะถูกตั้งเป็น team_lead และผูกกับทีมนี้ทันที`
}
