import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

type R2Config = {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucketName: string
  publicUrl: string
}

let cachedConfig: R2Config | null = null
let cachedClient: S3Client | null = null

function getR2Config(): R2Config {
  if (cachedConfig) return cachedConfig

  const {
    R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME,
    R2_PUBLIC_URL,
  } = process.env

  const missing = [
    ['R2_ACCOUNT_ID', R2_ACCOUNT_ID],
    ['R2_ACCESS_KEY_ID', R2_ACCESS_KEY_ID],
    ['R2_SECRET_ACCESS_KEY', R2_SECRET_ACCESS_KEY],
    ['R2_BUCKET_NAME', R2_BUCKET_NAME],
    ['R2_PUBLIC_URL', R2_PUBLIC_URL],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key)

  if (missing.length) {
    throw new Error(`Missing required R2 env variables: ${missing.join(', ')}`)
  }

  cachedConfig = {
    accountId: R2_ACCOUNT_ID!,
    accessKeyId: R2_ACCESS_KEY_ID!,
    secretAccessKey: R2_SECRET_ACCESS_KEY!,
    bucketName: R2_BUCKET_NAME!,
    publicUrl: R2_PUBLIC_URL!.replace(/\/$/, ''),
  }

  return cachedConfig
}

function getR2Client(): S3Client {
  if (cachedClient) return cachedClient

  const config = getR2Config()
  cachedClient = new S3Client({
    region: 'auto',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  })

  return cachedClient
}

export async function createPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresInSeconds = 60,
): Promise<{ uploadUrl: string; fileUrl: string }> {
  const client = getR2Client()
  const config = getR2Config()

  const command = new PutObjectCommand({
    Bucket: config.bucketName,
    Key: key,
    ContentType: contentType,
  })

  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: expiresInSeconds,
  })

  return {
    uploadUrl,
    fileUrl: `${config.publicUrl}/${key}`,
  }
}

export async function uploadToR2(
  file: Buffer | Uint8Array, 
  key: string, 
  contentType: string
): Promise<string> {
  try {
    const client = getR2Client()
    const config = getR2Config()

    const command = new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      Body: file,
      ContentType: contentType,
    })

    await client.send(command)
    
    const fileUrl = `${config.publicUrl}/${key}`
    
    return fileUrl
  } catch (error) {
    console.error('Error uploading to R2:', error)
    throw new Error('Failed to upload file to R2')
  }
}

/**
 * ลบไฟล์จาก Cloudflare R2
 * @param key - ชื่อไฟล์ใน bucket (path/filename)
 * @returns Promise<void>
 */
export async function deleteFromR2(key: string): Promise<void> {
  try {
    const client = getR2Client()
    const config = getR2Config()

    const command = new DeleteObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    })

    await client.send(command)
  } catch (error) {
    console.error('Error deleting from R2:', error)
    throw new Error('Failed to delete file from R2')
  }
}

/**
 * สร้างชื่อไฟล์ที่ unique
 * @param originalName - ชื่อไฟล์ต้นฉบับ
 * @param prefix - prefix สำหรับจัดระเบียบไฟล์ (เช่น 'images/', 'documents/')
 * @returns string - ชื่อไฟล์ใหม่ที่ unique
 */
export function generateUniqueFileName(originalName: string, prefix: string = ''): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split('.').pop()
  
  return `${prefix}${timestamp}-${randomString}.${extension}`
}

/**
 * ตรวจสอบประเภทไฟล์ที่รองรับ
 * @param contentType - MIME type ของไฟล์
 * @returns boolean - true ถ้าเป็นไฟล์รูปภาพ
 */
export function isValidImageType(contentType: string): boolean {
  const validTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ]
  
  return validTypes.includes(contentType.toLowerCase())
}

/**
 * แปลง File object เป็น Buffer
 * @param file - File object จาก FormData
 * @returns Promise<Buffer>
 */
export async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
