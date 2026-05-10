import { apiClient } from '@/lib/api-client'
import type {
  DailyReportDraftFromPlanResponse,
  DailyReportDraftParams,
  DailyReportDraftSourcesResponse,
  DailyReportDraftSourcesParams,
} from '@/types/daily-report-draft'

export const dailyReportDraftService = {
  // ── List eligible plan sources for a date/team ──────────────
  async listSources(params: DailyReportDraftSourcesParams): Promise<DailyReportDraftSourcesResponse> {
    return apiClient.get<DailyReportDraftSourcesResponse>(
      '/v1/daily-report-drafts/sources',
      { params }
    )
  },

  // ── Prefill from plan source ────────────────────────────────
  async fromPlan(params: DailyReportDraftParams): Promise<DailyReportDraftFromPlanResponse> {
    return apiClient.get<DailyReportDraftFromPlanResponse>(
      '/v1/daily-report-drafts/from-plan',
      { params }
    )
  },
}
