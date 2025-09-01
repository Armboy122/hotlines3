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
      const formData = new FormData()
      formData.append('file', file)

      // ใช้ XMLHttpRequest เพื่อติดตาม progress
      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest()

        // ติดตาม progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100)
            setProgress(percentComplete)
          }
        })

        // เมื่ออัพโหลดเสร็จ
        xhr.addEventListener('load', () => {
          setUploading(false)
          setProgress(100)

          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText)
              resolve(response)
            } catch {
              resolve({ success: false, error: 'Invalid response format' })
            }
          } else {
            try {
              const error = JSON.parse(xhr.responseText)
              resolve({ success: false, error: error.error || 'Upload failed' })
            } catch {
              resolve({ success: false, error: `HTTP ${xhr.status}: Upload failed` })
            }
          }
        })

        // เมื่อเกิดข้อผิดพลาด
        xhr.addEventListener('error', () => {
          setUploading(false)
          setProgress(0)
          resolve({ success: false, error: 'Network error' })
        })

        // เมื่อยกเลิก
        xhr.addEventListener('abort', () => {
          setUploading(false)
          setProgress(0)
          resolve({ success: false, error: 'Upload cancelled' })
        })

        // เริ่มอัพโหลด
        xhr.open('POST', '/api/upload-progress')
        xhr.send(formData)
      })

    } catch (error) {
      setUploading(false)
      setProgress(0)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'การอัพโหลดล้มเหลว' 
      }
    }
  }

  return { 
    upload, 
    uploading, 
    progress 
  }
}
