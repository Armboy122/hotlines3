import { fetchServer } from '@/lib/fetch-server'
import TaskListClient from '@/components/pages/task-list-client'
import type { Team } from '@/types/query-types'

export default async function TaskListPage() {
  // Pre-fetch teams for dropdown
  const teams = await fetchServer<Team[]>('/v1/teams')

  return <TaskListClient initialTeams={teams} />
}
