import { fetchServer } from '@/lib/fetch-server'
import JobDetailsClient from '@/components/pages/admin/job-details-client'
import type { JobDetail } from '@/types/api'

export default async function JobDetailsPage() {
  const jobDetails = await fetchServer<JobDetail[]>('/v1/job-details')
  return <JobDetailsClient initialData={jobDetails} />
}
