# HotlineS3 - ระบบจัดการงานประจำวันการไฟฟ้า

## ภาพรวมโปรเจค

ระบบจัดการข้อมูลพื้นฐานและงานประจำวันสำหรับการไฟฟ้า พัฒนาด้วย Next.js 15 (App Router) + Elysia Backend + Prisma ORM + PostgreSQL

**คุณสมบัติหลัก:**
- 📱 Progressive Web App (PWA) - ติดตั้งบนมือถือได้
- 🎯 Responsive Design - รองรับทุกอุปกรณ์
- 🗄️ จัดการข้อมูลพื้นฐาน (Master Data)
- 📋 จัดการงานประจำวัน (Task Daily)
- 📊 Dashboard และรายงาน
- 📸 อัปโหลดรูปภาพพร้อม GPS
- 🗺️ แสดงตำแหน่งงานบนแผนที่

## เทคโนโลยีที่ใช้

### Frontend
- **Framework**: Next.js 15.4.6 (App Router, React 19, TypeScript 5)
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI, Lucide React
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form
- **Maps**: Leaflet, React Leaflet
- **PDF Generation**: jsPDF + jsPDF-AutoTable
- **Date**: date-fns, react-day-picker

### Backend
- **API Framework**: Elysia 1.4.16 (Bun-first web framework)
- **ORM**: Prisma 6.14.0
- **Database**: PostgreSQL (Neon/Supabase/Railway)
- **File Upload**: AWS S3 (@aws-sdk/client-s3)
- **CORS**: @elysiajs/cors

### Package Manager
- **Bun** (bun.lock มีอยู่ในโปรเจค)
- แม้ package.json จะระบุ `packageManager: yarn` แต่โปรเจคใช้ Bun จริง

---

## โครงสร้างโปรเจค

```
hotline/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
│
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   ├── icons/                 # PWA icons
│   └── fonts/                 # Custom fonts
│
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── admin/            # Admin pages
│   │   │   ├── dashboard/    # Dashboard หน้าหลัก
│   │   │   ├── feeders/      # จัดการฟีดเดอร์
│   │   │   ├── stations/     # จัดการสถานี
│   │   │   ├── peas/         # จัดการการไฟฟ้า
│   │   │   ├── operation-centers/  # จัดการจุดรวมงาน
│   │   │   ├── job-types/    # จัดการประเภทงาน
│   │   │   ├── job-details/  # จัดการรายละเอียดงาน
│   │   │   └── task-daily/   # จัดการงานประจำวัน
│   │   ├── list/             # หน้ารายการงาน
│   │   ├── layout.tsx        # Root layout
│   │   └── api/[[...slugs]]/route.ts  # Elysia API handler
│   │
│   ├── components/
│   │   ├── ui/               # Base UI components (shadcn/ui)
│   │   ├── forms/            # Form components
│   │   ├── dashboard/        # Dashboard components
│   │   ├── navbar.tsx        # Navigation bar
│   │   └── theme-provider.tsx
│   │
│   ├── features/
│   │   └── task-daily/       # Task Daily feature modules
│   │       └── components/
│   │
│   ├── lib/
│   │   ├── actions/          # Server Actions
│   │   │   ├── feeder.ts
│   │   │   ├── station.ts
│   │   │   ├── pea.ts
│   │   │   ├── operation-center.ts
│   │   │   ├── job-type.ts
│   │   │   ├── job-detail.ts
│   │   │   ├── task-daily.ts
│   │   │   └── team.ts
│   │   ├── prisma.ts         # Prisma client singleton
│   │   └── utils.ts          # Utilities (cn, etc.)
│   │
│   ├── hooks/
│   │   └── useUpload.ts      # S3 upload hook
│   │
│   ├── server/               # Elysia Backend
│   │   ├── elysia.ts        # Main Elysia app
│   │   ├── routes/          # API routes
│   │   │   ├── dashboard.ts
│   │   │   ├── tasks.ts
│   │   │   ├── upload.ts
│   │   │   ├── feeders.ts
│   │   │   ├── stations.ts
│   │   │   ├── peas.ts
│   │   │   ├── operation-centers.ts
│   │   │   ├── job-types.ts
│   │   │   ├── job-details.ts
│   │   │   └── teams.ts
│   │   ├── services/        # Business logic
│   │   │   └── dashboard.service.ts
│   │   └── repositories/    # Data access layer
│   │
│   ├── types/
│   │   ├── api.ts           # API response types
│   │   ├── form.ts          # Form types
│   │   ├── query-types.ts   # React Query types
│   │   └── task-daily.ts    # Task Daily types
│   │
│   └── generated/
│       └── prisma/          # Generated Prisma Client
│
├── .env                     # Environment variables (local)
├── .env.production          # Production env vars
├── package.json
├── bun.lock                 # Bun lockfile
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── vercel.json              # Vercel config
```

