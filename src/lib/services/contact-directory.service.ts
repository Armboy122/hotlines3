import { apiClient } from '@/lib/api-client'
import type {
  ContactDirectoryEntry,
  UpdateContactRequest,
  ContactDirectoryListParams,
} from '@/types/contact-directory'

export const contactDirectoryService = {
  // ── List contacts ───────────────────────────────────────────
  async list(params?: ContactDirectoryListParams): Promise<ContactDirectoryEntry[]> {
    return apiClient.get<ContactDirectoryEntry[]>('/v1/contact-directory', { params })
  },

  // ── Contact detail ──────────────────────────────────────────
  async get(userId: number): Promise<ContactDirectoryEntry> {
    return apiClient.get<ContactDirectoryEntry>(`/v1/contact-directory/${userId}`)
  },

  // ── Update own contact ──────────────────────────────────────
  async updateOwnContact(data: UpdateContactRequest): Promise<ContactDirectoryEntry> {
    return apiClient.patch<ContactDirectoryEntry>('/v1/users/me/contact', data)
  },

  // ── Update another user's contact (super_admin) ─────────────
  async updateContact(userId: number, data: UpdateContactRequest): Promise<ContactDirectoryEntry> {
    return apiClient.patch<ContactDirectoryEntry>(`/v1/users/${userId}/contact`, data)
  },
}
