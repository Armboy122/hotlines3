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
      const presignResponse = await fetch('/api/upload/presigned', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      })

      if (!presignResponse.ok) {
        const error = await presignResponse.json().catch(() => null)
        throw new Error(error?.error || 'ไม่สามารถขอ presigned URL ได้')
      }

      const presignData = await presignResponse.json()
      const uploadUrl: string | undefined = presignData?.data?.uploadUrl
      const fileUrl: string | undefined = presignData?.data?.fileUrl
      const fileKey: string | undefined = presignData?.data?.fileKey

      if (!uploadUrl || !fileUrl || !fileKey) {
        throw new Error('โครงสร้างข้อมูล presigned URL ไม่ถูกต้อง')
      }

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100)
            setProgress(percentComplete)
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setProgress(100)
            resolve()
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        })

        xhr.addEventListener('error', () => {
          reject(new Error('Network error'))
        })

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload cancelled'))
        })

        xhr.open('PUT', uploadUrl)
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.send(file)
      })

      setUploading(false)

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
