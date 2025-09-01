'use server'

import { uploadToR2, generateUniqueFileName, isValidImageType, fileToBuffer } from '@/lib/r2'

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

/**
 * Server Action สำหรับอัพโหลดรูปไปยัง Cloudflare R2
 * @param formData - FormData ที่มีไฟล์รูป
 * @returns UploadResult
 */
export async function uploadImage(formData: FormData): Promise<UploadResult> {
  try {
    const file = formData.get('file') as File

    if (!file) {
      return {
        success: false,
        error: 'ไม่พบไฟล์ที่ต้องการอัพโหลด'
      }
    }

    // ตรวจสอบประเภทไฟล์
    if (!isValidImageType(file.type)) {
      return {
        success: false,
        error: 'ประเภทไฟล์ไม่ถูกต้อง รองรับเฉพาะรูปภาพ (JPG, PNG, WebP, GIF)'
      }
    }

    // ตรวจสอบขนาดไฟล์ (จำกัดที่ 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'ขนาดไฟล์ใหญ่เกินไป สูงสุด 5MB'
      }
    }

    // แปลง File เป็น Buffer
    const buffer = await fileToBuffer(file)

    // สร้างชื่อไฟล์ที่ unique
    const fileName = generateUniqueFileName(file.name, 'images/')

    // อัพโหลดไปยัง R2
    const fileUrl = await uploadToR2(buffer, fileName, file.type)

    return {
      success: true,
      data: {
        url: fileUrl,
        fileName: fileName,
        originalName: file.name,
        size: file.size,
        type: file.type
      }
    }

  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'การอัพโหลดล้มเหลว'
    }
  }
}

/**
 * Server Action สำหรับลบรูปจาก Cloudflare R2
 * @param fileName - ชื่อไฟล์ที่ต้องการลบ
 * @returns boolean
 */
export async function deleteImage(fileName: string): Promise<{ success: boolean; error?: string }> {
  try {
    // ลบไฟล์จาก R2
    const { deleteFromR2 } = await import('@/lib/r2')
    await deleteFromR2(fileName)

    return { success: true }
  } catch (error) {
    console.error('Delete error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'การลบไฟล์ล้มเหลว'
    }
  }
}
