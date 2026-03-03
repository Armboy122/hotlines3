import { fetchServer } from '@/lib/fetch-server'
import FeedersClient from '@/components/pages/admin/feeders-client'
import type { FeederWithStation } from '@/types/query-types'

export default async function FeedersPage() {
  const feeders = await fetchServer<FeederWithStation[]>('/v1/feeders')
  return <FeedersClient initialData={feeders} />
}
