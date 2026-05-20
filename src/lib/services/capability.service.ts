import { apiClient } from '@/lib/api-client'
import { APPROVED_MONTHLY_PLAN_CAPABILITY } from '@/components/pages/admin/admin-k5-helpers'

export type CapabilityCode = typeof APPROVED_MONTHLY_PLAN_CAPABILITY

export interface CapabilityDefinition {
  code: CapabilityCode
  name?: string
  description?: string
}

export interface UserCapabilityResponse {
  userId: number
  capabilities: string[]
}

export interface ReplaceUserCapabilitiesData {
  userId: number
  capabilities: string[]
}

export const capabilityService = {
  async listAvailable(): Promise<CapabilityDefinition[]> {
    return apiClient.get<CapabilityDefinition[]>('/v1/capabilities')
  },

  async listForUser(userId: number): Promise<UserCapabilityResponse> {
    return apiClient.get<UserCapabilityResponse>(`/v1/users/${userId}/capabilities`)
  },

  async replaceForUser({ userId, capabilities }: ReplaceUserCapabilitiesData): Promise<UserCapabilityResponse> {
    return apiClient.put<UserCapabilityResponse>(`/v1/users/${userId}/capabilities`, { capabilities })
  },
}
