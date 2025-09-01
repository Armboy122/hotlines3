# Cloudflare R2 Setup Guide

## 🚀 การตั้งค่า Cloudflare R2 สำหรับเก็บรูปภาพ

### 1. สร้าง R2 Bucket

1. เข้าไปที่ [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. เลือก R2 Object Storage จากเมนูซ้าย
3. คลิก "Create bucket"
4. ตั้งชื่อ bucket (เช่น `hotline-images`)
5. เลือก region ที่ใกล้ที่สุด

### 2. สร้าง API Token

1. ไปที่ R2 → Manage R2 API tokens
2. คลิก "Create API token"
3. เลือก permissions: `Object Read & Write`
4. เลือก bucket ที่สร้างไว้
5. คัดลอก Access Key ID และ Secret Access Key

### 3. ตั้งค่า API Token

**ข้อมูล Bucket ที่สร้างแล้ว:**
- Account ID: `8605ba5178c4d6a945aec62c38a12241`
- Bucket Name: `storagehotline`
- Public URL: `https://pub-8605ba5178c4d6a945aec62c38a12241.r2.dev`

**สร้าง API Token:**
1. ไปที่ Cloudflare Dashboard → R2 → Manage R2 API tokens
2. Create API token ด้วย permissions: Object Read & Write
3. เลือก bucket: `storagehotline`
4. คัดลอก Access Key ID และ Secret Access Key
5. แทนที่ในไฟล์ `src/lib/r2.ts`

📖 **ดูคำแนะนำละเอียดใน:** `R2_TOKEN_SETUP.md`

### 4. การหา Account ID

1. ไปที่ Cloudflare Dashboard
2. เลือก domain หรือ account ใดๆ
3. ดูที่ sidebar ขวา จะมี Account ID

### 5. ตั้งค่า Public Access (ถ้าต้องการ)

1. ไปที่ R2 bucket ที่สร้าง
2. เลือกแท็บ "Settings"
3. ใน "Public access" ให้เปิดใช้งาน
4. หรือตั้งค่า Custom Domain สำหรับ CDN

## 📝 การใช้งาน

### 1. อัพโหลดรูปผ่าน Server Action

```typescript
import { uploadImage } from '@/lib/actions/upload'

const formData = new FormData()
formData.append('file', file)

const result = await uploadImage(formData)
if (result.success) {
  console.log('File URL:', result.data.url)
}
```

### 2. ใช้งาน ImageUpload Component

```tsx
import { ImageUpload } from '@/components/ui/image-upload'

function MyForm() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  return (
    <ImageUpload
      value={imageUrl}
      onChange={setImageUrl}
      label="อัพโหลดรูป"
      maxSize={5} // 5MB
    />
  )
}
```

### 3. ใช้งาน useUpload Hook

```tsx
import { useUpload } from '@/hooks/useUpload'

function MyComponent() {
  const { upload, uploading } = useUpload()

  const handleFileSelect = async (file: File) => {
    const result = await upload(file)
    if (result.success) {
      console.log('Upload success:', result.data.url)
    }
  }

  return (
    <div>
      {uploading && <div>กำลังอัพโหลด...</div>}
      <input type="file" onChange={(e) => {
        const file = e.target.files?.[0]
        if (file) handleFileSelect(file)
      }} />
    </div>
  )
}
```

## 🔧 ฟีเจอร์ที่มี

- ✅ อัพโหลดรูปไปยัง Cloudflare R2 ผ่าน Server Actions
- ✅ สร้างชื่อไฟล์ที่ unique อัตโนมัติ
- ✅ ตรวจสอบประเภทไฟล์ (รองรับเฉพาะรูป)
- ✅ จำกัดขนาดไฟล์ (สูงสุด 5MB)
- ✅ Preview รูปก่อนอัพโหลด
- ✅ ลบรูปออกจาก R2
- ✅ Component พร้อมใช้งาน
- ✅ Hook สำหรับใช้งานแบบ custom
- ✅ ใช้ Server Actions แทน API Routes (ปลอดภัยกว่า)

## 🧪 ทดสอบการใช้งาน

เข้าไปที่ `/test-upload` เพื่อทดสอบการอัพโหลดรูป

## 💡 Tips

1. **Custom Domain**: ควรตั้งค่า Custom Domain สำหรับ CDN เพื่อความเร็วในการโหลดรูป
2. **Image Optimization**: สามารถใช้ Cloudflare Image Resizing ร่วมกับ R2 ได้
3. **Backup**: ควรตั้งค่า backup policy สำหรับ bucket
4. **Security**: ควรจำกัด CORS policy ให้เหมาะสม

## 🚨 ข้อควรระวัง

- API Token ต้องเก็บเป็นความลับ
- ตรวจสอบ billing limit ของ Cloudflare
- ตั้งค่า rate limiting สำหรับ API endpoint
- ควรมี validation เพิ่มเติมสำหรับการใช้งานจริง
