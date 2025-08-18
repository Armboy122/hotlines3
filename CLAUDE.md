# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ภาพรวมโครงการ

HotlineS3 เป็นระบบจัดการงานบำรุงรักษาสาธารณูปโภคที่พัฒนาด้วย Next.js 15 โดยเน้นงานบำรุงรักษาโครงสร้างพื้นฐานไฟฟ้า แอปนี้ถูกออกแบบเป็นระบบบันทึกข้อมูลบนมือถือสำหรับพนักงานภาคสนามในการรายงานกิจกรรมบำรุงรักษา

## เทคโนโลยีที่ใช้

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Database**: PostgreSQL พร้อม Prisma ORM  
- **Styling**: Tailwind CSS v4, shadcn/ui components, Material-UI Icons
- **UI Library**: Radix UI primitives ผ่าน shadcn/ui (New York style)
- **State Management**: Custom Hooks + React Query (สำหรับ API calls)
- **HTTP Client**: Axios (เตรียมไว้สำหรับ API integration)
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
Prisma schema กำหนดระบบจัดการสาธารณูปโภคที่ซับซ้อนดังนี้:

- **หน่วยงาน**: `OperationCenter` → `Pea` (การไฟฟ้า) → `Station` (สถานี)
- **การวางแผนงาน**: `PlanStationItem`, `PlanLineItem`, `PlanAbsItem`, `PlanConductorItem`, `PlanCableCarItem`
- **ประเภทงาน**: `JobType` → `JobDetail` (การจัดประเภทงานแบบลำดับชั้น)
- **งานประจำวัน**: `TaskDaily` (หน่วยหลักในการรายงานงาน พร้อมการเชื่อมโยงแผนงาน)

Enum types หลัก:
- `VoltageLevel`: MID, HIGH  
- `CableCarEfficiency`: PASSED, FAILED, NEEDS_MAINTENANCE

### โครงสร้างแอปพลิเคชัน

- **Layout**: การออกแบบ Mobile-first พร้อม header แบบคงที่, พื้นที่เนื้อหาหลัก, และการนำทางล่าง
- **หน้าเว็บ**: 
  - `/` - ฟอร์มหลักสำหรับรายงานงาน (component `FormShadcn`)
  - `/list` - หน้าดูข้อมูล (การใช้งานพื้นฐาน)
- **Components**: อยู่ใน `src/components/` พร้อม UI primitives ใน `src/components/ui/`

### การตั้งค่า Prisma
- Client สร้างไฟล์ไปที่ `src/generated/prisma/` (ไม่ใช่ตำแหน่งเริ่มต้น)
- ใช้ PostgreSQL เป็น datasource
- ESLint ไม่ตรวจสอบไฟล์ที่สร้างใน `src/generated/` และ `prisma/generated/`

### การจัดรูปแบบและ UI
- Tailwind CSS พร้อมการตั้งค่าแบบกำหนดเอง
- shadcn/ui components ตั้งค่าเป็น New York style พร้อมสี neutral base
- อินเทอร์เฟซภาษาไทยพร้อม Material-UI icons
- Path aliases: `@/` สำหรับ src/, `@/components`, `@/lib`, `@/components/ui`

### สถาปัตยกรรมฟอร์ม
ฟอร์มหลัก (`FormShadcn`) จัดการการรายงานงานที่ครอบคลุมด้วย:
- การเลือกประเภทงาน → รายละเอียดงานแบบลำดับ
- การอัปโหลดรูปภาพ (รูปก่อน/หลัง)
- การค้นหารหัสสถานีอัตโนมัติ
- รองรับหลายภาษา (อินเทอร์เฟซภาษาไทย)
- การจำลองการส่ง API พร้อมการแจ้งเตือนสำเร็จ

## รายละเอียดการใช้งานที่สำคัญ

- **Database Client**: Import Prisma client จาก `../generated/prisma/client` (custom output path)
- **Mobile Layout**: Header แบบคงที่ (ความสูง 160px), เนื้อหาหลักพร้อม top padding, navigation ล่างแบบคงที่
- **การจัดการรูปภาพ**: FileReader API สำหรับ preview, การจำลองการอัปโหลดไฟล์
- **State Management**: Custom Hooks architecture พร้อม React Query สำหรับ API calls
- **ภาษา**: อินเทอร์เฟซหลักเป็นภาษาไทย เป้าหมายคือพนักงานภาคสนามสาธารณูปโภค

## Custom Hooks Architecture

### Hook Structure
```
src/hooks/
├── useFormData.ts - จัดการ form state และ validation logic
├── useJobTypes.ts - fetch job types และ job details
├── useStations.ts - fetch stations และ lines data  
└── useSubmitTask.ts - handle form submission
```

