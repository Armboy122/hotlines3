# แผนการ Refactor Server Actions ให้รองรับ External API (ใช้ axios)

## 📋 Overview

เป้าหมาย: แก้ไข Server Actions ทั้งหมดให้สามารถสลับระหว่าง **Local Mode** (Prisma) และ **External API Mode** (axios) ได้โดยการเปลี่ยน Environment Variable

**จำนวนงาน:**
- ไฟล์ใหม่: 2 ไฟล์
- Server Actions ที่ต้อง refactor: 10 ไฟล์
- ฟังก์ชันที่ต้องแก้: 33+ ฟังก์ชัน

---

## ✅ Checklist การทำงาน

### 📦 Phase 1: Setup Infrastructure

#### 1.1 Dependencies
- [ ] ติดตั้ง axios: `bun add axios`

#### 1.2 สร้างไฟล์ Config
- [ ] สร้าง `src/lib/api-config.ts`
  - [ ] เพิ่ม `API_CONFIG` object
  - [ ] เพิ่ม `isExternalMode()` function
  - [ ] เพิ่ม `isLocalMode()` function
  - [ ] รองรับ ENV: `NEXT_PUBLIC_API_MODE` และ `NEXT_PUBLIC_API_URL`

#### 1.3 สร้าง Axios Client
- [ ] สร้าง `src/lib/axios-client.ts`
  - [ ] สร้าง `apiClient` instance
  - [ ] ตั้งค่า baseURL, timeout, headers
  - [ ] เพิ่ม Request Interceptor (เตรียมสำหรับ auth token)
  - [ ] เพิ่ม Response Interceptor (แปลง response format)
  - [ ] เพิ่ม Error Interceptor (handle errors)

#### 1.4 Environment Variables
- [ ] เพิ่มใน `.env.local`:
  ```env
  NEXT_PUBLIC_API_MODE=local
  ```
- [ ] เพิ่มใน `.env.example` (ถ้ามี):
  ```env
  # API Mode: local | external
  NEXT_PUBLIC_API_MODE=local
  # NEXT_PUBLIC_API_URL=https://api.example.com
  ```

---

### 🔧 Phase 2: Refactor Server Actions

#### Priority 🔴 สูงสุด (5 ไฟล์)

##### 2.1 Task Daily Actions
- [ ] แก้ไข `src/lib/actions/task-daily.ts`
  - [ ] Import `isExternalMode` และ `apiClient`
  - [ ] แก้ `createTaskDaily()` - เพิ่ม External API mode
  - [ ] แก้ `updateTaskDaily()` - เพิ่ม External API mode
  - [ ] แก้ `deleteTaskDaily()` - เพิ่ม External API mode
  - [ ] แก้ `getTaskDailiesByFilter()` - เพิ่ม External API mode
  - [ ] แก้ `getTaskDailiesByTeam()` - เพิ่ม External API mode
  - [ ] ทดสอบ Local Mode
  - [ ] เพิ่ม error handling

##### 2.2 Job Type Actions
- [ ] แก้ไข `src/lib/actions/job-type.ts`
  - [ ] Import `isExternalMode` และ `apiClient`
  - [ ] แก้ `getJobTypes()` - เพิ่ม External API mode
  - [ ] แก้ `createJobType()` - เพิ่ม External API mode
  - [ ] แก้ `updateJobType()` - เพิ่ม External API mode
  - [ ] แก้ `deleteJobType()` - เพิ่ม External API mode
  - [ ] ทดสอบ Local Mode

##### 2.3 Job Detail Actions
- [ ] แก้ไข `src/lib/actions/job-detail.ts`
  - [ ] Import `isExternalMode` และ `apiClient`
  - [ ] แก้ `getJobDetails()` - เพิ่ม External API mode
  - [ ] แก้ `createJobDetail()` - เพิ่ม External API mode
  - [ ] แก้ `updateJobDetail()` - เพิ่ม External API mode
  - [ ] แก้ `deleteJobDetail()` - เพิ่ม External API mode
  - [ ] ทดสอบ Local Mode

##### 2.4 Feeder Actions
- [ ] แก้ไข `src/lib/actions/feeder.ts`
  - [ ] Import `isExternalMode` และ `apiClient`
  - [ ] แก้ `getFeeders()` - เพิ่ม External API mode
  - [ ] แก้ `createFeeder()` - เพิ่ม External API mode
  - [ ] แก้ `updateFeeder()` - เพิ่ม External API mode
  - [ ] แก้ `deleteFeeder()` - เพิ่ม External API mode
  - [ ] ทดสอบ Local Mode

