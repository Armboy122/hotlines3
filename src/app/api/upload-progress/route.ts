import { NextRequest, NextResponse } from 'next/server'
import { uploadToR2, generateUniqueFileName, isValidImageType, fileToBuffer } from '@/lib/r2'

export async function POST(request: NextRequest) {
  try {
    // ตรวจสอบ Content-Type
    const contentType = request.headers.get('content-type')
    if (!contentType?.includes('multipart/form-data')) {
      return NextResponse.json(
        { success: false, error: 'Content-Type must be multipart/form-data' },
        { status: 400 }
      )
    }

    // อ่านข้อมูลจาก FormData
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // ตรวจสอบประเภทไฟล์
    if (!isValidImageType(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      )
    }

    // ตรวจสอบขนาดไฟล์ (จำกัดที่ 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size too large. Maximum 5MB allowed.' },
        { status: 400 }
      )
    }

    // แปลง File เป็น Buffer
    const buffer = await fileToBuffer(file)

    // สร้างชื่อไฟล์ที่ unique
    const fileName = generateUniqueFileName(file.name, 'images/')

    // อัพโหลดไปยัง R2
    const fileUrl = await uploadToR2(buffer, fileName, file.type)

    return NextResponse.json({
      success: true,
      data: {
        url: fileUrl,
        fileName: fileName,
        originalName: file.name,
        size: file.size,
        type: file.type
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      },
      { status: 500 }
    )
  }
}

// GET endpoint สำหรับทดสอบ
export async function GET() {
  return NextResponse.json({
    message: 'Upload Progress API is working',
    supportedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    maxSize: '5MB'
  })
}
