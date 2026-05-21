# U3 Thai State Copy and No-Permission Design Rules

วันที่: 2026-05-22
สถานะ: Reusable frontend guideline for Hotline production-grade stabilization
ขอบเขต: `/planning`, `/large-work`, `/monthly-plan`, `/daily-report`, `/work-report`, `/contacts`, `/admin` and shared state components

## Scope and user goal

- User goal: ให้ผู้ใช้ภาคสนามและผู้ดูแลระบบเข้าใจสถานะของหน้าจอทันที ไม่เข้าใจผิดว่าข้อมูลเป็นศูนย์ ไม่เจอหน้าว่าง และรู้ว่าต้องทำอะไรต่อเมื่อเกิดปัญหาหรือไม่มีสิทธิ์
- Target viewport: mobile-first at 390x844 or narrower before desktop; avoid horizontal overflow at 320px
- Primary action rule: show only one dominant next action per state, such as `ลองใหม่`, `เพิ่มข้อมูล`, `โทร`, or `กลับไปหน้าหลัก`
- Secondary action rule: secondary actions must be lower emphasis and must not compete with retry or the page primary action
- Architecture rule: frontend only reflects API state; do not invent data, counts, permissions, or success states without backend truth

## Approved Thai copy patterns

Use these as defaults. Route workers may add a noun for context, but must keep the meaning and tone.

| State | Title / short copy | Detail copy | Primary action |
| --- | --- | --- | --- |
| Loading | `กำลังโหลดข้อมูล...` | `โปรดรอสักครู่ ระบบกำลังดึงข้อมูลล่าสุด` | none unless a cancel action exists |
| Loading mutation | `กำลังบันทึก...` | `อย่าปิดหน้านี้จนกว่าระบบจะแจ้งผล` | disabled current action |
| Empty true zero | `ยังไม่มีข้อมูล` | `ยังไม่มีรายการที่ตรงกับเงื่อนไขนี้` | contextual create action only when the role can create |
| Empty filtered | `ไม่พบข้อมูลที่ค้นหา` | `ลองเปลี่ยนคำค้นหา ตัวกรอง หรือช่วงวันที่` | `ล้างตัวกรอง` |
| Error retryable | `เกิดข้อผิดพลาดในการโหลดข้อมูล` | `ระบบยังโหลดข้อมูลไม่ได้ กรุณาลองใหม่อีกครั้ง` | `ลองใหม่` |
| Error save failed | `บันทึกไม่สำเร็จ` | `ตรวจสอบข้อมูลแล้วลองใหม่ หากยังไม่ได้ให้แจ้งผู้ดูแลระบบ` | `ลองใหม่` or `กลับไปแก้ไข` |
| Success | `บันทึกสำเร็จ` | Optional: name the saved item, not generic praise | none, or route-specific next action |
| No permission page | `ไม่มีสิทธิ์เข้าถึง` | `บัญชีนี้ไม่มีสิทธิ์ดูหรือจัดการหน้านี้` | `กลับไปหน้าหลัก` |
| Disabled action | `ไม่มีสิทธิ์` | Tooltip/helper: `ต้องได้รับสิทธิ์จากผู้ดูแลระบบก่อน` | disabled; no hidden side effect |
| Viewer write action | `ไม่มีสิทธิ์` | `viewer ดูข้อมูลได้เท่านั้น ไม่สามารถสร้าง แก้ไข ลบ ดาวน์โหลด หรือส่งออกได้` | none |
| Missing/unavailable count | `ข้อมูลยังไม่พร้อมใช้งาน` | `ยังไม่สามารถยืนยันจำนวนจากระบบหลังบ้านได้` | `ลองใหม่` if query-backed |
| Unreliable metric | `ไม่สามารถแสดงจำนวนได้` | `ข้อมูลจำนวนนี้ยังไม่มีแหล่งยืนยันจาก backend` | none or `ดูรายละเอียด` if verified list exists |

## Component behavior rules

1. Preserve layout shell during loading, empty, and error states.
   - Calendar, table, card list, and admin shell must keep their main frame visible.
   - Use skeleton rows/cards instead of replacing the whole route with a tiny centered box.
2. Loading states must communicate real waiting.
   - Use skeleton/pulse rows for lists and cards.
   - For page-level Suspense, use Thai copy `กำลังโหลดข้อมูล...` with enough vertical space to prevent layout jump.
3. Empty states must distinguish true zero from not-loaded.
   - True empty can use `ยังไม่มีข้อมูล` only after the query succeeded.
   - While loading, never show empty copy.
   - On error, never show empty copy as fallback.
4. Error states must include recovery when recovery is possible.
   - `ลองใหม่` must call the actual refetch or the failed action again.
   - ต้องมี retry ที่เชื่อมกับ refetch หรือ action เดิมจริง.
   - If retry is impossible, explain the next step: `กลับไปหน้าหลัก`, `ตรวจสอบการเชื่อมต่อ`, or `แจ้งผู้ดูแลระบบ`.
5. Success states must be short and tied to the action.
   - Use toast or inline success near the action: `บันทึกสำเร็จ`, `อัปโหลดสำเร็จ`, `ลบข้อมูลสำเร็จ`.
   - Do not use celebratory/demo copy.
