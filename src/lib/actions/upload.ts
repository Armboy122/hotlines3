'use server'

import { apiClient } from '@/lib/api-client'

export interface UploadResult {
  success: boolean
  data?: {
    url: string
    fileName: string
    originalName: string
    size: number
    type: string
  }
  error?: string
}

export async function uploadImage(formData: FormData): Promise<UploadResult> {
  try {
    const res = await apiClient<UploadResult>('/upload', {
      method: 'POST',
      body: formData,
    })
    return res
  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'การอัพโหลดล้มเหลว'
    }
  }
}

export async function deleteImage(fileName: string): Promise<{ success: boolean; error?: string }> {
  // Since we don't have a delete endpoint in Elysia yet for files (only upload), 
  // and the original code imported deleteFromR2 dynamically.
  // We should probably add a delete endpoint to Elysia or keep using the lib for now if it's server-side only.
  // But the goal is to migrate to Elysia.
  // Let's assume we will add DELETE /upload/:fileName to Elysia or similar.
  // For now, I'll implement DELETE in Elysia upload route as well.

  // Wait, I didn't implement DELETE in src/server/routes/upload.ts
  // I should add it.

  try {
    // Temporary: Calling the library directly until I update the route
    // But to be consistent, I should update the route first.
    // However, to avoid context switching too much, I'll use the API client and assume I'll update the route next.
    // Or I can just implement it here using the lib if I want to be safe.
    // The instruction is "Change all API used in project to elysia".
    // So I must use API.

    // I will update the route in the next step.
    const res = await apiClient<{ success: boolean; error?: string }>(`/upload/${fileName}`, {
      method: 'DELETE'
    })
    return res
  } catch (error) {
    console.error('Delete error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'การลบไฟล์ล้มเหลว'
    }
  }
}
