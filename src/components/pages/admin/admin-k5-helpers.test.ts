import assert from 'node:assert/strict'
import {
  ADMIN_MUTABLE_ROLES,
  APPROVED_MONTHLY_PLAN_CAPABILITY,
  buildBulkCreateUserPayloads,
  buildCapabilityReplacement,
  buildCreateUserPayload,
  buildResetPasswordPayload,
  buildTeamLeadConfirmationCopy,
  buildUpdateUserPayload,
  parseBulkUserJsonInput,
  shouldForcePasswordChange,
} from './admin-k5-helpers'

assert.deepEqual(ADMIN_MUTABLE_ROLES, ['team_lead', 'user', 'viewer'], 'Admin UI must not expose super_admin create/promote path')
assert.equal(APPROVED_MONTHLY_PLAN_CAPABILITY, 'can_upload_approved_monthly_plan')

const createPayload = buildCreateUserPayload({ username: '123456', role: 'user', teamId: '7', isActive: true })
assert.deepEqual(createPayload, { username: '123456', role: 'user', teamId: 7, isActive: true })
assert.equal(Object.hasOwn(createPayload, 'password'), false, 'create user payload must not send arbitrary password')

const createWithName = buildCreateUserPayload({ username: '123456', role: 'user', teamId: '7', displayName: ' นายสมชาย ', isActive: true })
assert.deepEqual(createWithName, { username: '123456', role: 'user', teamId: 7, displayName: 'นายสมชาย', isActive: true })

assert.deepEqual(
  buildBulkCreateUserPayloads({
    teamId: '2',
    rows: [
      { displayName: ' นายหนึ่ง ', username: '111111' },
      { displayName: 'นางสอง', username: '222222' },
    ],
  }),
  [
    { username: '111111', displayName: 'นายหนึ่ง', role: 'user', teamId: 2, isActive: true },
    { username: '222222', displayName: 'นางสอง', role: 'user', teamId: 2, isActive: true },
  ],
  'bulk create should use one selected team and only employee name/code rows',
)

assert.throws(
  () => buildBulkCreateUserPayloads({ teamId: '', rows: [{ displayName: 'นายหนึ่ง', username: '111111' }] }),
  /เลือกทีม/,
  'bulk create requires a selected team',
)

assert.deepEqual(
  parseBulkUserJsonInput(JSON.stringify([
    { displayName: 'นายสาม', username: '333333' },
    { name: 'นางสี่', code: '444444' },
  ])),
  {
    rows: [
      { displayName: 'นายสาม', username: '333333' },
      { displayName: 'นางสี่', username: '444444' },
    ],
  },
  'JSON import should accept array aliases for employee name and code',
)

assert.deepEqual(
  parseBulkUserJsonInput(JSON.stringify({
    teamId: 8,
    employees: [{ ชื่อพนักงาน: 'นายห้า', รหัสพนักงาน: 555555 }],
  })),
  { teamId: '8', rows: [{ displayName: 'นายห้า', username: '555555' }] },
  'JSON import should accept object wrapper with teamId and Thai keys',
)

assert.deepEqual(
  parseBulkUserJsonInput(JSON.stringify({
    teamName: 'หาดใหญ่',
    employees: [{ name: 'นายหก', code: '666666' }],
  })),
  { teamName: 'หาดใหญ่', rows: [{ displayName: 'นายหก', username: '666666' }] },
  'JSON import should accept teamName so admins do not have to know numeric team IDs',
)

assert.deepEqual(
  parseBulkUserJsonInput(`
นายชนวัฒน์ ปรีดาศักดิ์        505047
นายวิชัย เอี่ยมจิตร          506797
นายณัฐพงษ์ ศรีทอง            511085
  `),
  {
    rows: [
      { displayName: 'นายชนวัฒน์ ปรีดาศักดิ์', username: '505047' },
      { displayName: 'นายวิชัย เอี่ยมจิตร', username: '506797' },
      { displayName: 'นายณัฐพงษ์ ศรีทอง', username: '511085' },
    ],
  },
  'paste import should accept copied table-like lines with name then employee code',
)

assert.throws(
  () => parseBulkUserJsonInput('{bad json'),
  /บรรทัดที่ 1/,
  'paste import should report malformed non-JSON lines clearly',
)

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
