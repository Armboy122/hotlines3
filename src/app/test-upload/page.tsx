'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageUpload } from '@/components/ui/image-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function TestUploadPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [testData, setTestData] = useState({
    title: '',
    description: '',
    imageUrl: ''
  })

  const handleImageChange = (url: string | null) => {
    setImageUrl(url)
    setTestData(prev => ({ ...prev, imageUrl: url || '' }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form Data:', testData)
    alert('ดูข้อมูลใน Console (F12)')
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>ทดสอบการอัพโหลดรูปไปยัง Cloudflare R2</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title Field */}
              <div>
                <Label htmlFor="title">ชื่อเรื่อง</Label>
                <Input
                  id="title"
                  value={testData.title}
                  onChange={(e) => setTestData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="กรอกชื่อเรื่อง"
                />
              </div>

              {/* Description Field */}
              <div>
                <Label htmlFor="description">รายละเอียด</Label>
                <Input
                  id="description"
                  value={testData.description}
                  onChange={(e) => setTestData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="กรอกรายละเอียด"
                />
              </div>

              {/* Image Upload */}
              <ImageUpload
                value={imageUrl || undefined}
                onChange={handleImageChange}
                label="รูปภาพ"
                maxSize={5}
              />

              {/* Current Image URL */}
              {imageUrl && (
                <div className="p-4 bg-gray-100 rounded-md">
                  <Label className="text-sm font-medium text-gray-700">URL ของรูป:</Label>
                  <div className="mt-1 text-sm text-blue-600 break-all">
                    {imageUrl}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full">
                บันทึกข้อมูล
              </Button>
            </form>

            {/* Instructions */}
            <div className="mt-8 p-4 bg-blue-50 rounded-md">
              <h3 className="font-semibold text-blue-900 mb-2">การใช้งาน Server Actions สำหรับอัพโหลดรูป:</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>ใช้ Server Actions แทน API Routes</li>
                <li>ไม่มี Progress Bar (ข้อจำกัดของ Server Actions)</li>
                <li>การอัพโหลดจะเร็วและปลอดภัยกว่า</li>
                <li>รองรับไฟล์รูปขนาดสูงสุด 5MB</li>
              </ul>
              <div className="mt-3 p-3 bg-white rounded border text-xs font-mono">
                R2_ACCOUNT_ID=your_account_id<br />
                R2_ACCESS_KEY_ID=your_access_key<br />
                R2_SECRET_ACCESS_KEY=your_secret_key<br />
                R2_BUCKET_NAME=your_bucket_name<br />
                R2_PUBLIC_URL=https://your-bucket.your-account.r2.cloudflarestorage.com
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
