import { apiClient } from '@/lib/api-client'
import type {
  LargeWorkRequest,
  UpdateLargeWorkRequest,
  LargeWorkResponse,
  LargeWorkListParams,
  LargeWorkOverviewResponse,
  LargeWorkAddTasksRequest,
  LargeWorkTaskResponse,
  LargeWorkTaskCompleteRequest,
  LargeWorkTaskBlockRequest,
  LargeWorkTaskPhotoRequest,
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

  // ── Overview (all roles) ────────────────────────────────────
  async getOverview(id: number): Promise<LargeWorkOverviewResponse> {
    return apiClient.get<LargeWorkOverviewResponse>(`/v1/large-work-items/${id}/overview`)
  },

  // ── Tasks: add (team_lead/admin) ────────────────────────────
  async addTasks(id: number, data: LargeWorkAddTasksRequest): Promise<LargeWorkTaskResponse[]> {
    return apiClient.post<LargeWorkTaskResponse[]>(`/v1/large-work-items/${id}/tasks`, data)
  },

  // ── Tasks: list ─────────────────────────────────────────────
  async listTasks(id: number): Promise<LargeWorkTaskResponse[]> {
    return apiClient.get<LargeWorkTaskResponse[]>(`/v1/large-work-items/${id}/tasks`)
  },

  // ── My todos (own-team execution queue) ─────────────────────
  async getMyTodos(): Promise<LargeWorkTaskResponse[]> {
    return apiClient.get<LargeWorkTaskResponse[]>('/v1/large-work-tasks/my-todos')
  },

  // ── Task execution: start ───────────────────────────────────
  async startTask(taskId: number): Promise<LargeWorkTaskResponse> {
    return apiClient.patch<LargeWorkTaskResponse>(`/v1/large-work-tasks/${taskId}/start`)
  },

  // ── Task execution: complete ────────────────────────────────
  async completeTask(taskId: number, data: LargeWorkTaskCompleteRequest): Promise<LargeWorkTaskResponse> {
    return apiClient.patch<LargeWorkTaskResponse>(`/v1/large-work-tasks/${taskId}/complete`, data)
  },

  // ── Task execution: block ───────────────────────────────────
  async blockTask(taskId: number, data: LargeWorkTaskBlockRequest): Promise<LargeWorkTaskResponse> {
    return apiClient.patch<LargeWorkTaskResponse>(`/v1/large-work-tasks/${taskId}/block`, data)
  },

  // ── Task photos ─────────────────────────────────────────────
  async addTaskPhotos(taskId: number, data: LargeWorkTaskPhotoRequest): Promise<LargeWorkTaskResponse> {
    return apiClient.post<LargeWorkTaskResponse>(`/v1/large-work-tasks/${taskId}/photos`, data)
  },
}
