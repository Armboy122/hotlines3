# HotlineS3 - ระบบจัดการข้อมูลพื้นฐาน

ระบบจัดการข้อมูลพื้นฐานสำหรับการไฟฟ้า พัฒนาด้วย Next.js 15, Prisma, และ PostgreSQL

## ฟีเจอร์หลัก

- 📱 **Progressive Web App (PWA)** - สามารถติดตั้งบนมือถือได้
- 🎯 **Responsive Design** - ใช้งานได้ทั้งเดสก์ท็อปและมือถือ
- 🗄️ **การจัดการข้อมูลพื้นฐาน** - จุดรวมงาน, การไฟฟ้า, สถานี, ฟีดเดอร์
- 📋 **การจัดการประเภทงาน** - ประเภทงานและรายละเอียดงาน
- 📅 **ระบบแผนงาน** - แผนฉีดน้ำ, ABS, บำรุงรักษา

## เทคโนโลยีที่ใช้

- **Frontend**: Next.js 15, React 19, TypeScript
- **Database**: PostgreSQL, Prisma ORM
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, Lucide React
- **PWA**: Service Worker, Web App Manifest

## การติดตั้งและรัน

### 1. Clone โปรเจค
```bash
git clone <repository-url>
cd hotline
```

### 2. ติดตั้ง Dependencies
```bash
npm install
```

### 3. ตั้งค่า Database
```bash
# สร้างไฟล์ .env และใส่ DATABASE_URL
echo "DATABASE_URL='postgresql://username:password@localhost:5432/hotline'" > .env

# รัน migration
npx prisma migrate dev
npx prisma generate
```

### 4. รัน Development Server
```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) ในเบราว์เซอร์

## การ Deploy บน Vercel

### ข้อกำหนดเบื้องต้น
- บัญชี Vercel
- PostgreSQL Database (แนะนำ: Neon, Supabase, หรือ Railway)

### ขั้นตอนการ Deploy

1. **เชื่อม Repository กับ Vercel**
   ```bash
   npm i -g vercel
   vercel login
   vercel
   ```

2. **ตั้งค่า Environment Variables ใน Vercel Dashboard**
   ```
   DATABASE_URL=postgresql://...
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### การตั้งค่า Database สำหรับ Production

1. สร้าง PostgreSQL database บน cloud provider
2. เพิ่ม `DATABASE_URL` ใน Vercel environment variables
3. รัน migration ใน production:
   ```bash
   npx prisma migrate deploy
   ```

## PWA Features

แอปนี้รองรับ Progressive Web App:

- 📱 **ติดตั้งบนมือถือ**: ผู้ใช้สามารถติดตั้งแอปจากเบราว์เซอร์
- 🔄 **Offline Support**: ใช้งานได้แม้ไม่มีอินเทอร์เน็ต (บางส่วน)
- 🚀 **Fast Loading**: Cache สำคัญทำให้โหลดเร็ว

## โครงสร้างโปรเจค

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # หน้าจัดการข้อมูล
│   ├── list/              # หน้ารายการ
│   └── layout.tsx         # Layout หลัก
├── components/            # React Components
│   ├── forms/             # ฟอร์มต่างๆ
│   ├── ui/                # UI Components
│   └── navbar.tsx         # Navigation
├── lib/                   # Utilities
│   ├── actions/           # Server Actions
│   └── prisma.ts          # Prisma Client
└── types/                 # TypeScript Types

prisma/
├── schema.prisma          # Database Schema
└── migrations/            # Database Migrations

public/
├── manifest.json          # PWA Manifest
├── sw.js                  # Service Worker
└── icons/                 # PWA Icons
```

## การพัฒนา

### คำสั่งที่สำคัญ
```bash
npm run dev          # รัน development server
npm run build        # build สำหรับ production
npm run start        # รัน production server
npm run lint         # ตรวจสอบ code style

npx prisma studio    # เปิด Prisma Studio
npx prisma generate  # สร้าง Prisma Client
npx prisma migrate   # รัน database migration
```

### การเพิ่มฟีเจอร์ใหม่
1. อัปเดต Prisma schema (ถ้าจำเป็น)
2. สร้าง migration: `npx prisma migrate dev`
3. เพิ่ม Server Actions ใน `src/lib/actions/`
4. สร้าง UI Components และ Forms
5. เพิ่มหน้าใน `src/app/`

## การแก้ไขปัญหา

### Database Connection
- ตรวจสอบ `DATABASE_URL` ใน `.env`
- ใน Vercel ตรวจสอบ Environment Variables

### PWA ไม่ทำงาน
- ตรวจสอบ `manifest.json` และ `sw.js` ใน `/public`
- ใช้ Developer Tools > Application > Service Workers

### Build Error
- รัน `npm run build` เพื่อตรวจสอบ errors
- ตรวจสอบ TypeScript types

## License

MIT License
