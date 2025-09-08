import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

// Cloudflare R2 Configuration
const R2_CONFIG = {
  accountId: '8605ba5178c4d6a945aec62c38a12241', // Account ID จาก wrangler whoami
  accessKeyId: process.env.R2_ACCESS_KEY_ID || '1bb8df36212e7e521eff2b1a304061e0', // ต้องสร้าง API Token
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '8225422f0850984838ed597ba493b88fc9b13a0c8786f2026576bf68ee4df3ff', // ต้องสร้าง API Token
  bucketName: 'storagehotline', // ใช้ bucket ใหม่
  publicUrl: 'https://photo.akin.love', // Public URL สำหรับ R2
}

// สร้าง S3 Client สำหรับ R2
const r2Client = new S3Client({
  region: 'auto', // R2 ใช้ 'auto' เป็น region
  endpoint: `https://${R2_CONFIG.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_CONFIG.accessKeyId,
    secretAccessKey: R2_CONFIG.secretAccessKey,
  },
})

/**
 * อัพโหลดไฟล์ไปยัง Cloudflare R2
 * @param file - File object หรือ Buffer
 * @param key - ชื่อไฟล์ใน bucket (path/filename)
 * @param contentType - MIME type ของไฟล์
 * @returns Promise<string> - URL ของไฟล์ที่อัพโหลด
 */
export async function uploadToR2(
  file: Buffer | Uint8Array, 
  key: string, 
  contentType: string
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: key,
      Body: file,
      ContentType: contentType,
      // ทำให้ไฟล์สามารถเข้าถึงได้แบบ public
      // หรือจะใช้ custom domain ก็ได้
    })

    await r2Client.send(command)
    
    // สร้าง URL สำหรับเข้าถึงไฟล์
    const fileUrl = `${R2_CONFIG.publicUrl}/${key}`
    
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
    const command = new DeleteObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: key,
    })

    await r2Client.send(command)
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
