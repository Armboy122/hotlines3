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

**Design System - Minimal & Professional:**
โปรเจคนี้เน้น **ความเรียบง่าย (Minimal)** และ **ดูเป็นมืออาชีพ** โดยใช้ **สีเขียว** และ **สีเหลือง** เป็นสีหลักเท่านั้น สื่อถึง "ความปลอดภัย" และ "การทำงานเกี่ยวกับไฟฟ้า"

#### Color Palette

**สีเขียว (Primary Color) - #4CAF50:**
- ใช้เป็นสีหลัก (Primary) เช่น ปุ่มบันทึก หรือสถานะ "สำเร็จ"
- Tailwind classes: `green-500` (primary), `green-600` (hover), `green-700` (active)
- ใช้สำหรับ: Headers, Primary buttons, Navigation active states, Success indicators

**สีเหลือง (Accent Color) - #FBC02D:**
- ใช้สำหรับเน้นจุดสำคัญหรือสถานะ "เตือน/รอตรวจสอบ"
- Tailwind classes: `yellow-500` (primary), `yellow-600` (hover)
- ใช้สำหรับ: Warnings, Important badges, Status indicators
- **หมายเหตุ:** ใช้สี accent ไม่เกิน 20-30% ของพื้นที่จอ

**สีพื้นหลัง (Backgrounds):**
- ขาว (#FFFFFF): `bg-white` - Card backgrounds, Input fields
- เทาอ่อน (#F9FAFB): `bg-gray-50` - Page backgrounds
- เทาอ่อน (#E0E0E0): `border-gray-200` - เส้นขอบ, เส้นแบ่ง

**สีข้อความ (Text Colors):**
- เทาเข้ม (#212121): `text-gray-900` - Headings, Primary text
- เทารอง (#616161): `text-gray-600` - Secondary text, Labels
- เทาอ่อน: `text-gray-400` - Muted text, Placeholders

#### หลักการออกแบบ Minimal Design

**1. พื้นที่ว่างและการจัดวาง:**
- เน้นใช้ "พื้นที่ว่างและการจัดวาง" เป็นตัวแยกส่วนแทนเส้นขอบหนา
- หลีกเลี่ยงการใช้เงา (shadow) เยอะ ใช้เฉพาะที่จำเป็น (`shadow-sm`)
- Spacing: `space-y-4 sm:space-y-6`, padding: `p-4 sm:p-6`

**2. ความสะอาดและอ่านง่าย:**
- ให้ความสำคัญกับความสะอาด อ่านง่าย และการเว้นระยะมากกว่าการตกแต่ง
- เน้นให้ผู้ใช้เข้าใจการทำงานทันที โดยไม่ต้องมีสีเยอะ
- Typography: ใช้ฟอนต์ทันสมัยเรียบง่าย (Inter หรือ Roboto)

**3. การใช้สีแบบพอดี:**
- ใช้สี accent (เขียว–เหลือง) อย่างพอดี (ไม่เกิน 20–30% ของพื้นที่จอ)
- ใช้สีเขียว/เหลือง เฉพาะในการสื่อสถานะเท่านั้น
- พื้นหลังส่วนใหญ่ใช้สีขาวหรือเทาอ่อน

#### การใช้สีตามหน้าต่างๆ

**Form Page (หน้าแบบฟอร์ม):**
```css
- พื้นหลัง: bg-white (card) บน bg-gray-50 (page)
- ฟิลด์กรอกข้อมูล: border-gray-200 focus:border-green-500
- ปุ่มบันทึก: bg-green-500 hover:bg-green-600 text-white
- ปุ่มยกเลิก: bg-gray-200 hover:bg-gray-300 text-gray-700
```

**List Page (หน้ารายการ):**
```css
- พื้นหลัง: bg-gray-50
- รายการ: bg-white border-gray-200 (กล่องบนพื้นเทาอ่อน)
- จุดสถานะ: bg-green-500 (สำเร็จ), bg-yellow-500 (รอตรวจสอบ)
- เส้นแบ่ง: border-gray-200
```

**Dashboard Page (หน้าแดชบอร์ด):**
```css
- พื้นหลัง: bg-gray-50
- กล่องสรุปข้อมูล: bg-white border-gray-200
- กราฟ: ใช้สีเขียว/เหลือง เฉพาะในการสื่อสถานะเท่านั้น
- การ์ดสถิติ: minimal style with clean spacing
```

#### Buttons

```css
- Primary: bg-green-500 hover:bg-green-600 text-white
- Secondary: bg-yellow-500 hover:bg-yellow-600 text-gray-900
- Ghost: text-gray-700 hover:bg-gray-100
- Cancel: bg-gray-200 hover:bg-gray-300 text-gray-700
```

#### Theme Structure

**แนะนำให้จัดโครงสร้าง theme ดังนี้:**

```typescript
// /styles/theme.ts หรือ /lib/theme.ts
export const theme = {
  colors: {
    primary: {
      main: '#4CAF50',      // green-500
      hover: '#45a049',     // green-600
      active: '#3d8b40',    // green-700
    },
    accent: {
      main: '#FBC02D',      // yellow-500
      hover: '#f9a825',     // yellow-600
    },
    background: {
      white: '#FFFFFF',
      gray: '#F9FAFB',
    },
    text: {
      primary: '#212121',   // gray-900
      secondary: '#616161', // gray-600
      muted: '#9E9E9E',     // gray-400
    },
    border: '#E0E0E0',      // gray-200
  },
  spacing: { /* ... */ },
  typography: { /* ... */ },
}
```

**การนำไปใช้:**
- Components ใน `/components/ui/` ดึงสีจาก theme
- ใช้ design tokens เพื่อความสม่ำเสมอทั้งแอป
- Tailwind CSS v4 config ใช้ค่าจาก theme

#### Icon Usage Guidelines

**หลักการใช้ Lucide Icons:**
- ใช้ icons เพื่อสื่อความหมายและเพิ่ม visual hierarchy (ไม่ใช้ emoji)
- ขนาดมาตรฐาน:
  - `h-4 w-4` - สำหรับ labels และ inline elements
  - `h-5 w-5` - สำหรับ buttons และ cards
  - `h-6 w-6` - สำหรับ headings และ page titles
  - `h-8 w-8` ขึ้นไป - สำหรับ hero sections
- สีตาม context:
  - `text-green-500` - Primary actions, success states
  - `text-yellow-600` - Warnings, important indicators
  - `text-gray-600` - Secondary/neutral icons
  - `text-red-600` - Errors, delete actions

**Icon Mapping สำหรับแต่ละ Context:**

**ข้อมูลพื้นฐาน:**
- **วันที่/เวลา**: Calendar, Clock
- **สถานที่**: MapPin, Building2
- **ฟีดเดอร์/ไฟฟ้า**: Zap, Cable
- **ทีมงาน**: Users, User
- **หมายเลขเสา**: Hash
- **รหัสอุปกรณ์**: Wrench, Settings

**ประเภทงาน:**
- **ประเภทงานทั่วไป**: Briefcase, Clipboard
- **รายละเอียดงาน**: FileText, AlignLeft
- **งานซ่อมบำรุง**: Wrench, Tool
- **งานตรวจสอบ**: CheckCircle, Eye

**สถานะและ Actions:**
- **สำเร็จ**: CheckCircle, Check
- **เตือน**: AlertCircle, AlertTriangle
- **ผิดพลาด**: XCircle, X
- **บันทึก**: Save
- **แก้ไข**: Edit, Pencil
- **ลบ**: Trash2
- **ดาวน์โหลด**: Download
- **เพิ่ม**: Plus, PlusCircle

**รูปภาพและสื่อ:**
- **รูปภาพ**: Image, Camera
- **อัปโหลด**: Upload, ImagePlus

**การนำทาง:**
- **ไปหน้าถัดไป**: ArrowRight, ChevronRight
- **ขยาย/ยุบ**: ChevronDown, ChevronUp
- **กลับ**: ArrowLeft

**Analytics และ Reports:**
- **สถิติ**: BarChart3, LineChart, PieChart
- **Dashboard**: LayoutDashboard
- **รายงาน**: FileText, FileBarChart
- **อันดับ**: Trophy, Award, TrendingUp

**ตัวอย่างการใช้งาน:**
```tsx
import { Calendar, Users, Save } from 'lucide-react'

// ใน Label
<Label className="flex items-center gap-2 text-gray-600">
  <Calendar className="h-4 w-4 text-green-500" />
  วันที่ทำงาน
</Label>

// ใน Button
<Button className="bg-green-500 hover:bg-green-600">
  <Save className="h-4 w-4 mr-2" />
  บันทึกข้อมูล
</Button>

// ใน Card Header
<CardTitle className="flex items-center gap-2">
  <Users className="h-5 w-5 text-green-500" />
  รายชื่อทีมงาน
</CardTitle>
```

#### Other UI Elements

- **Header**: สไตล์ minimal ขนาด 64px (h-16) พื้นขาว พร้อม logo และ status indicator สีเหลือง
- **Navigation**: แท็บล่างเรียบง่าย พื้นขาว พร้อม active state (bg-green-50 text-green-600)
- **Form**: Card-based layout บนพื้นเทาอ่อน (ไม่ใช้ gradient)
- **Cards**: พื้นขาว border เทาอ่อน ไม่ใช้เงาเยอะ (`shadow-sm` เท่านั้น)
- Tailwind CSS v4 พร้อมการตั้งค่าแบบกำหนดเอง
- shadcn/ui components ตั้งค่าเป็น New York style
- อินเทอร์เฟซภาษาไทย (ไม่ใช้ emoji)
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

// Mutation Hook Example (สำหรับ write operations)
export function useCreateTaskDaily() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateTaskDailyData) => {
      const result = await createTaskDaily(data)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      // Cache invalidation แทนที่ revalidatePath
      queryClient.invalidateQueries({ queryKey: ['taskDailies'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary() })
    }
  })
}

// 18+ Custom Hooks:
- useJobTypes, useJobDetails (queries)
- useFeeders, useStations, usePeas, useOperationCenters (queries)
- useTeams (query)
- usePlanStations, usePlanLines, usePlanAbs, usePlanConductors, usePlanCableCars (queries)
- useTopJobDetails, useTopFeeders, useFeederJobMatrix, useDashboardSummary (analytics queries)
- useCreateTaskDaily (mutation)
```

### Server Actions Pattern

**CRUD Operations (Pure Functions):**
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

export async function createEntity(data: CreateData) {
  try {
    const entity = await prisma.entity.create({ data })
    // ไม่มี revalidatePath ที่นี่ - ให้ React Query จัดการ
    return { success: true, data: entity }
  } catch (error) {
    return { success: false, error: 'Error message' }
  }
}

export async function updateEntity(id: string, data: UpdateData) { ... }
export async function deleteEntity(id: string) { ... }
```

**18 Server Action Files:**
- Base entities: operation-center, pea, station, feeder, job-type, job-detail, team
- Planning: plan-station, plan-line, plan-abs, plan-conductor, plan-cable-car
- Core: task-daily, task-daily-form
- Features: dashboard, upload, index (central export)

### Server/Client Boundary Best Practices

**การแยก Server Actions และ Client Components:**

1. **Pure CRUD Operations**: ไม่ใส่ `revalidatePath` ใน Server Actions ที่เรียกจาก Client Components
2. **Cache Invalidation**: ใช้ React Query's `queryClient.invalidateQueries()` แทน `revalidatePath`
3. **Form Actions**: ใช้ `revalidatePath` ได้เฉพาะใน Server Actions ที่เรียกโดยตรงจาก `<form action={...}>`

**Pattern ที่แนะนำ:**

```typescript
// ❌ ผิด - Server Action มี revalidatePath และถูกเรียกจาก Client Component
'use server'
export async function createEntity(data) {
  await prisma.entity.create({ data })
  revalidatePath('/') // Error เมื่อเรียกจาก Client Component!
  return { success: true }
}

// ✅ ถูกต้อง - Pure function, cache จัดการโดย React Query
'use server'
export async function createEntity(data) {
  await prisma.entity.create({ data })
  return { success: true } // ไม่มี revalidatePath
}

// ใน Client Component:
const mutation = useMutation({
  mutationFn: createEntity,
  onSuccess: () => {
    // Cache invalidation ทำที่นี่แทน
    queryClient.invalidateQueries({ queryKey: ['entities'] })
  }
})
```

**ข้อดีของ Pattern นี้:**
- ✅ แยก Server/Client boundary ชัดเจน
- ✅ ไม่มี hydration errors
- ✅ Granular cache control (invalidate เฉพาะที่ต้องการ)
- ✅ Better performance (ไม่ต้อง revalidate ทั้ง path)

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
- ✅ Green (#4CAF50) - สีหลัก สื่อถึงความปลอดภัยและไฟฟ้า
- ✅ Yellow (#FBC02D) - สีเสริม สื่อถึงการเตือนและจุดสำคัญ
- ✅ White (#FFFFFF), Gray (#F9FAFB, #E0E0E0, #616161) - สีพื้นฐานและข้อความ

**ตัวอย่างการใช้งาน:**
```css
/* ❌ ผิด - ใช้สีเขียวเข้มเกินไป */
bg-green-800 text-green-900 border-green-700

/* ✅ ถูกต้อง - ใช้เฉดสีที่กำหนด */
bg-green-500 text-gray-900 border-gray-200

/* ❌ ผิด - ใช้ gradient หลากสี */
from-green-700 to-green-900

/* ✅ ถูกต้อง - พื้นหลังเรียบง่าย */
bg-white หรือ bg-gray-50

/* ❌ ผิด - ใช้เหลืองมากเกินไป */
bg-yellow-400 text-yellow-800 border-yellow-500

/* ✅ ถูกต้อง - ใช้เหลืองเฉพาะจุดสำคัญ */
bg-yellow-500 (เฉพาะ accent/badge)
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
- **ไม่ใส่ `revalidatePath`** ใน functions ที่เรียกจาก Client Components
- ใช้ `revalidatePath` ได้เฉพาะใน form actions (`<form action={...}>`)
- Handle errors gracefully
- Log errors สำหรับ debugging

### 2. React Query
- Define query keys ใน `queryKeys` object
- ใช้ `staleTime` และ `cacheTime` ตามความเหมาะสม
- Handle loading และ error states
- ใช้ `useMutation` สำหรับ write operations
- **ใช้ `queryClient.invalidateQueries()`** แทน `revalidatePath` สำหรับ cache management
- Invalidate queries ที่เกี่ยวข้องใน `onSuccess` callback

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

1. **Design System**: Minimal & Professional - เน้นความเรียบง่าย ใช้พื้นที่ว่างเป็นตัวแยกส่วน
2. **สีที่ใช้ในโปรเจค**:
   - เขียว (#4CAF50) - สีหลัก
   - เหลือง (#FBC02D) - สีเสริม (ไม่เกิน 20-30% ของพื้นที่)
   - ขาว/เทา - พื้นหลังและข้อความ
   - ห้ามใช้สีอื่น!
3. **Mobile-first**: ออกแบบสำหรับมือถือก่อนเสมอ
4. **ภาษาไทย**: UI ทั้งหมดเป็นภาษาไทย
5. **Server Actions**: ใช้ Server Actions แทน API Routes เมื่อเป็นไปได้
6. **React Query**: ใช้สำหรับ data fetching และ caching
7. **Server/Client Boundary**: ไม่ใส่ `revalidatePath` ใน Server Actions ที่เรียกจาก Client Components
8. **Cache Management**: ใช้ `queryClient.invalidateQueries()` แทน `revalidatePath`
9. **Path Aliases**: ใช้ `@/` สำหรับ imports ทั้งหมด
10. **Prisma Client**: Import จาก `@/lib/prisma` เท่านั้น
11. **shadcn/ui**: ใช้ components จาก `@/components/ui/` และปรับแต่งตาม design system
12. **UI Guidelines**: หลีกเลี่ยงเงาเยอะ, ใช้ฟอนต์เรียบง่าย (Inter/Roboto), เน้นความสะอาดอ่านง่าย
