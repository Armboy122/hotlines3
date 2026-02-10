import { fetchServer } from '@/lib/fetch-server'
import DashboardClient from '@/components/pages/admin/dashboard-client'
import type { DashboardSummary, TopJobDetail, TopFeeder, Feeder, JobType } from '@/types/api'
import type { Team } from '@/types/query-types'

export default async function DashboardPage() {
  const currentYear = new Date().getFullYear()

  // Fetch all initial data in parallel
  const [summary, topJobDetails, topFeeders, teams, jobTypes, feeders] = await Promise.all([
    fetchServer<DashboardSummary>(`/v1/dashboard/summary?year=${currentYear}`).catch(() => undefined),
    fetchServer<TopJobDetail[]>(`/v1/dashboard/top-jobs?year=${currentYear}&limit=10`).catch(() => undefined),
    fetchServer<TopFeeder[]>(`/v1/dashboard/top-feeders?year=${currentYear}&limit=10`).catch(() => undefined),
    fetchServer<Team[]>('/v1/teams'),
    fetchServer<JobType[]>('/v1/job-types'),
    fetchServer<Feeder[]>('/v1/feeders'),
  ])

  return (
    <DashboardClient
      initialSummary={summary}
      initialTopJobDetails={topJobDetails}
      initialTopFeeders={topFeeders}
      initialTeams={teams}
      initialJobTypes={jobTypes}
      initialFeeders={feeders}
    />
  )
}
