import { apiClient } from '@/lib/api-client'
import type {
  MonthlyPlanPeriod,
  PlanFile,
  SubmissionStatusResponse,
  MonthlyPlanSettings,
  UpdateSettingsRequest,
  PlanPresignRequest,
  PlanPresignResponse,
  ConfirmUploadRequest,
  DownloadUrlResponse,
} from '@/types/monthly-plan'

export const monthlyPlanService = {
  // ── Period (FirstOrCreate) ─────────────────────────────────
  async getPeriod(year: number, month: number): Promise<MonthlyPlanPeriod> {
    return apiClient.get<MonthlyPlanPeriod>(`/v1/monthly-plans/${year}/${month}`)
  },

  // ── Files ──────────────────────────────────────────────────
  async getFiles(
    year: number,
    month: number,
    params?: { search?: string; teamId?: number }
  ): Promise<PlanFile[]> {
    return apiClient.get<PlanFile[]>(`/v1/monthly-plans/${year}/${month}/files`, { params })
  },

  // ── Presign ────────────────────────────────────────────────
  async presignUpload(
    year: number,
    month: number,
    body: PlanPresignRequest
  ): Promise<PlanPresignResponse> {
    return apiClient.post<PlanPresignResponse>(
      `/v1/monthly-plans/${year}/${month}/files/presign`,
      body
    )
  },

  // ── Confirm Upload ─────────────────────────────────────────
  async confirmUpload(
    year: number,
    month: number,
    body: ConfirmUploadRequest
  ): Promise<PlanFile> {
    return apiClient.post<PlanFile>(`/v1/monthly-plans/${year}/${month}/files`, body)
  },

  // ── Soft Delete ────────────────────────────────────────────
  async softDeleteFile(fileId: number): Promise<void> {
    return apiClient.delete(`/v1/monthly-plans/files/${fileId}`)
  },

  // ── Hard Delete (admin) ────────────────────────────────────
  async hardDeleteFile(fileId: number): Promise<void> {
    return apiClient.delete(`/v1/monthly-plans/files/${fileId}/permanent`)
  },

  // ── Restore (admin) ────────────────────────────────────────
  async restoreFile(fileId: number): Promise<PlanFile> {
    return apiClient.post<PlanFile>(`/v1/monthly-plans/files/${fileId}/restore`)
  },

  // ── Download URL ───────────────────────────────────────────
  async getDownloadUrl(fileId: number): Promise<string> {
    const res = await apiClient.get<DownloadUrlResponse>(
      `/v1/monthly-plans/files/${fileId}/download`
    )
    return res.downloadUrl
  },

  // ── Submission Status ──────────────────────────────────────
  async getSubmissionStatus(
    year: number,
    month: number
  ): Promise<SubmissionStatusResponse> {
    return apiClient.get<SubmissionStatusResponse>(
      `/v1/monthly-plans/${year}/${month}/status`
    )
  },

  // ── Settings (admin) ──────────────────────────────────────
  async getSettings(): Promise<MonthlyPlanSettings> {
    return apiClient.get<MonthlyPlanSettings>('/v1/monthly-plans/settings')
  },

  async updateSettings(body: UpdateSettingsRequest): Promise<MonthlyPlanSettings> {
    return apiClient.put<MonthlyPlanSettings>('/v1/monthly-plans/settings', body)
  },
}