---

## Elysia Backend Architecture

### การทำงานของ Elysia ใน Next.js

โปรเจคนี้ใช้ **Elysia** เป็น API framework ทำงานใน Next.js Route Handler:

```typescript
// src/app/api/[[...slugs]]/route.ts
import { app } from '@/server/elysia'

export const GET = app.handle
export const POST = app.handle
export const PUT = app.handle
export const DELETE = app.handle
export const PATCH = app.handle
```

### Elysia App Structure

```typescript
// src/server/elysia.ts
import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'

export const app = new Elysia({ prefix: '/api' })
    .use(cors())
    .get('/health', () => ({ status: 'ok' }))
    .use(dashboardRoutes)
    .use(tasksRoutes)
    .use(uploadRoutes)
    .use(feedersRoutes)
    // ... other routes

export type App = typeof app
```

### Type-Safe API Client

**Elysia มี Type Safety แบบ End-to-End** ซึ่งสามารถ export type และใช้ใน frontend ได้เลย:

```typescript
// Export type from backend
export type App = typeof app

// Use in frontend with edenTreaty (optional)
import { edenTreaty } from '@elysiajs/eden'
import type { App } from '@/server/elysia'

const client = edenTreaty<App>('http://localhost:3000')
const response = await client.api.feeders.get()
```

**ตัวอย่าง Route Structure:**

```typescript
// src/server/routes/feeders.ts
import { Elysia, t } from 'elysia'
import { prisma } from '@/lib/prisma'

export const feedersRoutes = new Elysia({ prefix: '/feeders' })
    .get('/', async () => {
        const feeders = await prisma.feeder.findMany({
            include: { station: { include: { operationCenter: true } } }
        })
        return { success: true, data: feeders }
    })
    .get('/:id', async ({ params, set }) => {
        const feeder = await prisma.feeder.findUnique({
            where: { id: BigInt(params.id) }
        })
        if (!feeder) {
            set.status = 404
            return { success: false, error: 'Not found' }
        }
        return { success: true, data: feeder }
    })
    .post('/', async ({ body }) => {
        const feeder = await prisma.feeder.create({ data: body })
        return { success: true, data: feeder }
    }, {
        body: t.Object({
            code: t.String(),
            stationId: t.String()
        })
    })
```

### API Endpoints

**Base URL**: `/api`

#### Master Data APIs
- `GET /api/feeders` - ดึงข้อมูลฟีดเดอร์ทั้งหมด
- `GET /api/feeders/:id` - ดึงข้อมูลฟีดเดอร์ตาม ID
- `POST /api/feeders` - สร้างฟีดเดอร์ใหม่
- `PUT /api/feeders/:id` - อัปเดตฟีดเดอร์
- `DELETE /api/feeders/:id` - ลบฟีดเดอร์

*โครงสร้างเดียวกันกับ:*
- `/api/stations` - สถานี
- `/api/peas` - การไฟฟ้า
- `/api/operation-centers` - จุดรวมงาน
- `/api/job-types` - ประเภทงาน
- `/api/job-details` - รายละเอียดงาน
- `/api/teams` - ทีม

#### Task Daily APIs
- `GET /api/tasks` - ดึงงานประจำวัน (รองรับ filters)
- `GET /api/tasks/:id` - ดึงงานตาม ID
- `POST /api/tasks` - สร้างงานใหม่
- `PUT /api/tasks/:id` - อัปเดตงาน
- `DELETE /api/tasks/:id` - ลบงาน

#### Upload API
- `POST /api/upload` - อัปโหลดไฟล์ไป S3

