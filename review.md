# HotlineS3 - Code Review Report

> **Review Date**: 2026-02-01
> **Reviewer**: Claude Opus 4.5 (Automated Deep Review)
> **Scope**: Full codebase review - architecture, code quality, security, performance, UX

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Summary](#2-architecture-summary)
3. [Critical Issues](#3-critical-issues)
4. [High Priority Issues](#4-high-priority-issues)
5. [Medium Priority Issues](#5-medium-priority-issues)
6. [Low Priority Issues](#6-low-priority-issues)
7. [Positive Findings](#7-positive-findings)
8. [Action Plan](#8-action-plan)
9. [File-by-File Issue Index](#9-file-by-file-issue-index)

---

## 1. Project Overview

HotlineS3 is a utility maintenance management system built with Next.js 15 (App Router) + React 19 + TypeScript. It has two main parts:

- **Mobile App** - Field worker task reporting (mobile-first)
- **Admin Panel** - Master data management + analytics dashboard

**Tech Stack**: Next.js 16.1.1, React 19, Prisma 6 (PostgreSQL), Cloudflare R2, React Query 5, Tailwind CSS 4, shadcn/ui, Recharts, Leaflet, jsPDF

**Data Flow**: Client Form -> Server Action -> Prisma -> PostgreSQL, with React Query for cache management and R2 presigned URLs for image uploads.

---

## 2. Architecture Summary

```
src/
├── app/                  # Pages (App Router)
│   ├── page.tsx          # Main form (server-rendered + Suspense)
│   ├── list/             # Task list + PDF export
│   ├── admin/            # 9 admin pages (dashboard, CRUD)
│   └── api/              # API routes (dashboard, upload)
├── features/             # Feature-based components
├── components/           # Shared components
│   ├── ui/               # 20+ shadcn/ui primitives
│   ├── forms/            # 7+ entity forms
│   └── dashboard/        # Dashboard charts & filters
├── lib/
│   ├── actions/          # 10 server action files
│   ├── r2.ts             # Cloudflare R2 integration
│   ├── prisma.ts         # DB client singleton
│   ├── theme.ts          # Design tokens
│   └── pdf-generator.ts  # Thai PDF reports
├── server/
│   ├── services/         # Business logic layer
│   └── repositories/     # Data access layer
├── hooks/                # React Query hooks + upload hook
├── types/                # TypeScript definitions
└── config/               # Navigation config
```

**Key Patterns**:
- Server Actions (pure functions) + React Query (cache invalidation)
- Repository -> Service -> Action -> Hook -> Component
- BigInt IDs serialized to strings for JSON
- Decimal coordinates with 6dp precision
- Soft-delete via `deletedAt` field

---

## 3. Critical Issues

### 3.1 React Query Cache Invalidation Bug
**File**: `src/hooks/useQueries.ts` lines 272-277
**Impact**: Dashboard data may not refresh after creating/updating/deleting tasks

```typescript
// BUG: queryKeys functions called without parameters
queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary() })
queryClient.invalidateQueries({ queryKey: queryKeys.topJobDetails() })
```

`queryKeys.dashboardSummary()` without parameters creates key `['dashboardSummary', undefined, undefined, ...]` which does NOT match keys created with actual filter values like `['dashboardSummary', 2025, 6, ...]`.

**Fix**: Use partial key matching:
```typescript
queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] })
queryClient.invalidateQueries({ queryKey: ['topJobDetails'] })
queryClient.invalidateQueries({ queryKey: ['topFeeders'] })
queryClient.invalidateQueries({ queryKey: ['feederJobMatrix'] })
```

---

### 3.2 revalidatePath Used in Client-Called Server Actions (Violates Project Standards)
**Files**: 7 server action files (pea.ts, station.ts, team.ts, job-type.ts, feeder.ts, job-detail.ts, operation-center.ts)
**Impact**: Potential hydration errors, unnecessary full-page revalidation

Per CLAUDE.md: Server Actions called from Client Components should NOT use `revalidatePath`. Cache invalidation should be handled by React Query's `queryClient.invalidateQueries()`.

**Affected locations** (all in `src/lib/actions/`):
| File | Lines with revalidatePath |
|------|--------------------------|
| `pea.ts` | 27, 89, 104, 166 |
| `station.ts` | 27, 94, 109 |
| `team.ts` | 23, 73, 88 |
| `job-type.ts` | 23, 85, 100 |
| `feeder.ts` | 25, 98, 113 |
| `job-detail.ts` | 23, 88, 106, 124 |
| `operation-center.ts` | 23, 87, 102 |

**Fix**: Remove all `revalidatePath()` calls from these files. The admin pages already call `refetch()` on success, which handles cache updates.

---

## 4. High Priority Issues

### 4.1 Missing Input Validation in Server Actions
**Files**: All CRUD server actions
**Impact**: Runtime crashes on invalid data, poor error messages

- No validation for empty strings (name, code, shortname)
- BigInt conversion crashes on invalid strings: `BigInt("abc")` throws
- No relationship existence checks (FK violations return generic errors)

**Fix**: Add validation layer:
```typescript
// Option 1: Manual validation
if (!data.name?.trim()) return { success: false, error: 'กรุณาระบุชื่อ' }

// Option 2: Add Zod schemas (recommended)
import { z } from 'zod'
const CreatePeaSchema = z.object({
  shortname: z.string().min(1, 'กรุณาระบุชื่อย่อ'),
  fullname: z.string().min(1, 'กรุณาระบุชื่อเต็ม'),
  operationId: z.string().regex(/^\d+$/, 'รหัสจุดรวมงานไม่ถูกต้อง'),
})
```

---

### 4.2 Missing Database Indexes for Soft-Delete Queries
**File**: `prisma/schema.prisma` (TaskDaily model)
**Impact**: Full table scans on large datasets when filtering by deletedAt

All queries on TaskDaily filter by `deletedAt: null` but there's no index on `deletedAt`.

**Fix**: Add composite indexes:
```prisma
@@index([workDate, deletedAt])
@@index([deletedAt])
```

---

### 4.3 Dashboard API Fetch Missing Error Handling
**File**: `src/hooks/useQueries.ts` lines 143-239
**Impact**: Silent failures when network is down or API returns non-JSON

```typescript
// Current: No check for res.ok
const res = await fetch(`/api/dashboard/top-jobs?${params}`)
const result = await res.json()  // Crashes if response is not JSON
```

**Fix**:
```typescript
const res = await fetch(url)
if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
const result = await res.json()
```

---

### 4.4 Upload Progress State Not Reset on Success
**File**: `src/hooks/useUpload.ts` line 104
**Impact**: Progress bar shows 100% on next upload attempt before actual upload starts

**Fix**: Add `setProgress(0)` after successful upload:
```typescript
setUploading(false)
setProgress(0)  // Add this
```

---

### 4.5 Decimal-to-Number Precision Loss for Coordinates
**File**: `src/lib/actions/task-daily.ts` lines 24-25, 53-54
**Impact**: GPS coordinate accuracy degradation

```typescript
const decimalToNumber = (value: Prisma.Decimal | null | undefined) =>
  value === null || value === undefined ? null : value.toNumber()
```

JavaScript `Number` is float64 (15-17 significant digits). For coordinates with 6 decimal places this is sufficient, but it's better to use string conversion for safety.

**Fix**: Use `parseFloat(value.toFixed(6))` or keep as string.

---

### 4.6 R2 Credential Caching Without Refresh
**File**: `src/lib/r2.ts` lines 12-49
**Impact**: If credentials are rotated, app won't pick up new credentials until restart

```typescript
let cachedConfig: R2Config | null = null  // Never refreshed
```

**Fix**: Add TTL-based refresh or remove caching (rely on Node.js module caching).

---

### 4.7 Browser `alert()` and `confirm()` for User Interactions
**Files**: All admin CRUD pages (peas, stations, feeders, job-types, job-details, operation-centers)
**Impact**: Breaks glassmorphism design, poor mobile UX, blocks JS thread

```typescript
// Found in admin pages:
if (confirm('คุณแน่ใจหรือไม่ที่จะลบ...?')) { ... }
alert('เกิดข้อผิดพลาด: ' + result.error)
```

**Fix**: Replace with Dialog component (already exists in `@/components/ui/dialog`) and Toast (Sonner, already integrated).

---

### 4.8 Missing Cascade Delete Configuration
**File**: `prisma/schema.prisma` (multiple models)
**Impact**: Orphaned records if parent entities are deleted

Relations have `onUpdate: Cascade` but no `onDelete` policy. If an OperationCenter is deleted, Pea/Station records become orphaned.

**Fix**: Add explicit `onDelete: Restrict` (prevent deletion if children exist) or `onDelete: Cascade` per business rules.

---

## 5. Medium Priority Issues

### 5.1 `any` Types in Admin Pages
**Files**: `src/app/admin/peas/page.tsx` (lines 14-18), stations, feeders, job-types
**Impact**: Loss of type safety, potential runtime errors

```typescript
const [editingItem, setEditingItem] = useState<any>(null)
```

**Fix**: Define proper interfaces for each entity's edit state.

---

### 5.2 Inconsistent Error Handling Patterns
**Impact**: Confusing UX - some pages use `alert()`, others use Toast

| Page | Error Pattern |
|------|--------------|
| Admin CRUD pages | `alert()` |
| List page | Toast (Sonner) |
| Task form | Toast (Sonner) |

**Fix**: Standardize on Toast (Sonner) for all user notifications.

---

### 5.3 Soft-Delete Query Inconsistency
**File**: `src/lib/actions/job-detail.ts`
**Impact**: Potential data leakage - deleted records visible via direct access

- `getJobDetails()` (line 36): Filters by `deletedAt: null` (correct)
- `getJobDetail()` (line 60): Fetches by ID without `deletedAt` filter, checks manually after (leaky)

**Fix**: Apply `where: { id, deletedAt: null }` consistently in all queries.

---

### 5.4 No Pagination for Task Lists
**File**: `src/lib/actions/task-daily.ts` - `getTaskDailies()`
**Impact**: Memory issues and slow performance with large datasets

**Fix**: Add pagination parameters:
```typescript
export async function getTaskDailies(filters?: {
  ...existing,
  skip?: number,
  take?: number,
})
```

---

### 5.5 FormData Parsing Without Runtime Validation
**File**: `src/lib/actions/task-daily-form.ts` lines 7-30
**Impact**: Runtime errors if form structure changes

```typescript
const data: CreateTaskDailyData = {
  workDate: formData.get('workDate') as string,  // Force cast
  teamId: formData.get('teamId') as string,
  ...
}
```

**Fix**: Use Zod or manual validation before type assertion.

---

### 5.6 Presigned URL Expiry Too Long
**File**: `src/app/api/upload/route.ts` line 45
**Impact**: Extended attack surface for leaked presigned URLs

Currently: 3600 seconds (1 hour). Standard practice: 900 seconds (15 minutes).

---

### 5.7 Repeated Include Patterns in Repository
**File**: `src/server/repositories/task-daily.repository.ts` lines 8-22, 28-42, 48-62, 69-80
**Impact**: Hard to maintain, easy to miss updates

Same include block repeated 4 times:
```typescript
include: {
  team: true,
  jobType: true,
  jobDetail: true,
  feeder: { include: { station: { include: { operationCenter: true } } } }
}
```

**Fix**: Extract as constant:
```typescript
const TASK_DAILY_INCLUDE = { team: true, jobType: true, ... } as const
```

---

### 5.8 No Transaction for Create + Serialize
**File**: `src/lib/actions/task-daily.ts` lines 87-98
**Impact**: If create succeeds but serialization fails, task exists but client thinks it failed

**Fix**: Wrap in try-catch with proper error handling for serialization step.

---

### 5.9 Weak Random for File Names
**File**: `src/lib/r2.ts` lines 146-152
**Impact**: Potential filename collisions in high-concurrency scenarios

```typescript
const randomString = Math.random().toString(36).substring(2, 15)
```

**Fix**: Use `crypto.randomUUID()` instead of `Math.random()`.

---

### 5.10 Heavy Glassmorphism on Mobile Without Performance Fallback
**File**: `src/app/globals.css` lines 131-148
**Impact**: Frame drops on low-end mobile devices

Multiple elements use `backdrop-blur-md/lg/xl` without responsive reduction.

**Fix**: Add media query:
```css
@media (max-width: 768px) {
  .glass, .card-glass { @apply backdrop-blur-sm; }
}
```

---

### 5.11 Admin Pages Missing Bottom Padding for Mobile Nav
**Files**: Admin CRUD pages
**Impact**: Content hidden behind bottom navigation bar on mobile

**Fix**: Add `pb-20` or `pb-32` to main content containers.

---

### 5.12 R2 URL Fallback Silently Hides Misconfiguration
**File**: `next.config.ts` lines 5-19
**Impact**: Wrong image hostname used in production without clear error

Falls back to hardcoded `photo.akin.love` if `R2_PUBLIC_URL` is invalid.

**Fix**: Fail fast in production, only use fallback in development.

---

## 6. Low Priority Issues

### 6.1 Accessibility
- Select components missing `id` to match `htmlFor` (`src/app/list/page.tsx` lines 310-326)
- Missing `aria-label` on filter inputs (`src/app/admin/dashboard/page.tsx`)
- Navbar links missing `aria-current="page"` (`src/components/navbar.tsx`)
- Form error messages not associated with inputs (`aria-describedby`)

### 6.2 Performance Optimizations
- List item cards not memoized (`src/app/list/page.tsx` lines 480-605) - consider `React.memo()`
- Orb animations (w-72 blur-3xl animate-pulse) impact FCP/LCP
- Image cache TTL too low (60s) in `next.config.ts` - consider 3600s

### 6.3 ESLint Config Too Permissive
**File**: `eslint.config.mjs` line 19
- `@typescript-eslint/no-explicit-any` is `"warn"` instead of `"error"`

### 6.4 Missing Error Boundaries
- No React Error Boundary components found in the codebase
- Consider adding for graceful error recovery

### 6.5 No R2 Retry Logic
**File**: `src/lib/r2.ts`
- S3 operations can fail transiently; no retry with exponential backoff

### 6.6 Dynamic Import on Every Delete
**File**: `src/lib/actions/upload.ts` lines 82-83
```typescript
const { deleteFromR2 } = await import('@/lib/r2')  // Every call
```
Should be top-level import.

### 6.7 Image Files Not Cleaned Up on Task Deletion
- When a task is deleted, associated R2 images remain (orphaned storage)

### 6.8 No Audit Trail
- No logging of who modified what and when
- Consider adding `createdBy`/`updatedBy` fields

### 6.9 Missing Foreign Key Indexes
**File**: `prisma/schema.prisma`
- `Station.operationId`, `JobDetail.jobTypeId` lack explicit indexes
- Prisma auto-creates indexes for `@relation` fields in some databases, but explicit is safer

### 6.10 Incomplete TypeScript Types
**File**: `src/types/query-types.ts`
- `Team` type uses `Prisma.TeamGetPayload<object>` (too loose)
- Should specify exact fields needed

---

## 7. Positive Findings

- **Well-structured architecture**: Clear separation (Repository -> Service -> Action -> Hook -> Component)
- **Consistent React Query integration**: Proper hooks, query keys, mutation patterns
- **Good error handling pattern**: All server actions return `{ success, data?, error? }`
- **Loading & error states**: All pages handle isLoading and error properly
- **Mobile-first design**: Responsive layouts, proper spacing, touch targets
- **Thai language support**: Consistent Thai UI throughout, Thai PDF fonts
- **Image handling**: Proper presigned URL flow, progress tracking, preview
- **TypeScript**: Strict mode enabled, mostly well-typed
- **Server/Client boundary**: Mostly well-separated (minus revalidatePath issues)
- **Design system**: Glassmorphism with consistent color palette and theme tokens
- **Prisma schema**: Good use of indexes on frequently-queried fields
- **Code organization**: Feature-based structure with clear naming conventions

---

## 8. Action Plan

### Phase 1: Critical Fixes (ต้องแก้ก่อน deploy)

| # | Task | Files | Est. Effort |
|---|------|-------|-------------|
| 1 | Fix React Query cache invalidation keys | `src/hooks/useQueries.ts` | Small |
| 2 | Remove revalidatePath from client-called actions | 7 files in `src/lib/actions/` | Small |
| 3 | Add input validation to server actions | 7 files in `src/lib/actions/` | Medium |
| 4 | Add deletedAt index to schema | `prisma/schema.prisma` | Small |

### Phase 2: High Priority (ควรแก้เร็ว)

| # | Task | Files | Est. Effort |
|---|------|-------|-------------|
| 5 | Add fetch error handling in dashboard hooks | `src/hooks/useQueries.ts` | Small |
| 6 | Fix upload progress reset | `src/hooks/useUpload.ts` | Small |
| 7 | Replace alert/confirm with Dialog/Toast | 6 admin pages | Medium |
| 8 | Add cascade delete policies to schema | `prisma/schema.prisma` | Small |
| 9 | Fix soft-delete query consistency | `src/lib/actions/job-detail.ts` | Small |

### Phase 3: Medium Priority (ปรับปรุงคุณภาพ)

| # | Task | Files | Est. Effort |
|---|------|-------|-------------|
| 10 | Replace `any` types with proper interfaces | Admin pages | Medium |
| 11 | Standardize error notifications (Toast) | All admin pages | Medium |
| 12 | Add pagination to task list queries | `task-daily.ts`, hooks, list page | Medium |
| 13 | Extract repeated include patterns | Repository file | Small |
| 14 | Add Zod validation for FormData parsing | `task-daily-form.ts` | Small |
| 15 | Reduce presigned URL expiry to 15 min | `src/app/api/upload/route.ts` | Small |
| 16 | Use crypto.randomUUID for file names | `src/lib/r2.ts` | Small |
| 17 | Add mobile blur performance fallback | `src/app/globals.css` | Small |
| 18 | Add bottom padding for mobile nav | Admin pages | Small |

### Phase 4: Low Priority (เพิ่มความสมบูรณ์)

| # | Task | Files | Est. Effort |
|---|------|-------|-------------|
| 19 | Fix accessibility (ARIA labels, htmlFor) | Multiple pages | Medium |
| 20 | Add React Error Boundaries | Layout components | Medium |
| 21 | Add R2 retry logic with backoff | `src/lib/r2.ts` | Medium |
| 22 | Memoize list item components | `src/app/list/page.tsx` | Small |
| 23 | Clean up orphaned R2 images on delete | `task-daily.ts` | Medium |
| 24 | Add missing foreign key indexes | `prisma/schema.prisma` | Small |
| 25 | Tighten ESLint any rule to error | `eslint.config.mjs` | Small |

---

## 9. File-by-File Issue Index

Quick reference for developers - which files have which issues:

| File | Issues | Severity |
|------|--------|----------|
| `src/hooks/useQueries.ts` | Cache invalidation bug, missing fetch error handling | CRITICAL, HIGH |
| `src/hooks/useUpload.ts` | Progress not reset, no client-side size validation | HIGH, MEDIUM |
| `src/lib/actions/pea.ts` | revalidatePath, no input validation, BigInt crash risk | CRITICAL, HIGH |
| `src/lib/actions/station.ts` | revalidatePath, no input validation | CRITICAL, HIGH |
| `src/lib/actions/team.ts` | revalidatePath, no input validation | CRITICAL, HIGH |
| `src/lib/actions/job-type.ts` | revalidatePath, no input validation | CRITICAL, HIGH |
| `src/lib/actions/feeder.ts` | revalidatePath, no input validation | CRITICAL, HIGH |
| `src/lib/actions/job-detail.ts` | revalidatePath, soft-delete inconsistency | CRITICAL, MEDIUM |
| `src/lib/actions/operation-center.ts` | revalidatePath, no input validation | CRITICAL, HIGH |
| `src/lib/actions/task-daily.ts` | Decimal precision, no transaction, no pagination | HIGH, MEDIUM |
| `src/lib/actions/task-daily-form.ts` | FormData no validation | MEDIUM |
| `src/lib/actions/upload.ts` | Dynamic import, hardcoded size limit | LOW |
| `src/lib/r2.ts` | Credential caching, weak random, no retry | HIGH, MEDIUM, LOW |
| `src/app/api/upload/route.ts` | Presigned URL expiry too long | MEDIUM |
| `src/server/repositories/task-daily.repository.ts` | Repeated include patterns | MEDIUM |
| `prisma/schema.prisma` | Missing deletedAt index, cascade delete, FK indexes | HIGH, MEDIUM, LOW |
| `src/app/globals.css` | Heavy blur on mobile | MEDIUM |
| `src/app/list/page.tsx` | Accessibility, memoization, dialog width | LOW |
| `src/app/admin/peas/page.tsx` | alert/confirm, any types | HIGH, MEDIUM |
| `src/app/admin/stations/page.tsx` | alert/confirm, any types | HIGH, MEDIUM |
| `src/app/admin/feeders/page.tsx` | alert/confirm, any types | HIGH, MEDIUM |
| `src/app/admin/job-types/page.tsx` | alert/confirm, any types | HIGH, MEDIUM |
| `src/app/admin/job-details/page.tsx` | alert/confirm, any types | HIGH, MEDIUM |
| `src/app/admin/operation-centers/page.tsx` | alert/confirm, any types | HIGH, MEDIUM |
| `src/app/admin/dashboard/page.tsx` | Accessibility, query loading | LOW |
| `src/components/navbar.tsx` | Missing aria-current | LOW |
| `next.config.ts` | R2 fallback, low image cache TTL | MEDIUM, LOW |
| `eslint.config.mjs` | any rule too permissive | LOW |
| `src/types/query-types.ts` | Incomplete types | LOW |

---

> **Note for future agents**: Start with Phase 1 (Critical Fixes) before any feature development. The cache invalidation bug (3.1) and revalidatePath issue (3.2) are the most impactful and easiest to fix. Input validation (4.1) is the most effort but prevents real production errors.
