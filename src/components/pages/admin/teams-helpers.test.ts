import type { ContactDirectoryEntry } from '@/types/contact-directory'
import type { Team } from '@/types/query-types'
import { buildTeamMemberSummaries, filterTeamsByQuery, validateTeamName } from './teams-helpers'

const assert = (value: boolean, message?: string) => {
  if (!value) throw new Error(message ?? 'teams helper assertion failed')
}

const assertEqual = <T>(actual: T, expected: T, message?: string) => {
  if (actual !== expected) throw new Error(message ?? `expected ${String(actual)} to equal ${String(expected)}`)
}

const makeContact = (id: number, teamId: number | null, overrides: Partial<ContactDirectoryEntry> = {}): ContactDirectoryEntry => ({
  id,
  username: `user${id}`,
  displayName: null,
  position: null,
  phoneNumber: null,
  role: 'user',
  teamId,
  team: teamId ? { id: teamId, name: `ทีม ${teamId}` } : null,
  isActive: true,
  actions: { canEdit: false, canEditRoleOrTeam: false },
  updatedAt: '2026-05-13T00:00:00.000Z',
  ...overrides,
})

const teams: Team[] = [
  { id: 1, name: 'ทีมฮอตไลน์เหนือ' },
  { id: 2, name: 'ทีมสายใต้' },
]

const contacts: ContactDirectoryEntry[] = [
  makeContact(1, 1, { displayName: 'สมชาย', position: 'หัวหน้าทีม', role: 'team_lead' }),
  makeContact(2, 1, { displayName: 'มานี', isActive: false }),
  makeContact(3, 2, { username: 'southern-user' }),
  makeContact(4, null),
]

const summaries = buildTeamMemberSummaries(teams, contacts)
assertEqual(summaries.get(1)?.activeCount, 1)
assertEqual(summaries.get(1)?.totalCount, 2)
assertEqual(summaries.get(1)?.leadNames.join(','), 'สมชาย')
assertEqual(summaries.get(2)?.activeCount, 1)
assertEqual(summaries.get(999)?.totalCount ?? 0, 0)

assertEqual(filterTeamsByQuery(teams, 'เหนือ').length, 1)
assertEqual(filterTeamsByQuery(teams, 'south').length, 0)
assertEqual(filterTeamsByQuery(teams, ' ').length, 2)

assert(validateTeamName('ทีมใหม่').valid)
assert(!validateTeamName('').valid)
assert(!validateTeamName('  ').valid)
assert(!validateTeamName('ab').valid)
assert(!validateTeamName('ก'.repeat(121)).valid)
