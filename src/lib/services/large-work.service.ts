import { apiClient } from '@/lib/api-client'
import type {
  LargeWorkRequest,
  UpdateLargeWorkRequest,
  LargeWorkResponse,
  LargeWorkListParams,
} from '@/types/large-work'

export const largeWorkService = {
  // ── List ────────────────────────────────────────────────────
  async list(params?: LargeWorkListParams): Promise<LargeWorkResponse[]> {
    return apiClient.get<LargeWorkResponse[]>('/v1/large-work-items', { params })
  },

  // ── Detail ──────────────────────────────────────────────────
  async get(id: number): Promise<LargeWorkResponse> {
    return apiClient.get<LargeWorkResponse>(`/v1/large-work-items/${id}`)
  },

  // ── Create ──────────────────────────────────────────────────
  async create(data: LargeWorkRequest): Promise<LargeWorkResponse> {
    return apiClient.post<LargeWorkResponse>('/v1/large-work-items', data)
  },

  // ── Update ──────────────────────────────────────────────────
  async update(id: number, data: UpdateLargeWorkRequest): Promise<LargeWorkResponse> {
    return apiClient.patch<LargeWorkResponse>(`/v1/large-work-items/${id}`, data)
  },

  // ── Cancel ──────────────────────────────────────────────────
  async cancel(id: number): Promise<LargeWorkResponse> {
    return apiClient.post<LargeWorkResponse>(`/v1/large-work-items/${id}/cancel`)
  },
}
