import { fetchServer } from '@/lib/fetch-server'
import OperationCentersClient from '@/components/pages/admin/operation-centers-client'
import type { OperationCenter } from '@/types/api'

export default async function OperationCentersPage() {
  const operationCenters = await fetchServer<OperationCenter[]>('/v1/operation-centers')
  return <OperationCentersClient initialData={operationCenters} />
}