##### 2.5 Team Actions
- [ ] แก้ไข `src/lib/actions/team.ts`
  - [ ] Import `isExternalMode` และ `apiClient`
  - [ ] แก้ `getTeams()` - เพิ่ม External API mode
  - [ ] แก้ `createTeam()` - เพิ่ม External API mode
  - [ ] แก้ `updateTeam()` - เพิ่ม External API mode
  - [ ] แก้ `deleteTeam()` - เพิ่ม External API mode
  - [ ] ทดสอบ Local Mode

---

#### Priority 🟡 กลาง (3 ไฟล์)

##### 2.6 Station Actions
- [ ] แก้ไข `src/lib/actions/station.ts`
  - [ ] Import `isExternalMode` และ `apiClient`
  - [ ] แก้ `getStations()` - เพิ่ม External API mode
  - [ ] แก้ `createStation()` - เพิ่ม External API mode
  - [ ] แก้ `updateStation()` - เพิ่ม External API mode
  - [ ] แก้ `deleteStation()` - เพิ่ม External API mode
  - [ ] ทดสอบ Local Mode

##### 2.7 PEA Actions
- [ ] แก้ไข `src/lib/actions/pea.ts`
  - [ ] Import `isExternalMode` และ `apiClient`
  - [ ] แก้ `getPeas()` - เพิ่ม External API mode
  - [ ] แก้ `createPea()` - เพิ่ม External API mode
  - [ ] แก้ `updatePea()` - เพิ่ม External API mode
  - [ ] แก้ `deletePea()` - เพิ่ม External API mode
  - [ ] แก้ `createMultiplePeas()` - เพิ่ม External API mode (bulk)
  - [ ] ทดสอบ Local Mode

##### 2.8 Upload Actions
- [ ] แก้ไข `src/lib/actions/upload.ts`
  - [ ] Import `isExternalMode` และ `apiClient`
  - [ ] แก้ `uploadToS3()` - เพิ่ม External API mode
  - [ ] แก้ `deleteFromS3()` - เพิ่ม External API mode
  - [ ] ทดสอบ Local Mode

---

#### Priority 🟢 ต่ำ (2 ไฟล์)

##### 2.9 Operation Center Actions
- [ ] แก้ไข `src/lib/actions/operation-center.ts`
  - [ ] Import `isExternalMode` และ `apiClient`
  - [ ] แก้ `getOperationCenters()` - เพิ่ม External API mode
  - [ ] แก้ `createOperationCenter()` - เพิ่ม External API mode
  - [ ] แก้ `updateOperationCenter()` - เพิ่ม External API mode
  - [ ] แก้ `deleteOperationCenter()` - เพิ่ม External API mode
  - [ ] ทดสอบ Local Mode

##### 2.10 Index Actions
- [ ] ตรวจสอบ `src/lib/actions/index.ts`
  - [ ] ตรวจสอบ exports ทั้งหมดยังถูกต้อง
  - [ ] ไม่ต้องแก้ไขอะไร (เป็น re-export เท่านั้น)

---

### 🧪 Phase 3: Testing

#### 3.1 Local Mode Testing
- [ ] ทดสอบ Task Daily
  - [ ] สร้าง Task ใหม่
  - [ ] แก้ไข Task
  - [ ] ลบ Task
  - [ ] ดึงข้อมูล Task by Filter
- [ ] ทดสอบ Job Type CRUD
  - [ ] GET all
  - [ ] CREATE
  - [ ] UPDATE
  - [ ] DELETE
- [ ] ทดสอบ Job Detail CRUD
  - [ ] GET all
  - [ ] CREATE
  - [ ] UPDATE
  - [ ] DELETE
- [ ] ทดสอบ Feeder CRUD
  - [ ] GET all
  - [ ] CREATE
  - [ ] UPDATE
  - [ ] DELETE
- [ ] ทดสอบ Station CRUD
- [ ] ทดสอบ PEA CRUD
  - [ ] ทดสอบ Bulk Create
- [ ] ทดสอบ Operation Center CRUD
- [ ] ทดสอบ Team CRUD
- [ ] ทดสอบ Upload/Delete Images

#### 3.2 Integration Testing
- [ ] ทดสอบ Main Form (page.tsx)
  - [ ] SSR data fetching ยังทำงาน
  - [ ] DropDown ทุกตัวมีข้อมูล
- [ ] ทดสอบ List Page
  - [ ] ดึงข้อมูล Task Dailies
  - [ ] แก้ไข Task
  - [ ] ลบ Task
- [ ] ทดสอบ Admin Pages ทั้งหมด
  - [ ] Job Types page
  - [ ] Job Details page
  - [ ] Feeders page
  - [ ] Stations page
  - [ ] PEAs page
  - [ ] Operation Centers page
  - [ ] Teams page
- [ ] ทดสอบ Dashboard
  - [ ] Analytics queries ยังทำงาน

#### 3.3 External Mode Testing (Mock)
- [ ] สร้าง Mock API Server
  - [ ] ใช้ json-server หรือ MSW
  - [ ] Mock endpoints ทั้งหมด (10+ endpoints)
