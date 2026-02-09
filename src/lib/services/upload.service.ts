import { apiClient } from '@/lib/api-client'

interface PresignedUrlData {
  uploadUrl: string
  fileUrl: string
  fileKey: string
}

export const uploadService = {
  async getPresignedUrl(input: { fileName: string; fileType: string }): Promise<PresignedUrlData> {
    return apiClient.post('/v1/upload/image', input)
  },

  async deleteFile(key: string): Promise<void> {
    return apiClient.delete(`/v1/upload/${encodeURIComponent(key)}`)
  },
}
