import { fetchServer } from '@/lib/fetch-server'
import PeasClient from '@/components/pages/admin/peas-client'
import type { Pea } from '@/types/api'

export default async function PeasPage() {
  const peas = await fetchServer<Pea[]>('/v1/peas')
  return <PeasClient initialData={peas} />
}
