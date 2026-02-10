# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HotlineS3 - ระบบจัดการงานบำรุงรักษาสาธารณูปโภคไฟฟ้า (Electrical Utility Maintenance Management System)

**Architecture**: Next.js 16 frontend (pure client-side) + Go backend API (separate repo, port 8080)

Two main user interfaces:
1. **Mobile App** (`/`) - Field worker daily task reporting (mobile-first)
2. **Admin Panel** (`/admin/*`) - Master data management + Dashboard analytics

## Development Commands

```bash
npm run dev          # Dev server with Turbopack
npm run build        # Production build
npm run lint         # ESLint (next/core-web-vitals + next/typescript)
npx tsc --noEmit     # TypeScript type checking
```

**Environment variables needed:**
- `NEXT_PUBLIC_API_URL` - Go backend URL (default: `http://localhost:8080`)
- `R2_PUBLIC_URL` - Cloudflare R2 image host (default hostname: `photo.akin.love`)
- `GO_BACKEND_URL` - For the API proxy route (default: `http://localhost:8080`)

## Architecture

### Data Flow

```
React Components → React Query hooks → Service layer → apiClient (axios) → Go Backend API
                                                                            ↕
                                                                         PostgreSQL
```

There is **no Prisma, no Server Actions, no direct DB access** in this frontend. All data goes through the Go backend REST API (`/v1/*` endpoints).

### Authentication

JWT-based auth with access + refresh tokens:
- `src/lib/auth/auth-context.tsx` - AuthProvider with login/logout, session restore on mount
- `src/lib/auth/auth-guard.tsx` - Redirects unauthenticated users to `/login`
- `src/lib/auth/token-manager.ts` - Access token in memory, refresh token + user in localStorage
- `src/lib/api-client.ts` - Axios instance with auto-refresh on 401 (queues failed requests during refresh)
- User roles: `admin`, `user`, `viewer`

Provider hierarchy: `QueryProvider` > `AuthProvider` > Page content

### Route Groups

```
src/app/
├── layout.tsx              # Root: Providers + Toaster
├── (auth)/
│   ├── layout.tsx          # No auth required
│   └── login/page.tsx
└── (main)/
    ├── layout.tsx          # Wrapped in AuthGuard + Header + Navbar
    ├── page.tsx            # Task daily form (mobile main page)
    ├── list/page.tsx       # Task list + PDF export
    └── admin/
        ├── page.tsx        # Admin menu hub
        ├── dashboard/      # Analytics charts
        ├── operation-centers/, peas/, stations/, feeders/
        ├── job-types/, job-details/
        └── task-daily/
```

### Service Layer (`src/lib/services/`)

Each entity has a service file that wraps `apiClient` calls:

```typescript
// Pattern: src/lib/services/[entity].service.ts
export const entityService = {
  async getAll(): Promise<Entity[]> {
    return apiClient.get('/v1/entities')
  },
  async create(data: CreateData): Promise<Entity> {
    return apiClient.post('/v1/entities', data)
  },
  // ...
}
```

Services: `auth`, `dashboard`, `feeder`, `job-detail`, `job-type`, `operation-center`, `pea`, `station`, `task-daily`, `team`, `upload`

**Note**: The `apiClient` response interceptor auto-extracts `data` from `{ success: true, data: {...} }` responses, so services return the unwrapped data directly.

### React Query Hooks

**Queries** (`src/hooks/useQueries.ts`): Centralized query hooks + `queryKeys` object for cache keys. All entity queries and dashboard analytics queries are defined here.

**Mutations** (`src/hooks/mutations/`): Separate files per entity (e.g., `useTaskDailyMutations.ts`). Each mutation invalidates relevant queries on success and shows toast notifications via `sonner`.

```typescript
// Pattern for mutations
export function useCreateEntity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => entityService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] })
      toast.success('สร้างสำเร็จ')
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
```

### Features Directory

`src/features/task-daily/` - Feature-based organization for the main task form:
- `components/` - task-daily-form, section-card, field-label, searchable-picker, image-upload-box, location-picker
- `types.ts` - Form types and initial state
- `utils.ts` - Validation and helpers

### API Proxy

`src/app/api/[...path]/route.ts` - Catch-all proxy that forwards requests to the Go backend. Forwards `authorization`, `content-type`, `accept` headers.

### File Upload

Uses Cloudflare R2 (S3-compatible) via presigned URLs:
1. `uploadService.getPresignedUrl()` → Go backend generates presigned URL
2. Upload directly to R2 from browser
3. `useUpload` hook (`src/hooks/useUpload.ts`) handles progress tracking

### Key Dependencies

- **UI**: shadcn/ui (New York style) + Tailwind CSS v4 + Lucide Icons
- **Mobile UI**: antd-mobile (Picker component for native-feel selects)
- **Data**: @tanstack/react-query v5
- **HTTP**: axios (with interceptors for auth)
- **Maps**: leaflet + react-leaflet
- **Charts**: recharts
- **PDF**: jsPDF + jspdf-autotable (Thai font: THSarabunNew embedded)
- **Toast**: sonner
- **Fonts**: Geist + Geist_Mono (Google Fonts)

## Database Schema (Go Backend)

Organization hierarchy: `OperationCenter` → `Pea` (การไฟฟ้า) → `Station` → `Feeder`

Job structure: `JobType` → `JobDetail` (hierarchical)

Main entity: `TaskDaily` - daily task reports with images, location, team, job type/detail, feeder

## Design System Rules

### Colors (STRICT - only these colors allowed)
- **Green** (`green-500`, `green-600`) - Primary color, safety/electrical theme
- **Yellow** (`yellow-500`, `amber-500`) - Accent only (max 20-30% of area), warnings/badges
- **White/Gray** (`white`, `gray-50` through `gray-900`) - Backgrounds and text
- **Red** (`red-500`) - Error states only
- Do NOT use: blue, purple, indigo, pink, cyan, teal, orange as new design colors

### UI Principles
- **Mobile-first**: Design for 320px+ first, then scale up
- **Minimal + Glassmorphism**: `backdrop-blur`, `bg-white/70`, `border-white/20` effects
- **Thai language UI** throughout (no emoji in UI)
- **Touch targets**: Minimum 44px height for interactive elements
- **Layout**: Fixed header (64px/h-16) + scrollable content (`pt-16`) + fixed bottom nav (mobile only)
- Bottom padding `pb-24 md:pb-8` to avoid nav overlap on mobile
- Icons from Lucide React, sized `h-4 w-4` (inline) to `h-8 w-8` (hero)

### Glass Component Classes (defined in CSS)
Cards: `card-glass`, `card-glass-green`
Badges: `badge-glass-green`, `badge-glass-yellow`, `badge-glass-red`
Inputs: `input-glass`
Buttons: `btn-gradient-green`, `btn-gradient-blue`
Icons: `icon-glass-green`, `icon-glass-blue`, `icon-glass-yellow`

### Typography Scale
- Page headings: `text-2xl sm:text-3xl font-bold`
- Section headings: `text-lg sm:text-xl font-bold`
- Labels: `text-sm sm:text-base font-medium`
- Body: `text-sm` default

## Important Conventions

- **Path aliases**: Use `@/` for all imports (maps to `src/`)
- **UI language**: All user-facing text in Thai
- **No Server Actions**: This is a pure frontend app; all data flows through the service layer
- **Cache management**: Use `queryClient.invalidateQueries()` in mutation `onSuccess` callbacks
- **ESLint**: `@typescript-eslint/no-explicit-any` is set to `warn` (not error)
- **Deployment**: Vercel (see `vercel.json`), functions have 60s max duration