#### Dashboard API
- `GET /api/dashboard/stats` - สถิติ dashboard
- `GET /api/dashboard/team-performance` - ประสิทธิภาพทีม
- `GET /api/dashboard/job-distribution` - การกระจายงาน

---

## Database Schema (Prisma)

### Core Models

```prisma
// จุดรวมงาน (Operation Center)
model OperationCenter {
  id       BigInt   @id @default(autoincrement())
  name     String
  peas     Pea[]
  stations Station[]
}

// การไฟฟ้า (PEA)
model Pea {
  id              BigInt @id @default(autoincrement())
  shortname       String
  fullname        String
  operationId     BigInt
  operationCenter OperationCenter @relation(...)
}

// สถานี (Station)
model Station {
  id              BigInt @id @default(autoincrement())
  name            String
  codeName        String @unique
  operationId     BigInt
  operationCenter OperationCenter @relation(...)
  feeders         Feeder[]
}

// ฟีดเดอร์ (Feeder)
model Feeder {
  id        BigInt @id @default(autoincrement())
  code      String @unique
  stationId BigInt
  station   Station @relation(...)
  tasks     TaskDaily[]
}

// ประเภทงาน (Job Type)
model JobType {
  id         BigInt @id @default(autoincrement())
  name       String @unique
  tasks      TaskDaily[]
  jobDetails JobDetail[]
}

// รายละเอียดงาน (Job Detail)
model JobDetail {
  id        BigInt @id @default(autoincrement())
  name      String @unique
  jobTypeId BigInt?
  jobType   JobType? @relation(...)
  tasks     TaskDaily[]
}

// งานประจำวัน (Task Daily)
model TaskDaily {
  id          BigInt   @id @default(autoincrement())
  workDate    DateTime @db.Date
  teamId      BigInt
  jobTypeId   BigInt
  jobDetailId BigInt
  detail      String?
  feederId    BigInt?
  numPole     String?
  deviceCode  String?
  urlsBefore  String[]    // Array of image URLs
  urlsAfter   String[]    // Array of image URLs
  latitude    Decimal?    @db.Decimal(9, 6)
  longitude   Decimal?    @db.Decimal(9, 6)

  team        Team        @relation(...)
  jobType     JobType     @relation(...)
  jobDetail   JobDetail   @relation(...)
  feeder      Feeder?     @relation(...)

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  deletedAt   DateTime?
}

// ทีม (Team)
model Team {
  id    BigInt @id @default(autoincrement())
  name  String
  tasks TaskDaily[]
}
```

### การใช้งาน Prisma

```bash
# Generate Prisma Client
bun prisma generate

# Create migration
bun prisma migrate dev --name migration_name

# Apply migrations (production)
bun prisma migrate deploy

# Open Prisma Studio
bun prisma studio

# Reset database (ระวัง: ลบข้อมูลทั้งหมด)
bun prisma migrate reset
```

---

## การติดตั้งและรัน

### ข้อกำหนดเบื้องต้น
- **Bun** >= 1.0 (ติดตั้ง: `curl -fsSL https://bun.sh/install | bash`)
- **PostgreSQL** database
- **AWS S3** bucket (สำหรับอัปโหลดรูป)

### 1. Clone และติดตั้ง Dependencies

```bash
git clone <repository-url>
cd hotline
bun install
```

### 2. ตั้งค่า Environment Variables

สร้างไฟล์ `.env`:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/hotline"

# AWS S3
AWS_REGION="ap-southeast-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET_NAME="your-bucket-name"

# Next.js
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### 3. ตั้งค่า Database

```bash
# รัน migrations
bun prisma migrate dev

# Generate Prisma Client
bun prisma generate

# (Optional) Seed database
bun prisma db seed
```

### 4. รัน Development Server

```bash
bun run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

### 5. คำสั่งอื่นๆ

```bash
# Build for production
bun run build

# Start production server
bun run start

# Lint code
bun run lint

# Prisma Studio
bun prisma studio
```

---

## การ Deploy

### Deploy บน Vercel

#### 1. เตรียม Database
- สร้าง PostgreSQL database บน **Neon**, **Supabase**, หรือ **Railway**
- คัดลอก `DATABASE_URL`

#### 2. Deploy ไป Vercel

```bash
# ติดตั้ง Vercel CLI
bun install -g vercel

# Login
vercel login

