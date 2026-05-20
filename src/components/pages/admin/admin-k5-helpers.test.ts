import assert from 'node:assert/strict'
import {
  ADMIN_MUTABLE_ROLES,
  APPROVED_MONTHLY_PLAN_CAPABILITY,
  buildCapabilityReplacement,
  buildCreateUserPayload,
  buildResetPasswordPayload,
  buildTeamLeadConfirmationCopy,
  buildUpdateUserPayload,
  shouldForcePasswordChange,
} from './admin-k5-helpers'

assert.deepEqual(ADMIN_MUTABLE_ROLES, ['team_lead', 'user', 'viewer'], 'Admin UI must not expose super_admin create/promote path')
assert.equal(APPROVED_MONTHLY_PLAN_CAPABILITY, 'can_upload_approved_monthly_plan')

const createPayload = buildCreateUserPayload({ username: '123456', role: 'user', teamId: '7', isActive: true })
assert.deepEqual(createPayload, { username: '123456', role: 'user', teamId: 7, isActive: true })
assert.equal(Object.hasOwn(createPayload, 'password'), false, 'create user payload must not send arbitrary password')

assert.throws(
  () => buildCreateUserPayload({ username: '123456', role: 'super_admin', teamId: '', isActive: true }),
  /super_admin/,
  'create flow must reject extra super_admin users',
)
assert.throws(
  () => buildUpdateUserPayload({ username: '234567', role: 'super_admin', teamId: '', isActive: true }),
  /super_admin/,
  'edit flow must reject promotion to super_admin',
)

assert.deepEqual(buildResetPasswordPayload(), {}, 'reset password uses backend default-password policy without user-entered password')

assert.deepEqual(
  buildCapabilityReplacement([], 'grant'),
  { capabilities: ['can_upload_approved_monthly_plan'] },
  'grant should add only the round-1 approved monthly plan capability',
)
assert.deepEqual(
  buildCapabilityReplacement(['can_upload_approved_monthly_plan', 'legacy_extra'], 'revoke'),
  { capabilities: [] },
  'revoke should remove the approved monthly plan capability and never preserve unsupported codes',
)

assert.equal(shouldForcePasswordChange({ mustChangePassword: true }, '/planning'), true)
assert.equal(shouldForcePasswordChange({ mustChangePassword: true }, '/change-password'), false)
assert.equal(shouldForcePasswordChange({ mustChangePassword: false }, '/planning'), false)

const firstLeadCopy = buildTeamLeadConfirmationCopy({ teamName: 'ทีม A', nextLeadName: 'นายหนึ่ง', currentLeadNames: [] })
assert(firstLeadCopy.includes('ตั้งหัวหน้าทีม'))
assert(firstLeadCopy.includes('นายหนึ่ง'))

const replaceLeadCopy = buildTeamLeadConfirmationCopy({ teamName: 'ทีม A', nextLeadName: 'นายสอง', currentLeadNames: ['นายเดิม'] })
assert(replaceLeadCopy.includes('แทนที่หัวหน้าทีมเดิม'))
assert(replaceLeadCopy.includes('นายเดิม'))