- [ ] ตั้งค่า ENV เป็น External Mode
  ```env
  NEXT_PUBLIC_API_MODE=external
  NEXT_PUBLIC_API_URL=http://localhost:4000
  ```
- [ ] ทดสอบ CRUD operations ทั้งหมด
- [ ] ทดสอบ Error Handling
  - [ ] Network error
  - [ ] Timeout
  - [ ] API error responses
- [ ] ทดสอบ Loading states

---

### 📝 Phase 4: Documentation

#### 4.1 Code Documentation
- [ ] เพิ่ม JSDoc comments ให้ฟังก์ชันสำคัญ
- [ ] อัปเดต CLAUDE.md
  - [ ] เพิ่มส่วน API Configuration
  - [ ] เพิ่มวิธีสลับ Local/External Mode
- [ ] สร้าง API.md (optional)
  - [ ] อธิบาย API endpoints ทั้งหมด
  - [ ] Request/Response formats
  - [ ] Error codes

#### 4.2 README Updates
- [ ] อัปเดต Environment Variables section
- [ ] เพิ่มวิธี setup สำหรับ External API
- [ ] เพิ่ม Troubleshooting guide

---

### 🚀 Phase 5: Deployment Preparation

#### 5.1 Environment Setup
- [ ] สร้าง `.env.production`
  ```env
  NEXT_PUBLIC_API_MODE=external
  NEXT_PUBLIC_API_URL=https://api.production.com
  ```
- [ ] เพิ่ม ENV variables ใน Vercel/Deployment platform

#### 5.2 Build & Deploy
- [ ] Run `npm run build` และแก้ TypeScript errors (ถ้ามี)
- [ ] ทดสอบ Production Build locally
- [ ] Deploy to staging environment
- [ ] ทดสอบ staging
- [ ] Deploy to production

---

## 📊 Progress Tracking

### Summary
- [ ] **Phase 1: Setup** (4 tasks)
- [ ] **Phase 2: Refactor** (10 files × ~5 functions = 50 tasks)
- [ ] **Phase 3: Testing** (25+ test cases)
- [ ] **Phase 4: Documentation** (5 tasks)
- [ ] **Phase 5: Deployment** (5 tasks)

**Total Tasks:** ~89 tasks

---

## 🎯 Success Criteria

เมื่อเสร็จสิ้น ต้องผ่านเกณฑ์ต่อไปนี้:

- [ ] ✅ Local Mode ทำงานได้ทุกอย่างเหมือนเดิม
- [ ] ✅ External Mode สามารถเรียก API ได้ทุก endpoint
- [ ] ✅ สลับระหว่าง 2 modes ได้โดยเปลี่ยน ENV variable เท่านั้น
- [ ] ✅ ไม่มี TypeScript errors
- [ ] ✅ ไม่มี breaking changes ใน Components/Hooks
- [ ] ✅ Error handling ครบถ้วน
- [ ] ✅ Tests ผ่านทั้งหมด
- [ ] ✅ Documentation ครบถ้วน

---

## 🔗 Related Files

### ไฟล์ที่ต้องสร้างใหม่
- `src/lib/api-config.ts`
- `src/lib/axios-client.ts`

### ไฟล์ที่ต้องแก้ไข
- `src/lib/actions/task-daily.ts`
- `src/lib/actions/job-type.ts`
- `src/lib/actions/job-detail.ts`
- `src/lib/actions/feeder.ts`
- `src/lib/actions/station.ts`
- `src/lib/actions/pea.ts`
- `src/lib/actions/operation-center.ts`
- `src/lib/actions/team.ts`
- `src/lib/actions/upload.ts`
- `src/lib/actions/index.ts`

### ไฟล์ที่ไม่ต้องแก้
- `src/hooks/useQueries.ts` ✅ (ไม่ต้องแก้)
- Components ทั้งหมด ✅
- Forms ทั้งหมด ✅
- Pages ทั้งหมด ✅

---

## 📌 Notes

### คำแนะนำ
1. ทำทีละ file แล้วทดสอบทันที
2. Commit หลังแก้แต่ละไฟล์เสร็จ
3. เริ่มจาก Priority สูงสุดก่อน
4. ใช้ git branch แยกสำหรับงานนี้
5. Backup database ก่อนทดสอบ

### ข้อควรระวัง
- ⚠️ อย่าลืม handle BigInt serialization (task-daily)
- ⚠️ ตรวจสอบ CORS settings สำหรับ External API
- ⚠️ ระวัง timeout สำหรับ operations ที่ใช้เวลานาน
- ⚠️ ทดสอบ error messages ให้ user-friendly
- ⚠️ ตรวจสอบ response format ต้องตรงกับ Local Mode

---

**Created:** 2025-01-XX
**Last Updated:** 2025-01-XX
**Status:** 🟡 Planning Phase
