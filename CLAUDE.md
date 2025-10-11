# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ภาพรวมโครงการ

HotlineS3 เป็นระบบจัดการงานบำรุงรักษาสาธารณูปโภคที่พัฒนาด้วย Next.js 15 โดยเน้นงานบำรุงรักษาโครงสร้างพื้นฐานไฟฟ้า แอปนี้ประกอบด้วย 2 ส่วนหลัก:
1. **Mobile App** - ระบบบันทึกข้อมูลบนมือถือสำหรับพนักงานภาคสนาม
2. **Admin Panel** - ระบบจัดการข้อมูลพื้นฐานและดู Dashboard วิเคราะห์งาน

## เทคโนโลยีที่ใช้

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Database**: PostgreSQL พร้อม Prisma ORM
- **Styling**: Tailwind CSS v4, shadcn/ui components, Lucide Icons
- **UI Library**: Radix UI primitives ผ่าน shadcn/ui (New York style)
- **State Management**: React Query v5 (@tanstack/react-query)
- **File Storage**: AWS S3 (presigned URLs)
- **PDF Generation**: jsPDF + jspdf-autotable (รองรับภาษาไทย)
- **Development**: ESLint, Turbopack (dev mode)

## คำสั่งสำหรับการพัฒนา

```bash
# รัน development server ด้วย Turbopack
npm run dev

# Build แอปพลิเคชัน (รวม Prisma generate)
npm run build

# รัน production server
npm start

# ตรวจสอบ code style
npm run lint

# ตรวจสอบ TypeScript errors
npx tsc --noEmit

# สร้าง Prisma client (รันอัตโนมัติตอน postinstall)
prisma generate
```

## สถาปัตยกรรมโครงการ

### สถาปัตยกรรมฐานข้อมูล
Prisma schema (209 บรรทัด) กำหนดระบบจัดการสาธารณูปโภคที่ซับซ้อนดังนี้:

**โครงสร้างองค์กร:**
- `OperationCenter` (จุดรวมงาน) → `Pea` (การไฟฟ้า) → `Station` (สถานี) → `Feeder` (ฟีดเดอร์)

**การวางแผนงาน (5 ประเภท):**
- `PlanStationItem` - แผนงานสถานี
- `PlanLineItem` - แผนงานสาย
- `PlanAbsItem` - แผนงาน ABS
- `PlanConductorItem` - แผนงานสายส่ง
- `PlanCableCarItem` - แผนงานรถเคเบิล

**การจัดการงาน:**
- `JobType` → `JobDetail` (การจัดประเภทงานแบบ hierarchical)
- `Team` - ทีมงาน
- `TaskDaily` - งานประจำวัน (หน่วยหลักในการรายงานงาน พร้อมเชื่อมโยงแผนงาน, รูปภาพ, และข้อมูล metadata)

**Enum Types:**
- `VoltageLevel`: MID, HIGH
- `CableCarEfficiency`: PASSED, FAILED, NEEDS_MAINTENANCE

### โครงสร้างแอปพลิเคชัน