# Deploy
vercel
```

#### 3. ตั้งค่า Environment Variables

ใน Vercel Dashboard > Settings > Environment Variables:
```
DATABASE_URL=postgresql://...
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET_NAME=...
NEXT_PUBLIC_API_URL=https://your-app.vercel.app
```

#### 4. รัน Migrations

```bash
# Deploy migrations to production
bunx prisma migrate deploy
```

#### 5. Deploy Production

```bash
vercel --prod
```

### ตั้งค่า CORS สำหรับ S3

ถ้าใช้ S3 direct upload ต้องตั้งค่า CORS ใน S3 bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://your-app.vercel.app"],
    "ExposeHeaders": ["ETag"]
  }
]
```

---

## PWA Features

แอปนี้รองรับ Progressive Web App:

### การติดตั้งบนมือถือ
1. เปิดแอปในเบราว์เซอร์มือถือ
2. กด "Add to Home Screen" หรือ "ติดตั้ง"
3. แอปจะถูกติดตั้งเหมือน native app

### Service Worker
- Cache static assets
- Offline fallback
- ดู: `public/sw.js`

### Manifest
- ไอคอนและสี theme
- ชื่อแอปและคำอธิบาย
- ดู: `public/manifest.json`

---

## การพัฒนาและแก้ไข

### เพิ่ม Master Data ใหม่

**1. อัปเดต Prisma Schema**
```prisma
// prisma/schema.prisma
model NewMaster {
  id   BigInt @id @default(autoincrement())
  name String @unique
}
```

**2. สร้าง Migration**
```bash
bun prisma migrate dev --name add_new_master
```

**3. สร้าง Elysia Routes**
```typescript
// src/server/routes/new-master.ts
import { Elysia, t } from 'elysia'
import { prisma } from '@/lib/prisma'

export const newMasterRoutes = new Elysia({ prefix: '/new-master' })
    .get('/', async () => {
        const data = await prisma.newMaster.findMany()
        return { success: true, data }
    })
    .post('/', async ({ body }) => {
        const data = await prisma.newMaster.create({ data: body })
        return { success: true, data }
    }, {
        body: t.Object({ name: t.String() })
    })
```

**4. เพิ่มใน Elysia App**
```typescript
// src/server/elysia.ts
import { newMasterRoutes } from './routes/new-master'

export const app = new Elysia({ prefix: '/api' })
    .use(newMasterRoutes)
    // ...
```

**5. สร้าง Server Actions**
```typescript
// src/lib/actions/new-master.ts
'use server'

export async function getNewMasters() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/new-master`)
  return res.json()
}
```

**6. สร้าง UI**
- สร้างหน้าใน `src/app/admin/new-master/page.tsx`
- สร้างฟอร์มใน `src/components/forms/new-master-form.tsx`

### เพิ่ม Field ใหม่ใน TaskDaily

**1. อัปเดต Prisma Schema**
```prisma
model TaskDaily {
  // existing fields...
  newField String?
}
```

**2. Migration**
```bash
bun prisma migrate dev --name add_new_field
```

**3. อัปเดต Types**
```typescript
// src/types/task-daily.ts
export interface TaskDailyFormData {
  // existing fields...
  newField?: string
}
```

**4. อัปเดตฟอร์ม**
- เพิ่ม field ใน `src/features/task-daily/components/task-daily-form.tsx`

### ใช้ Elysia Types ใน Frontend

```typescript
// Backend: export type
export const app = new Elysia()
    .get('/users/:id', ({ params }) => {
        return { id: params.id, name: 'John' }
    })

export type App = typeof app

// Frontend: infer types
import type { App } from '@/server/elysia'
import { edenTreaty } from '@elysiajs/eden'

const client = edenTreaty<App>('http://localhost:3000')

