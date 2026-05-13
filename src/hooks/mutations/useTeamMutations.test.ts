import assert from 'node:assert/strict'
import { removeDeletedTeamFromCache } from './useTeamMutations'
import type { Team } from '@/types/query-types'

const teams: Team[] = [
  { id: 1, name: 'ทีมฮอตไลน์เหนือ' },
  { id: 2, name: 'ทีมที่จะลบ' },
  { id: 3, name: 'ทีมสายใต้' },
]

let cachedTeams: Team[] | undefined = teams
const calls: Array<{ queryKey: readonly unknown[]; refetchType?: string }> = []
const fakeQueryClient = {
  setQueryData: (queryKey: readonly unknown[], updater: (old: Team[] | undefined) => Team[] | undefined) => {
    assert.deepEqual(queryKey, ['teams'])
    cachedTeams = updater(cachedTeams)
  },
  invalidateQueries: (args: { queryKey: readonly unknown[]; refetchType?: string }) => {
    calls.push(args)
  },
}

removeDeletedTeamFromCache(fakeQueryClient, '2')

assert.deepEqual(
  cachedTeams?.map((team) => team.id),
  [1, 3],
  'deleted team should be removed from the visible teams cache immediately after DELETE succeeds',
)
assert.deepEqual(calls, [{ queryKey: ['teams'], refetchType: 'active' }])

cachedTeams = undefined
removeDeletedTeamFromCache(fakeQueryClient, '999')
assert.equal(cachedTeams, undefined, 'empty team cache should remain empty')

console.log('All team mutation cache tests passed ✓')