```
src/
├── app/                      # Next.js App Router
│   ├── page.tsx             # หน้าหลัก - ฟอร์มรายงานงาน (Mobile-first)
│   ├── list/                # หน้าดูรายการงาน + PDF Export
│   ├── admin/               # Admin Panel (14 หน้า)
│   │   ├── page.tsx         # หน้าหลัก Admin (Menu Hub)
│   │   ├── dashboard/       # วิเคราะห์งาน (Charts, Top 10, Matrix)
│   │   ├── operation-centers/  # จัดการจุดรวมงาน
│   │   ├── peas/            # จัดการการไฟฟ้า (CRUD + Bulk import)
│   │   ├── stations/        # จัดการสถานี
│   │   ├── feeders/         # จัดการฟีดเดอร์
│   │   ├── job-types/       # จัดการประเภทงาน
│   │   ├── job-details/     # จัดการรายละเอียดงาน
│   │   ├── task-daily/      # จัดการงานประจำวัน
│   │   ├── plan-stations/   # จัดการแผนงานสถานี
│   │   ├── plan-lines/      # จัดการแผนงานสาย
│   │   ├── plan-abs/        # จัดการแผนงาน ABS
│   │   ├── plan-conductors/ # จัดการแผนงานสายส่ง
│   │   └── plan-cable-cars/ # จัดการแผนงานรถเคเบิล
│   └── api/                 # API Routes
│       ├── tasks/           # CRUD operations
│       └── upload-progress/ # Track upload status
├── components/
│   ├── ui/                  # shadcn/ui primitives (15 components)
│   ├── forms/               # Form components (13 forms)
│   ├── header.tsx           # Top navigation
│   ├── navbar.tsx           # Bottom mobile navigation
│   └── providers.tsx        # React Query Provider
├── lib/
│   ├── actions/             # Server Actions (18 files)
│   │   ├── index.ts         # Central export
│   │   ├── dashboard.ts     # Analytics queries
│   │   ├── task-daily.ts    # Task CRUD
│   │   ├── upload.ts        # S3 presigned URLs
│   │   └── [entity].ts      # CRUD for each entity
│   ├── prisma.ts            # Prisma client instance
│   └── pdf-generator.ts     # PDF report generation
├── hooks/
│   ├── useQueries.ts        # React Query hooks (18 hooks)
│   └── useUpload.ts         # File upload with progress
├── types/
│   └── query-types.ts       # TypeScript types for queries
├── config/
│   └── navigation.ts        # Navigation configuration
└── generated/
    └── prisma/              # Generated Prisma client
```

### การตั้งค่า Prisma
- Client สร้างไฟล์ไปที่ `src/generated/prisma/` (custom output path)
- ใช้ PostgreSQL เป็น datasource
- Binary targets: `["native", "rhel-openssl-3.0.x"]` สำหรับ deployment
- ESLint ไม่ตรวจสอบไฟล์ที่สร้างใน `src/generated/` และ `prisma/generated/`

### การจัดรูปแบบและ UI

**Design System - 3 สีหลัก:**
โปรเจคนี้ใช้ **สีเขียวเข้ม (Dark Green)**, **สีขาว (White)**, และ **สีเหลือง (Yellow)** เท่านั้น

#### Color Palette

**สีเขียวเข้ม (Primary Color):**
- `green-700` ถึง `green-950` - Headers, Primary buttons, Main text, Navigation active states
- `green-50` ถึง `green-200` - Light backgrounds, Borders, Subtle accents

**สีขาว (Base Color):**
- `white` - Card backgrounds, Input fields
- `gray-50` - Page backgrounds
- `gray-100` ถึง `gray-300` - Borders, Dividers

**สีเหลือง (Accent Color):**
- `yellow-400` ถึง `yellow-600` - Success states, Highlights, Important badges
- `yellow-50` ถึง `yellow-100` - Light accents, Hover states

#### การใช้งานสีในแต่ละส่วน

**Backgrounds:**
```
- Main background: bg-gradient-to-br from-green-50 to-yellow-50
- Cards: bg-white border-green-200
- Header: bg-white border-green-100
- Navigation: bg-white border-green-100
```

**Buttons:**
```
- Primary: bg-green-800 hover:bg-green-900 text-white
- Secondary: bg-yellow-500 hover:bg-yellow-600 text-green-900
- Ghost: text-green-700 hover:bg-green-50
```

**Text:**
```
- Headings: text-green-900
- Body: text-green-800
- Muted: text-green-600
- Labels: text-green-700
```

**Status & Badges:**
```
- Success: bg-yellow-500 text-green-900
- Info: bg-green-100 text-green-800
- Online: bg-yellow-400 (indicator dot)
```

**Gradients:**
```
- Hero sections: from-green-700 to-green-900
- Card hovers: from-green-50 to-yellow-50
- Buttons: from-green-700 to-green-800
```

