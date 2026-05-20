import type { CreateUserRequest, ResetPasswordRequest, UpdateUserRequest, UserRole } from '@/types/auth'

export const APPROVED_MONTHLY_PLAN_CAPABILITY = 'can_upload_approved_monthly_plan' as const
export const ADMIN_MUTABLE_ROLES = ['team_lead', 'user', 'viewer'] as const satisfies readonly UserRole[]
export type AdminMutableRole = (typeof ADMIN_MUTABLE_ROLES)[number]

export interface AdminUserFormState {
  username: string
  role: UserRole
  teamId: string
  isActive: boolean
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

export function buildCreateUserPayload(form: AdminUserFormState): Omit<CreateUserRequest, 'password'> {
  assertMutableRole(form.role)
  return {
    username: form.username.trim(),
    role: form.role,
    teamId: normalizeTeamId(form.teamId),
    isActive: form.isActive,
  }
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
