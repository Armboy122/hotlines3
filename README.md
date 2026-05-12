# HotlineS3 Frontend

Frontend สำหรับระบบจัดการงานบำรุงรักษา/งานทีม HotlineS3

## Architecture

- **Frontend**: Next.js 16, React 19, TypeScript
- **UI**: Tailwind CSS, shadcn/Radix UI, Lucide React, antd-mobile
- **Data fetching**: TanStack Query + service layer
- **Backend**: Go REST API แยก repo (`backend-hotline`)
- **Database ownership**: Backend เท่านั้น ผ่าน Goose migrations

> สำคัญ: repo หน้าบ้านนี้ไม่มี ORM/DB client, ไม่มี Server Actions สำหรับเขียน DB, และไม่มี direct database access. ทุกข้อมูลต้องผ่าน Go backend REST API เท่านั้น.

## Data Flow

```text
React Components
  → React Query hooks
  → src/lib/services/*.service.ts
  → src/lib/api-client.ts
  → /api/* proxy หรือ NEXT_PUBLIC_API_URL
  → Go backend /v1/*
  → PostgreSQL/Neon ผ่าน backend migrations
```

## Environment Variables

ใช้เฉพาะ endpoint ของ API ใน frontend:

```bash
NEXT_PUBLIC_API_URL=/api
GO_BACKEND_URL=http://localhost:8080
R2_PUBLIC_URL=https://photo.akin.love
```

- `NEXT_PUBLIC_API_URL=/api` ให้ browser เรียกผ่าน Next.js proxy
- `GO_BACKEND_URL` ใช้เฉพาะ proxy route ฝั่ง Next.js เพื่อ forward ไป Go backend
- `R2_PUBLIC_URL` ใช้แสดง public image URL

## Development

```bash
npm install
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

## Verification

```bash
npm run lint
npx tsc --noEmit
```

Large-work regression tests:

```bash
npx --yes tsx src/types/large-work.test.ts
npx --yes tsx src/features/large-work/planning-board-helpers.test.ts
npx --yes tsx src/features/large-work/worker-todo-flow.test.ts
npx --yes tsx 'src/app/(main)/planning/large-work-card-actions.test.ts'
```

## Deployment

ตั้งค่า env ที่ Vercel/hosting เฉพาะ API และ asset URLs:

```text
NEXT_PUBLIC_API_URL=/api
GO_BACKEND_URL=https://<backend-host>
R2_PUBLIC_URL=https://<r2-public-host>
```

Database migration/deploy เป็นหน้าที่ของ backend repo (`backend-hotline`) เท่านั้น.

## Project Structure

```text
src/
├── app/                         # Next.js App Router
│   ├── (auth)/                  # login/auth pages
│   ├── (main)/                  # authenticated app pages
│   └── api/[...path]/route.ts   # proxy ไป Go backend
├── components/                  # shared UI components
├── features/                    # feature modules เช่น large-work/task-daily
├── hooks/                       # React Query hooks/mutations
├── lib/
│   ├── api-client.ts            # axios client + auth refresh
│   ├── auth/                    # client-side JWT auth
│   └── services/                # REST service wrappers
└── types/                       # frontend/API contract types

public/                          # static assets/PWA manifest
```

## Development Rules

- ห้ามเพิ่ม ORM หรือ DB client ใน frontend
- ห้ามเพิ่ม database connection string เป็น requirement ของ frontend
- ห้ามเขียน schema/migration จาก frontend repo
- ถ้าต้องเปลี่ยน schema ให้ทำใน backend repo ด้วย Goose migration
- ถ้าต้องเพิ่ม endpoint ให้เพิ่ม backend contract ก่อน แล้วค่อยอัปเดต service/type/hook ใน frontend

## Troubleshooting

### API เรียกไม่สำเร็จ

- ตรวจ `NEXT_PUBLIC_API_URL`
- ถ้าใช้ `/api` ให้ตรวจ `GO_BACKEND_URL`
- ตรวจว่า backend `/v1/*` endpoint ทำงานและ token ยัง valid

### Build หรือ type error

```bash
npm run lint
npx tsc --noEmit
```

### PWA ไม่ทำงาน

- ตรวจ `public/manifest.json`
- ตรวจ service worker/static asset cache ใน browser DevTools

## License

MIT License
