import { useState } from 'react'

interface UploadResponse {
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

interface UseUploadReturn {
  upload: (file: File) => Promise<UploadResponse>
  uploading: boolean
  progress: number
}

export function useUpload(): UseUploadReturn {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const upload = async (file: File): Promise<UploadResponse> => {
    setUploading(true)
    setProgress(0)

    try {
      console.log('[useUpload] Starting upload for file:', file.name, 'type:', file.type, 'size:', file.size)

      const presignResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      })

      console.log('[useUpload] Presign response status:', presignResponse.status)

      if (!presignResponse.ok) {
        const error = await presignResponse.json().catch(() => null)
        console.error('[useUpload] Presign error:', error)
        throw new Error(error?.error || 'ไม่สามารถขอ presigned URL ได้')
      }

      const presignData = await presignResponse.json()
      console.log('[useUpload] Presign data received:', presignData)

      const uploadUrl: string | undefined = presignData?.data?.uploadUrl
      const fileUrl: string | undefined = presignData?.data?.fileUrl
      const fileKey: string | undefined = presignData?.data?.fileKey

      if (!uploadUrl || !fileUrl || !fileKey) {
        console.error('[useUpload] Invalid presign data structure:', presignData)
        throw new Error('โครงสร้างข้อมูล presigned URL ไม่ถูกต้อง')
      }

      console.log('[useUpload] Starting upload to R2...')

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100)
            console.log('[useUpload] Upload progress:', percentComplete + '%')
            setProgress(percentComplete)
          }
        })

        xhr.addEventListener('load', () => {
          console.log('[useUpload] XHR load event, status:', xhr.status)
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log('[useUpload] Upload successful')
            setProgress(100)
            resolve()
          } else {
            console.error('[useUpload] Upload failed with status:', xhr.status, 'response:', xhr.responseText)
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        })

        xhr.addEventListener('error', (event) => {
          console.error('[useUpload] XHR error event:', event)
          reject(new Error('Network error - ไม่สามารถเชื่อมต่อกับ storage ได้'))
        })

        xhr.addEventListener('abort', () => {
          console.warn('[useUpload] Upload cancelled')
          reject(new Error('Upload cancelled'))
        })

        xhr.open('PUT', uploadUrl)
        xhr.setRequestHeader('Content-Type', file.type)
        console.log('[useUpload] Sending file to:', uploadUrl.substring(0, 50) + '...')
        xhr.send(file)
      })

      setUploading(false)

      console.log('[useUpload] Upload completed successfully, file URL:', fileUrl)

      return {
        success: true,
        data: {
          url: fileUrl,
          fileName: fileKey,
          originalName: file.name,
          size: file.size,
          type: file.type,
        },
      }

    } catch (error) {
      console.error('[useUpload] Upload failed:', error)
      setUploading(false)
      setProgress(0)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'การอัพโหลดล้มเหลว',
      }
    }
  }

  return {
    upload,
    uploading,
    progress
  }
}