### API Integration Pattern
```typescript
// ตัวอย่าง useJobTypes hook
export const useJobTypes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchJobTypes = async () => {
    try {
      // TODO: Replace with actual API
      // const response = await axios.get('/api/job-types');
      // return response.data;
      
      // Mock data for development
      return mockJobTypeData;
    } catch (err) {
      setError('Failed to fetch');
    }
  };
  
  return { loading, error, fetchJobTypes };
};
```

### Form Data Flow
1. **useFormData** - จัดการ state และ validation
2. **useJobTypes, useStations** - fetch options สำหรับ dropdowns
3. **useSubmitTask** - handle form submission กับ API
4. **Progressive Disclosure** - แสดง fields ตามลำดับ validation

## หลักการพัฒนา Mobile-First

### การออกแบบ UI สำหรับมือถือเป็นหลัก
แอปพลิเคชันนี้เน้นการใช้งานบนมือถือ ดังนั้นการพัฒนา UI ต้องคำนึงถึงหลักการต่อไปนี้:

#### 1. Responsive Design
- **Mobile First**: เริ่มออกแบบจากหน้าจอมือถือก่อน (320px ขึ้นไป)
- **Breakpoints**: ใช้ Tailwind breakpoints - `sm:` (640px), `md:` (768px), `lg:` (1024px)
- **การจัดเรียง**: Grid ใน mobile เป็น 1 column, tablet/desktop เป็น 2 columns
- **ขนาดแบบอักษร**: `text-sm` สำหรับ mobile, `sm:text-base` สำหรับหน้าจอใหญ่

#### 2. Spacing และ Padding
- **Card padding**: `p-3 sm:p-4` หรือ `p-4 sm:p-6` สำหรับเนื้อหาภายใน
- **Form spacing**: `space-y-4 sm:space-y-6` ระหว่าง elements
- **Container padding**: `px-3 sm:px-4` สำหรับ side margins
- **Bottom padding**: `pb-32` เพื่อหลีกเลี่ยง navigation bar

#### 3. Touch-Friendly Elements
- **Button sizes**: ขั้นต่ำ 44px height สำหรับการแตะง่าย
- **Input fields**: `py-3` หรือสูงกว่าสำหรับการใส่ข้อมูลบน mobile
- **Icon sizes**: `w-4 h-4 sm:w-5 sm:h-5` responsive icon sizing
- **Hover states**: ใช้ `group-hover:` สำหรับ mobile interactions

#### 4. Layout Patterns
- **Fixed Header**: คงที่ด้านบน 160px height
- **Scrollable Content**: เนื้อหาหลักสามารถ scroll ได้
- **Fixed Navigation**: navigation bar ติดด้านล่าง
- **Safe Areas**: พิจารณา iPhone notch และ Android gesture areas

#### 5. Image และ Media
- **Responsive Images**: ใช้ Next.js Image component กับ `fill` prop
- **Aspect Ratios**: กำหนดขนาดคงที่ เช่น `h-32 sm:h-40` สำหรับ image uploads
- **File Upload**: ใช้ hidden input กับ custom button เพื่อ UX ที่ดี

#### 6. Typography Scale
```
- Headings: text-base sm:text-lg สำหรับ section headers
- Labels: text-sm sm:text-base สำหรับ form labels  
- Body: text-sm เป็นค่าเริ่มต้น
- Buttons: text-base sm:text-lg สำหรับ primary actions
```

#### 7. Color Guidelines (สำหรับการมองเห็นกลางแจ้ง)
เน้นการใช้งานภาคสนาม ต้องมองเห็นชัดเจนในแสงแดด ใช้ 3 สีหลัก:

**สีหลัก (Primary Colors):**
- **สีแดง-ส้ม**: `orange-500` ถึง `red-600` - Call-to-Action, Step indicators
- **สีเทา-ดำ**: `slate-500` ถึง `slate-800` - Labels, Text content, Secondary elements  
- **สีเขียว**: `green-500` ถึง `green-700` - Success states, Validation, Completed

**Background & Gradients:**
- Main background: `from-slate-50 to-orange-50`
- Cards: `green-50` ถึง `green-100` (success), `slate-50` ถึง `slate-100` (neutral)
- Border colors: ใช้ระดับ 300-500 สำหรับ visibility

### การทดสอบ Mobile
- ทดสอบบนอุปกรณ์จริง iPhone และ Android
- ใช้ Chrome DevTools Mobile Simulator
- ตรวจสอบ touch targets ขั้นต่ำ 44px
- ทดสอบ landscape/portrait orientations