**Other UI Elements:**
- **Header**: สไตล์ minimal ขนาด 64px (h-16) พร้อม logo และ status indicator สีเหลือง
- **Navigation**: แท็บล่างสีเขียวเข้ม พร้อม active state (bg-green-50 text-green-800)
- **Form**: Card-based layout พร้อม gradient background
- Tailwind CSS v4 พร้อมการตั้งค่าแบบกำหนดเอง
- shadcn/ui components ตั้งค่าเป็น New York style
- อินเทอร์เฟซภาษาไทย
- Path aliases: `@/` สำหรับ src/, `@/components`, `@/lib`, `@/components/ui`

### State Management Pattern

**React Query Architecture:**
```typescript
// src/hooks/useQueries.ts - Centralized data fetching
export function useJobTypes() {
  return useQuery({
    queryKey: ['jobTypes'],
    queryFn: async () => {
      const result = await getJobTypes()
      if (!result.success) throw new Error(result.error)
      return result.data
    }
  })
}

// 18 Custom Hooks:
- useJobTypes, useJobDetails
- useFeeders, useStations, usePeas, useOperationCenters
- useTeams
- usePlanStations, usePlanLines, usePlanAbs, usePlanConductors, usePlanCableCars
- useTopJobDetails, useTopFeeders, useFeederJobMatrix, useDashboardSummary
```

### Server Actions Pattern

**CRUD Operations:**
```typescript
// src/lib/actions/[entity].ts
'use server'

export async function getEntities() {
  try {
    const data = await prisma.entity.findMany(...)
    return { success: true, data }
  } catch (error) {
    return { success: false, error: 'Error message' }
  }
}

export async function createEntity(data: CreateData) { ... }
export async function updateEntity(id: string, data: UpdateData) { ... }
export async function deleteEntity(id: string) { ... }
```

**18 Server Action Files:**
- Base entities: operation-center, pea, station, feeder, job-type, job-detail, team
- Planning: plan-station, plan-line, plan-abs, plan-conductor, plan-cable-car
- Core: task-daily, task-daily-form
- Features: dashboard, upload, index (central export)

### File Upload System

**AWS S3 Integration:**
- Presigned URLs สำหรับ upload ความปลอดภัยสูง
- Progress tracking ด้วย `useUpload` hook
- Support หลายไฟล์ (before/after images)
- Image preview ก่อน upload ด้วย FileReader API

```typescript
// src/hooks/useUpload.ts
export function useUpload() {
  const uploadFile = async (file: File, type: 'before' | 'after') => {
    // Get presigned URL from server
    // Upload to S3 with progress tracking
    // Return S3 URL
  }
}
```

### PDF Report Generation

**Thai Font Support:**
- ใช้ jsPDF + jspdf-autotable
- รองรับฟอนต์ THSarabunNew (Base64 embedded)
- Export options: Single team, Multiple teams (separate files), All teams (single file)
- Include images, metadata, และ summary tables

```typescript
// src/lib/pdf-generator.ts
export async function generateAndDownloadReport(
  tasks: TaskReportData[],
  options: {
    mode: 'single' | 'all-separate' | 'all-combined'
    teamFilter?: string
  }
)
```

### Form Architecture

**Main Form (src/app/page.tsx):**
ฟอร์มหลักจัดการการรายงานงานตาม TaskDaily schema:

**ข้อมูลบังคับ:**
- วันที่ทำงาน (workDate)
- ทีมงาน (teamId)
- ประเภทงาน (jobTypeId)
- รายละเอียดงาน (jobDetailId)
- รูปก่อนทำงาน (beforeImageUrl)
- รูปหลังทำงาน (afterImageUrl)

**ข้อมูลไม่บังคับ:**
- ฟีดเดอร์ (feederId)
- เบอร์เสา (poleNumber)
- รหัสอุปกรณ์ (equipmentCode)
- ระยะทาง (distance)
- หมายเหตุ (remarks)

**Features:**
- Progressive disclosure (แสดง fields ตามลำดับ)
- Real-time validation
- Image upload with preview
- S3 integration with progress tracking
- React Query mutation สำหรับ submit

