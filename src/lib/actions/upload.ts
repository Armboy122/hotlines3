'use server'

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
})

const BUCKET_NAME = process.env.R2_BUCKET_NAME || ''
const PUBLIC_URL = process.env.R2_PUBLIC_URL || ''

interface GetPresignedUrlInput {
  fileName: string
  fileType: string
}

interface PresignedUrlData {
  uploadUrl: string
  fileUrl: string
  fileKey: string
}

interface GetPresignedUrlResult {
  success: boolean
  data?: PresignedUrlData
  error?: string
}

/**
 * สร้าง presigned URL สำหรับอัปโหลดไฟล์ไปยัง Cloudflare R2
 */
export async function getPresignedUrl(
  input: GetPresignedUrlInput
): Promise<GetPresignedUrlResult> {
  try {
    const { fileName, fileType } = input

    if (!fileName || !fileType) {
      return {
        success: false,
        error: 'Missing fileName or fileType',
      }
    }

    // Generate a unique file key with timestamp
    const timestamp = Date.now()
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
    const fileKey = `uploads/${timestamp}-${sanitizedFileName}`

    // Create the command for presigned URL
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType,
    })

    // Generate presigned URL (valid for 1 hour)
    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    })

    // Construct the public URL for the uploaded file
    const fileUrl = `${PUBLIC_URL}/${fileKey}`

    return {
      success: true,
      data: {
        uploadUrl,
        fileUrl,
        fileKey,
      },
    }
  } catch (error) {
    console.error('[getPresignedUrl] Error:', error)
    return {
      success: false,
      error: 'Failed to generate presigned URL',
    }
  }
}