6. Disabled states must keep tap targets safe.
   - Buttons remain at least 44px high (`min-h-11`, `h-11`, or `h-12`).
   - Disabled visual style: muted gray, not red. Red is reserved for error/destructive confirmation.
7. Mobile behavior is the baseline.
   - At 390x844, state copy must wrap without clipping.
   - Long details should use 1-2 lines and avoid pushing primary actions below unreachable areas.
   - For bottom-nav routes, keep enough bottom padding so state actions are not covered.

## No-permission and disabled-action rules

- Final roles are `super_admin`, `team_lead`, `user`, and `viewer`; do not write UI copy around legacy `admin` as a final product role.
- `super_admin` may see admin/system management actions when backend allows them.
- `team_lead` sees team-owned work and team operations only where backend allows.
- `user` sees assigned/allowed work and capability-gated actions only where backend allows.
- `viewer` ต้องไม่เห็นหรือกด download/export/write actions.
- Viewer can read, preview details, call phone numbers, and copy text where PRD/userflow allows.
- viewer ต้องไม่เห็นหรือกด download/export/write actions.
- For no-permission pages, use a calm full-state block, not a crash/error block.
- For disabled action education, use inline helper/tooltip copy `ไม่มีสิทธิ์` + reason. Do not silently fail after click.
- Do not rely on hidden buttons as permission enforcement. Backend guard is mandatory; frontend state is explanatory only.
- If direct URL access is blocked, show `ไม่มีสิทธิ์เข้าถึง` and a safe navigation action.

## Unreliable or missing data rules

- ห้ามแสดง 0 เมื่อ backend ยังไม่ส่งข้อมูลที่ยืนยันได้.
- Use `—`, `ข้อมูลยังไม่พร้อมใช้งาน`, or `ไม่สามารถแสดงจำนวนได้` for missing/unverified counts.
- A zero count is allowed only when all of these are true:
  1. the API call succeeded,
  2. the response field exists and is authoritative for that count,
  3. filters/date scopes are visible to the user,
  4. the route does not have an error or partial-load warning.
- If a page has partial data, label it as partial: `แสดงเฉพาะข้อมูลที่โหลดได้`.
- If one widget fails but the route still has usable content, show an inline warning inside that widget and keep the rest of the page usable.
- Admin overview must not present zero-count cards as operational truth unless backend owns and returns those counts.
- Work-report and planning summaries must use real backend data/source fields, not UI guesses or static fallback numbers.

## Anti-patterns

Do not ship these patterns:

- Showing `0` for jobs, contacts, teams, reports, or admin metrics when the API is loading, failed, missing a field, or returns a non-authoritative placeholder.
- Showing `ยังไม่มีข้อมูล` while a query is still loading or after a failed query.
- A blank white route during loading.
- A retry button that does not call `refetch`, repeat the mutation, or navigate to a working recovery path.
- Toast-only error for a page-level load failure; page content also needs an inline error state.
- Red no-permission UI that looks like a system crash.
- Hiding every disabled action without explanation when the user needs to understand required permission.
- Letting viewer trigger create/edit/delete/upload/download/export and then blocking only after API failure.
- English state copy such as `Loading`, `Error`, `No data`, `Forbidden` in production UI.
- Demo/mock/fake/credit copy in production screens.
- Duplicate primary CTAs in empty states, such as one `เพิ่มงานแรก` in the calendar and another in the agenda panel.

## Route-specific notes

- `/planning`: keep Calendar/Board shell visible. Agenda/List must share the calendar query state; do not show empty agenda while the calendar query is loading or failed.
- `/large-work`: empty states must clarify scope, for example no assigned team work versus no visible work for this role.
- `/monthly-plan`: viewer can preview allowed files but cannot download/export. Upload approved/master plan must explain the capability gate.
- `/daily-report`: viewer read-only state must not show create/edit submit CTAs. Form validation errors should be field-level Thai copy.
- `/work-report`: export/download controls are hidden or disabled for viewer; counts and filters must indicate source/date scope.
- `/contacts`: call is the primary mobile action; add/edit/delete are hidden or disabled for viewer. Load failure must not look like an empty contact directory.
- `/admin`: super_admin only. Admin cards must not show misleading counts; use unavailable state until backend confirms counts.

## Frontend worker acceptance checklist

Before handoff, each route/component worker must verify:

- [ ] Thai loading, empty, error/retry, success, no-permission, disabled, and missing-data states are present where relevant.
- [ ] Empty state appears only after successful data load.
- [ ] Error state never falls through to a misleading empty/zero state.
- [ ] Retry calls the real refetch/mutation/action.
- [ ] No unverified count renders as `0`; missing/unreliable count uses `—`, `ข้อมูลยังไม่พร้อมใช้งาน`, or `ไม่สามารถแสดงจำนวนได้`.
- [ ] Viewer cannot create, edit, delete, upload, download, or export via visible or clickable UI.
- [ ] Disabled actions include `ไม่มีสิทธิ์` explanation where the user needs to understand the permission gate.
- [ ] Mobile viewport 390x844 or narrower has no clipped state copy, no hidden primary action, and no horizontal overflow.
- [ ] No English production state copy, demo/mock/fake copy, or production credit copy.
- [ ] `git diff --check` passes.