// TypeScript จะรู้ response type อัตโนมัติ
const { data } = await client.api.users({ id: '1' }).get()
// data: { id: string; name: string }
```

---

## Common Issues และวิธีแก้

### 1. Prisma Generate ไม่ทำงาน
```bash
# ลบ node_modules และ reinstall
rm -rf node_modules bun.lock
bun install
bun prisma generate
```

### 2. Database Connection Error
- ตรวจสอบ `DATABASE_URL` ใน `.env`
- ตรวจสอบว่า PostgreSQL ทำงานอยู่
- ตรวจสอบ firewall/network

### 3. BigInt Serialization Error
```typescript
// Serialize BigInt before returning
JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
))
```

### 4. Elysia Type Import Error
```typescript
// ใช้ type import
import type { App } from '@/server/elysia'
```

### 5. S3 Upload Error
- ตรวจสอบ AWS credentials
- ตรวจสอบ S3 CORS configuration
- ตรวจสอบ bucket permissions

### 6. Build Error: "Module not found"
```bash
# Clear Next.js cache
rm -rf .next
bun run build
```

### 7. Lint Warnings: `any` types
- ใช้ proper types จาก Prisma Client
- Import types จาก `@/types/api`
- ใช้ Elysia schema validation (`t.Object`, `t.String`, etc.)

---

## Best Practices

### 1. Type Safety
- **ห้ามใช้ `any`** ให้ใช้ proper types
- ใช้ Prisma types: `Prisma.FeederCreateInput`, etc.
- ใช้ Elysia validation schema

### 2. Error Handling
```typescript
.get('/', async ({ set }) => {
    try {
        const data = await prisma.model.findMany()
        return { success: true, data }
    } catch (error) {
        set.status = 500
        return { success: false, error: 'Internal server error' }
    }
})
```

### 3. API Response Format
```typescript
// Success
{ success: true, data: any }

// Error
{ success: false, error: string }
```

### 4. Server Actions
- ใส่ `'use server'` ข้างบน
- ใช้ `revalidatePath()` หลัง mutation
- Handle errors properly

### 5. React Query
```typescript
const { data, isLoading } = useQuery({
    queryKey: ['feeders'],
    queryFn: getFeeders
})
```

### 6. Form Handling
- ใช้ React Hook Form + Zod validation
- แสดง error messages
- Disable submit ขณะ loading

---

## Performance Optimization

### 1. Prisma Query Optimization
```typescript
// ใช้ select เฉพาะ fields ที่ต้องการ
const feeders = await prisma.feeder.findMany({
    select: {
        id: true,
        code: true,
        station: { select: { name: true } }
    }
})

// ใช้ include กับ relation ที่จำเป็นเท่านั้น
```

### 2. Next.js Optimization
- ใช้ `loading.tsx` สำหรับ loading states
- ใช้ `error.tsx` สำหรับ error boundaries
- ใช้ dynamic imports สำหรับ heavy components

### 3. React Query Caching
```typescript
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 10 * 60 * 1000, // 10 minutes
        }
    }
})
```

---

## Testing

### Unit Tests (Future)
```bash
bun test
```

### API Testing
```bash
# ใช้ Postman, Insomnia, หรือ curl
curl http://localhost:3000/api/health
```

### Database Testing
```bash
# ใช้ Prisma Studio
bun prisma studio
```

---

## Contributing

### Commit Convention
```
feat: เพิ่มฟีเจอร์ใหม่
fix: แก้ไข bug
refactor: ปรับโครงสร้างโค้ด
docs: อัปเดต documentation
style: แก้ไข formatting
test: เพิ่ม tests
chore: งานอื่นๆ (dependencies, config)
```

### Branch Strategy
```
main          - Production
develop       - Development
feature/*     - Features
bugfix/*      - Bug fixes
```

---

## Resources

### Documentation
- [Next.js 15](https://nextjs.org/docs)
- [Elysia](https://elysiajs.com)
- [Prisma](https://www.prisma.io/docs)
- [Bun](https://bun.sh/docs)
- [Tailwind CSS 4](https://tailwindcss.com/docs)
- [TanStack Query](https://tanstack.com/query)

### Tools
- [Prisma Studio](https://www.prisma.io/studio) - Database GUI
- [Vercel](https://vercel.com) - Hosting
- [Neon](https://neon.tech) - Serverless Postgres

---

## License

MIT License

---

## Changelog

### v0.1.0 (Current)
- ระบบจัดการข้อมูลพื้นฐาน (Master Data)
- ระบบงานประจำวัน (Task Daily)
- Dashboard และรายงาน
- อัปโหลดรูปภาพ + GPS
- PWA support
- Elysia backend integration

---

**พัฒนาโดย**: ทีมพัฒนา HotlineS3
**อัปเดตล่าสุด**: 2025-01-21
