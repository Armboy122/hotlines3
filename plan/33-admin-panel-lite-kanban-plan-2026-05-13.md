# Hotline Admin Panel Lite — Kanban Execution Plan

## Goal
Build a lightweight **จัดการระบบ** admin area that blends with existing Hotline admin/master-data functionality without adding a dashboard/monitoring product now.

## Product decision
- Keep the UX/UI polish direction: professional, mobile/tablet friendly, clean admin-console feel.
- Reduce scope: no dashboard, no analytics command center, no monitoring mode, no SLA/live alerts.
- Admin panel should be a compact system-management hub for the owner/admin on tablet and desktop.
- Use existing backend APIs where possible; avoid schema changes unless a worker proves a necessary gap.

## In scope now
1. `/admin` landing as a compact **จัดการระบบ** hub.
2. Hide/remove dashboard entry from admin menu and copy for this phase.
3. Add/verify user management surface using existing `/v1/users` endpoints.
4. Improve team management surface using existing `/v1/teams` and existing contact/team data where available.
5. Replace placeholder `/admin/task-daily` with an admin jobs list/detail surface using existing task daily/list APIs.
6. Mobile/tablet responsive UX: cards on mobile, readable tables on desktop, no horizontal scroll.
7. Role guards must remain: `/admin/*` requires admin/super_admin, and dangerous user/role edits must require super_admin if backend policy requires it.

## Out of scope now
- `/admin/dashboard` implementation or redesign.
- New live monitoring mode.
- KPI/analytics/reporting work.
- SLA/notification-rule settings.
- Production schema migrations unless an existing endpoint is missing and the worker documents why.

## Design constraints
- Thai UI only.
- Keep Hotline design rules from `CLAUDE.md`: mobile-first, glass/minimal admin surfaces, green/yellow/white/gray/red only.
- Tablet is a first-class admin monitor/edit device.
- Mobile should support emergency edits with large tap targets, but desktop/tablet remain preferred for heavier admin work.

## K0 repo facts confirmed 2026-05-13

### Frontend current state
- Existing admin routes: `/admin`, `/admin/dashboard`, `/admin/operation-centers`, `/admin/peas`, `/admin/stations`, `/admin/feeders`, `/admin/job-types`, `/admin/job-details`, `/admin/monthly-plan`, `/admin/task-daily`.
- Missing admin routes for this reduced scope: `/admin/users` and `/admin/teams` do not exist yet.
- `/admin/task-daily` is currently a placeholder page with only `Task Daily` / `หน้านี้กำลังพัฒนา` copy.
- `/admin` currently shows a visible Dashboard section/card and the super-admin hero says `ระบบจัดการข้อมูลพื้นฐาน` with dashboard/analytics copy; K1 must remove/hide those dashboard references from the hub for this phase.
- Main navigation still labels `/admin` as `จัดการข้อมูล`; K1 should rename visible copy to `จัดการระบบ` if it fits the final IA.
- Frontend has `team.service.ts`, team query/mutations, `task-daily.service.ts`, contact-directory service/query/mutations, and auth user types.
- Frontend does not have a dedicated `user.service.ts` or user query/mutations for `/v1/users`; K2 must add these before building `/admin/users`.

### Backend/API current state
- `/v1/users` admin CRUD, reset-password, and admin contact update endpoints exist but are guarded by `super_admin` only in `internal/router/router.go`; frontend should not expose user management to plain `admin` unless backend policy changes.
- `/v1/contact-directory` exists for all authenticated roles and supports query/team/role/includeInactive/page/limit; it can support team member count/display without adding backend endpoints.
- `/v1/teams` list/detail are public-cached; create/update/delete exist and are `super_admin` only. Frontend already has service + mutations for these endpoints.
- `/v1/tasks` exists with authenticated list/detail/create/update/delete. List filters supported by the current controller are `workDate`, `teamId`, `jobTypeId`, `feederId`, plus page/limit; response includes before/after image URL arrays.
- `/v1/tasks/by-team` supports grouped task data with `workDate`, `teamId`, `jobTypeId`, `feederId` filters. `/v1/tasks/by-filter` is year/month oriented; controller currently reads year/month only, so do not rely on its `teamId` param unless K5 patches/verifies it.
- Task records do not expose a separate status field in `src/types/task-daily.ts`; K4 must not invent status filtering or board lanes.
- Dashboard API/routes still exist for now, but this phase should hide dashboard from the admin hub rather than remove backend/dashboard code.

