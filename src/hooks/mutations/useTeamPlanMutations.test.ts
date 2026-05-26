import assert from 'node:assert/strict'
import { formatTeamPlanMutationError } from './useTeamPlanMutations'

assert.equal(
  formatTeamPlanMutationError(new Error('Forbidden')),
  'ไม่มีสิทธิ์แก้ไขแผนทีม',
  '403/forbidden team-plan update failures should show Thai no-permission copy',
)

assert.equal(
  formatTeamPlanMutationError(new Error('invalid date range')),
  'เกิดข้อผิดพลาด: invalid date range',
  'other team-plan failures should preserve backend detail with Thai error prefix',
)

console.log('All team-plan mutation error copy tests passed ✓')