**Admin Forms (src/components/forms/):**
13 Form components สำหรับจัดการข้อมูลพื้นฐาน รองรับ CRUD operations

## รายละเอียดการใช้งานที่สำคัญ

- **Database Client**: Import Prisma client จาก `@/lib/prisma` (singleton instance)
- **Mobile Layout**: Header แบบคงที่ (64px), เนื้อหาหลักพร้อม top padding, navigation ล่างแบบคงที่
- **การจัดการรูปภาพ**: S3 presigned URLs, FileReader API สำหรับ preview
- **State Management**: React Query + Server Actions (no REST API)
- **ภาษา**: อินเทอร์เฟซเป็นภาษาไทย เป้าหมายคือพนักงานภาคสนามสาธารณูปโภค

## หลักการพัฒนา Mobile-First

### การออกแบบ UI สำหรับมือถือเป็นหลัก
แอปพลิเคชันนี้เน้นการใช้งานบนมือถือ ดังนั้นการพัฒนา UI ต้องคำนึงถึงหลักการต่อไปนี้:

#### 1. Responsive Design
- **Mobile First**: เริ่มออกแบบจากหน้าจอมือถือก่อน (320px ขึ้นไป)
- **Breakpoints**: ใช้ Tailwind breakpoints - `sm:` (640px), `md:` (768px), `lg:` (1024px)
- **การจัดเรียง**: Grid ใน mobile เป็น 1 column, tablet/desktop เป็น 2-3 columns
- **ขนาดแบบอักษร**: `text-sm` สำหรับ mobile, `sm:text-base` สำหรับหน้าจอใหญ่

#### 2. Spacing และ Padding
- **Card padding**: `p-3 sm:p-4` หรือ `p-4 sm:p-6` สำหรับเนื้อหาภายใน
- **Form spacing**: `space-y-4 sm:space-y-6` ระหว่าง elements
- **Container padding**: `px-3 sm:px-4` สำหรับ side margins
- **Bottom padding**: `pb-20` หรือ `pb-32` เพื่อหลีกเลี่ยง navigation bar

#### 3. Touch-Friendly Elements
- **Button sizes**: ขั้นต่ำ 44px height สำหรับการแตะง่าย
- **Input fields**: `py-3` หรือสูงกว่าสำหรับการใส่ข้อมูลบน mobile
- **Icon sizes**: `w-4 h-4 sm:w-5 sm:h-5` responsive icon sizing
- **Hover states**: ใช้ `group-hover:` และ `hover:` สำหรับ interactions

#### 4. Layout Patterns
- **Fixed Header**: คงที่ด้านบน 64px height (h-16)
- **Scrollable Content**: เนื้อหาหลักสามารถ scroll ได้ พร้อม `pt-16` (top padding)
- **Fixed Navigation**: navigation bar ติดด้านล่าง (mobile only, hidden on md:)
- **Safe Areas**: พิจารณา iPhone notch และ Android gesture areas

#### 5. Image และ Media
- **Responsive Images**: ใช้ Next.js Image component กับ `width`, `height` หรือ `fill` prop
- **Aspect Ratios**: กำหนดขนาดคงที่ เช่น `h-32 sm:h-40` สำหรับ image uploads
- **File Upload**: ใช้ hidden input กับ custom button เพื่อ UX ที่ดี
- **Image Preview**: แสดง preview ก่อน upload ด้วย FileReader API

#### 6. Typography Scale
```
- Page Headings: text-2xl sm:text-3xl lg:text-4xl font-bold
- Section Headings: text-lg sm:text-xl font-bold
- Card Titles: text-base sm:text-lg font-semibold
- Labels: text-sm sm:text-base font-medium
- Body: text-sm เป็นค่าเริ่มต้น
- Buttons: text-sm sm:text-base สำหรับ actions
```

#### 7. Color Usage Rules (สำคัญมาก!)

**ห้ามใช้สีเหล่านี้ในโปรเจค:**
- ❌ Blue (ยกเว้นที่เหลืออยู่ใน legacy code)
- ❌ Purple, Indigo, Pink, Rose
- ❌ Cyan, Teal
- ❌ Orange, Red