## Suggested implementation graph

### K0 — Scope confirmation doc + repo orientation
Confirm current routes/services/policies, update this plan if repo facts differ, then hand off exact implementation notes.

### K1 — Admin hub IA cleanup
Update `/admin` and main nav copy:
- Rename `จัดการข้อมูล`/old admin copy as needed to `จัดการระบบ`.
- Remove Dashboard section/card from visible admin hub for now.
- Group existing master-data pages under concise sections.
- Add new cards/routes for `ผู้ใช้และสิทธิ์`, `ทีมงาน`, `งานทั้งหมด` only if they can be backed by existing APIs.
- Keep admin role visibility consistent with `src/lib/auth/role-policy.ts`.

### K2 — Users management page
Implement `/admin/users`:
- Add `user.service.ts` + query/mutations because frontend does not currently have a dedicated `/v1/users` service.
- Route/menu visibility should be `super_admin` only unless K5 intentionally changes backend policy; current backend guards all `/v1/users` admin CRUD with `super_admin`.
- List/search/filter by role/team/status only where supported. `/v1/users` currently exposes page/limit only; use client-side filtering or `contact-directory` for richer query filters unless backend adds safe server filters.
- Mobile cards + desktop table.
- Edit username/role/team/active status if existing API supports it.
- Reset password can be exposed only for `super_admin` and only with deliberate UI confirmation because `/v1/users/:id/reset-password` exists.

### K3 — Teams management page polish
Implement or expose `/admin/teams`:
- Team list, create/edit/delete are backed by existing `/v1/teams`; current backend allows writes only for `super_admin`.
- Show member count or members via existing `contact-directory` data if needed; do not add a team-members endpoint for this phase.
- Mobile cards + desktop table.
- Add to admin hub/menu and `role-policy.ts` with `super_admin` visibility for write actions; read-only visibility for `admin` only if K1/K5 intentionally allows it.

### K4 — Admin jobs page
Replace placeholder `/admin/task-daily` or add a better alias/card as `งานทั้งหมด`:
- Reuse `taskDailyService.getAll` (`/v1/tasks`) for flat admin list/detail flows; use `/v1/tasks/by-team` only if grouped-by-team display is required.
- Filters supported now: work date, team, job type, feeder. Do not show status filter because task records have no status field.
- Detail drawer/card with before/after photo thumbnails from `urlsBefore` / `urlsAfter` if available.
- Do not build board/analytics/SLA.

### K5 — Backend guard/API gap review
Backend worker checks whether existing user/team/task endpoints support the frontend scope and have proper auth/role tests. If gaps exist, patch with TDD. If no backend change needed, complete with evidence.

### K6 — Mobile QA + final gates
Run frontend lint/type/build, backend tests if touched, and mobile/tablet responsive checks. Verify dashboard is not visible from admin hub for this phase.

## Verification commands
Frontend:
```bash
cd /Users/sakdithat/Desktop/myproject/hotlines3
npm run lint
npx tsc --noEmit
npm run build
```

Backend if changed:
```bash
cd /Users/sakdithat/Desktop/myproject/backend-hotline
go test ./...
```

## Acceptance checklist
- [ ] `/admin` reads as lightweight `จัดการระบบ`, not analytics dashboard.
- [ ] Dashboard card/menu is removed or hidden from the admin hub for this phase.
- [ ] Admin hub only exposes essential sections: users, teams, jobs, existing master-data/settings as appropriate.
- [ ] Desktop tables and mobile cards are both readable.
- [ ] Tablet layout is comfortable with no cramped controls.
- [ ] No horizontal scroll at 390px.
- [ ] Dangerous admin actions follow existing backend role policy.
- [ ] Workers leave review-required handoffs for code changes; reviewer/QA verifies before final done.
