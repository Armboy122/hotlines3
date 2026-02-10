import { fetchServer } from '@/lib/fetch-server'
import FeedersClient from '@/components/pages/admin/feeders-client'
import type { Feeder } from '@/types/api'

export default async function FeedersPage() {
  const feeders = await fetchServer<Feeder[]>('/v1/feeders')
  return <FeedersClient initialData={feeders} />
}
