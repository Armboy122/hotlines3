import { apiClient } from '@/lib/api-client'

export interface TopJobDetail {
  id: string
  name: string
  count: number
  jobTypeName: string
}

export interface TopFeeder {
  id: string
  code: string
  stationName: string
  count: number
}

export interface FeederJobMatrix {
  feederId: string
  feederCode: string
  stationName: string
  totalCount: number
  jobDetails: {
    id: string
    name: string
    count: number
    jobTypeName: string
  }[]
}

export interface DashboardSummary {
  totalTasks: number
  totalJobTypes: number
  totalFeeders: number
  topTeam: {
    id: string
    name: string
    count: number
  } | null
}

export const dashboardService = {
  async getSummary(params?: { year?: number; month?: number; teamId?: string; jobTypeId?: string }): Promise<DashboardSummary> {
    return apiClient.get('/v1/dashboard/summary', { params })
  },

  async getTopJobDetails(params?: { year?: number; limit?: number; month?: number; teamId?: string; jobTypeId?: string }): Promise<TopJobDetail[]> {
    return apiClient.get('/v1/dashboard/top-jobs', { params })
  },

  async getTopFeeders(params?: { year?: number; limit?: number; month?: number; teamId?: string; jobTypeId?: string }): Promise<TopFeeder[]> {
    return apiClient.get('/v1/dashboard/top-feeders', { params })
  },

  async getFeederJobMatrix(params: { feederId: string; year?: number; month?: number; teamId?: string; jobTypeId?: string }): Promise<FeederJobMatrix> {
    return apiClient.get('/v1/dashboard/feeder-matrix', { params })
  },
}
