import { fetchServer } from '@/lib/fetch-server'
import StationsClient from '@/components/pages/admin/stations-client'
import type { Station } from '@/types/api'

export default async function StationsPage() {
  const stations = await fetchServer<Station[]>('/v1/stations')
  return <StationsClient initialData={stations} />
}
