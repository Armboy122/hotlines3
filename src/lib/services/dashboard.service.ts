import { apiClient } from '@/lib/api-client'
import type {
  DashboardSummary,
  TopJobDetail,
  TopFeeder,
  FeederJobMatrix,
  DashboardStatsResponse,
  DashboardFilterParams,
  DashboardStatsParams,
  FeederMatrixParams,
} from '@/types/api'

export type { DashboardSummary, TopJobDetail, TopFeeder, FeederJobMatrix }

export const dashboardService = {
  async getSummary(params?: DashboardFilterParams): Promise<DashboardSummary> {
    return apiClient.get('/v1/dashboard/summary', { params })
  },

  async getTopJobDetails(params?: DashboardFilterParams & { limit?: number }): Promise<TopJobDetail[]> {
    return apiClient.get('/v1/dashboard/top-jobs', { params })
  },

  async getTopFeeders(params?: DashboardFilterParams & { limit?: number }): Promise<TopFeeder[]> {
    return apiClient.get('/v1/dashboard/top-feeders', { params })
  },

  async getFeederJobMatrix(params: FeederMatrixParams): Promise<FeederJobMatrix> {
    return apiClient.get('/v1/dashboard/feeder-matrix', { params })
  },

  async getStats(params?: DashboardStatsParams): Promise<DashboardStatsResponse> {
    return apiClient.get('/v1/dashboard/stats', { params })
  },
}
