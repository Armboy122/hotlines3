import { useState } from 'react'
import { monthlyPlanService } from '@/lib/services/monthly-plan.service'

interface PlanUploadResult {
  success: boolean
  data?: {
    fileKey: string
    fileURL: string
    originalName: string
    fileSizeBytes: number
  }
  error?: string
}

interface UsePlanUploadReturn {
  uploadPlan: (year: number, month: number, file: File) => Promise<PlanUploadResult>
  uploading: boolean
  progress: number
  reset: () => void
}

export function usePlanUpload(): UsePlanUploadReturn {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const reset = () => {
    setUploading(false)
    setProgress(0)
  }

  const uploadPlan = async (
    year: number,
    month: number,
    file: File
  ): Promise<PlanUploadResult> => {
    if (file.type !== 'application/pdf') {
      return { success: false, error: 'รองรับเฉพาะไฟล์ PDF เท่านั้น' }
    }

    setUploading(true)
    setProgress(0)

    try {
      // Step 1: Get presigned URL
      const presign = await monthlyPlanService.presignUpload(year, month, {
        fileName: file.name,
        fileType: file.type,
      })

      const { uploadUrl, fileUrl, fileKey } = presign

      if (!uploadUrl || !fileUrl || !fileKey) {
        throw new Error('โครงสร้างข้อมูล presigned URL ไม่ถูกต้อง')
      }

      // Step 2: Upload binary to R2 via XHR (progress tracking)
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded / event.total) * 100))
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

        xhr.addEventListener('error', () =>
          reject(new Error('Network error — ไม่สามารถเชื่อมต่อกับ storage ได้'))
        )
        xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')))

        xhr.open('PUT', uploadUrl)
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.send(file)
      })

      setUploading(false)

      return {
        success: true,
        data: {
          fileKey,
          fileURL: fileUrl,
          originalName: file.name,
          fileSizeBytes: file.size,
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

  return { uploadPlan, uploading, progress, reset }
}