**ใช้สีเหล่านี้เท่านั้น:**
- ✅ Green (700-950 สำหรับ primary, 50-200 สำหรับ backgrounds)
- ✅ Yellow (400-600 สำหรับ accents, 50-100 สำหรับ light)
- ✅ White, Gray (50-300 สำหรับ neutrals)

**ตัวอย่างการใช้งาน:**
```css
/* ❌ ผิด - ใช้สีน้ำเงิน */
bg-blue-500 text-blue-900 border-blue-200

/* ✅ ถูกต้อง - ใช้สีเขียวเข้ม */
bg-green-800 text-green-900 border-green-200

/* ❌ ผิด - ใช้สีม่วง */
from-purple-500 to-indigo-600

/* ✅ ถูกต้อง - ใช้เขียวและเหลือง */
from-green-700 to-green-900
from-green-50 to-yellow-50
```

### การทดสอบ Mobile
- ทดสอบบนอุปกรณ์จริง iPhone และ Android
- ใช้ Chrome DevTools Mobile Simulator
- ตรวจสอบ touch targets ขั้นต่ำ 44px
- ทดสอบ landscape/portrait orientations
- ทดสอบ network conditions (slow 3G, offline)

## Dashboard Analytics

**Features:**
- สรุปภาพรวมงาน (Total tasks, job types, feeders)
- Top 10 Job Details (งานที่ทำบ่อยที่สุด)
- Top 10 Feeders (ฟีดเดอร์ที่ใช้บ่อยที่สุด)
- Feeder-Job Matrix (ความสัมพันธ์ระหว่างฟีดเดอร์และประเภทงาน)
- Charts: Bar charts, Pie charts (ใช้ Recharts)
- Filter by Year

**Components:**
- สรุปตัวเลขด้วย Cards
- Charts แบบ responsive
- Tables แบบ sortable
- Export to PDF

## Best Practices

### 1. Server Actions
- ใช้ `'use server'` directive
- Return `{ success: boolean, data?: T, error?: string }`
- Handle errors gracefully
- Log errors สำหรับ debugging

### 2. React Query
- Define query keys ใน `queryKeys` object
- ใช้ `staleTime` และ `cacheTime` ตามความเหมาะสม
- Handle loading และ error states
- ใช้ `useMutation` สำหรับ write operations

### 3. Forms
- Validate ฝั่ง client ก่อน submit
- แสดง error messages ที่ชัดเจน
- Disable submit button ระหว่าง loading
- แสดง progress indicator สำหรับ file uploads
- Reset form หลัง submit สำเร็จ

### 4. TypeScript
- ใช้ types จาก `src/types/query-types.ts`
- Define types สำหรับ Server Action responses
- ใช้ Prisma generated types เมื่อเป็นไปได้
- Avoid `any` type

### 5. Performance
- ใช้ Next.js Image component สำหรับรูปภาพทั้งหมด
- Lazy load components ที่ไม่จำเป็นต้องโหลดทันที
- ใช้ React Query cache เพื่อลด API calls
- Optimize bundle size ด้วย dynamic imports

## Important Reminders

1. **สีที่ใช้ในโปรเจค**: เขียวเข้ม, ขาว, เหลือง เท่านั้น - ห้ามใช้สีอื่น!
2. **Mobile-first**: ออกแบบสำหรับมือถือก่อนเสมอ
3. **ภาษาไทย**: UI ทั้งหมดเป็นภาษาไทย
4. **Server Actions**: ใช้ Server Actions แทน API Routes เมื่อเป็นไปได้
5. **React Query**: ใช้สำหรับ data fetching และ caching
6. **Path Aliases**: ใช้ `@/` สำหรับ imports ทั้งหมด
7. **Prisma Client**: Import จาก `@/lib/prisma` เท่านั้น
8. **shadcn/ui**: ใช้ components จาก `@/components/ui/` และปรับแต่งตาม design system
