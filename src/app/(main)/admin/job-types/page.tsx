import { fetchServer } from '@/lib/fetch-server'
import JobTypesClient from '@/components/pages/admin/job-types-client'
import type { JobType } from '@/types/api'

export default async function JobTypesPage() {
  const jobTypes = await fetchServer<JobType[]>('/v1/job-types')
  return <JobTypesClient initialData={jobTypes} />
}
