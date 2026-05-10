import { fetchServer } from '@/lib/fetch-server'
import DashboardClient from '@/components/pages/admin/dashboard-client'
import type { Feeder, JobType } from '@/types/api'
import type { Team } from '@/types/query-types'

export default async function DashboardPage() {
  // Dashboard analytics endpoints require Bearer auth and the access token is kept in
  // client memory. Let DashboardClient load those via apiClient so the request
  // interceptor attaches Authorization instead of trying unauthenticated SSR fetches.
  const [teams, jobTypes, feeders] = await Promise.all([
    fetchServer<Team[]>('/v1/teams').catch(() => []),
    fetchServer<JobType[]>('/v1/job-types').catch(() => []),
    fetchServer<Feeder[]>('/v1/feeders').catch(() => []),
  ])

  return (
    <DashboardClient
      initialTeams={teams}
      initialJobTypes={jobTypes}
      initialFeeders={feeders}
    />
  )
}
