# U1 Field-First Mobile Card + Action Pattern — 2026-05-22

## Design brief

- Goal: make Hotline field users see the next operational action without reading a desktop-style table.
- User goal: from a phone in the field, identify the work/location/contact, call or navigate if needed, then start and complete the task with clear feedback.
- Target viewport: mobile-first at 320–390px wide; verify at 390×844 or narrower before desktop. Desktop/tablet may use the same card content in a wider grid or as the detail panel for board/calendar rows.
- Screen/flow: reusable card pattern for `/large-work` task cards, `/planning` agenda/today list, `/daily-report` source/completion cards, and `/contacts` mobile contact cards.
- Primary action set: `โทร`, `นำทาง`, `เริ่มงาน`, `เสร็จงาน`.
- Secondary actions: `ดูรายละเอียด`, `คัดลอก`, `แนบรูป`, `บันทึกปัญหา`, `แก้ไข` where role/scope allows.
- Dominant design problem: interaction flow and information hierarchy on mobile, not decorative redesign.

## Existing components to reuse

Use the current frontend component library before adding new components:

- `src/components/ui/card.tsx` for the outer surface.
- `src/components/ui/button.tsx` because sizes already satisfy touch targets: `default`/`sm` use `min-h-11` and `icon` uses `size-11`.
- `src/components/ui/badge.tsx` for source/status/team badges.
- `src/components/ui/drawer.tsx` or existing detail drawer for expanded details.
- `src/components/ui/skeletons.tsx` for loading placeholders if a matching skeleton exists; otherwise create a route-local skeleton first.

Do not introduce new color families in this sprint. Follow the active Hotline Requirement D direction: clean Thai field-operations UI with neutral surfaces and approved role/status colors only. Do not add production credit/demo copy.

## Card anatomy

Each mobile field card should use this order:

1. Status/source strip
   - One compact row above the title.
   - Examples: `วันนี้`, `รอเริ่ม`, `กำลังทำ`, `เสร็จแล้ว`, `ติดปัญหา`, `จากงานระดมทีม`, `แผนเดือน`.
   - If data source is not authoritative, show `ข้อมูลยังไม่พร้อม` instead of fake counts or guessed status.

2. Main identity
   - Work/contact title in Thai, one or two lines max.
   - Secondary line: team/owner/contact type.
   - Keep text at least `text-sm`; do not shrink body copy below readable mobile size.

3. Field context
   - Location/feeder/station/PEA or phone number is first-class content, not hidden in details.
   - For work cards, show the most actionable location line first: `จุดงาน`, `สายป้อน`, `สถานี`, then `การไฟฟ้า`.
   - For contact cards, show role/team/unit and phone number directly.

4. Time/priority/source metadata
   - Compact chips or short lines only.
   - Do not make the card look like a dashboard metric tile.

5. Primary action rail
   - Mobile: 2-column grid for up to 4 actions, each button full-width with `min-h-11` or taller.
   - Desktop/tablet: may become inline row, but keep primary actions visually grouped.
   - Recommended order:
     1. `โทร`
     2. `นำทาง`
     3. `เริ่มงาน`
     4. `เสร็จงาน`

6. Secondary action row
   - Lower visual weight: outline/ghost buttons or text buttons.
   - Common actions: `ดูรายละเอียด`, `คัดลอก`, `แนบรูป`, `บันทึกปัญหา`, `แก้ไข`.
   - Put destructive actions behind confirmation and only for roles that can mutate.

## Primary action rules

### โทร

- Use real `tel:` links for phone-capable cards.
- Thai label: `โทร`.
- Accessible label examples:
  - `aria-label="โทรหา นายสมชาย ใจดี"`
  - `aria-label="โทรหาศูนย์ควบคุม กฟภ."`
- Disabled state:
  - If no phone number: disable and show helper text `ไม่มีเบอร์โทร`.
  - Do not hide the missing-phone state if the phone number is expected by the data contract.
- Viewer: allowed when the PRD/userflow permits call/copy/view.

### นำทาง

- Use a map URL only when lat/long or a reliable location string exists.
- Thai label: `นำทาง`.
- Accessible label: `aria-label="นำทางไปยัง [location]"`.
- Disabled state:
  - No coordinates/location: `ไม่มีพิกัด`.
  - Location exists but map URL cannot be built: `เปิดแผนที่ไม่ได้`.
- Do not implement route optimization/travel-time suggestions in this sprint; this is only an external navigation affordance.

### เริ่มงาน

- Shows only for actionable work assigned to the current user/team scope.
- If not allowed, prefer disabled with reason when educational:
  - `ไม่มีสิทธิ์`
  - `งานนี้ไม่อยู่ในทีมของคุณ`
  - `เริ่มได้เมื่อถึงวันทำงาน`
- On press:
  - Optimistic UI may mark the button loading, but backend status is source of truth.
  - Loading copy: `กำลังเริ่มงาน...`.
  - Success toast: `เริ่มงานแล้ว`.
  - Error toast: `เริ่มงานไม่สำเร็จ ลองใหม่อีกครั้ง`.

### เสร็จงาน

- Requires completion note when the flow needs it; do not silently complete if backend requires evidence/note.
- If completion creates or links a Daily Report from Large Work, show source/reference in the success copy or detail state.
- Loading copy: `กำลังบันทึกผล...`.
- Success toast: `บันทึกเสร็จงานแล้ว`.
- Error toast: `บันทึกเสร็จงานไม่สำเร็จ ลองใหม่อีกครั้ง`.
- If already completed, replace with disabled/success state: `เสร็จแล้ว`.

## Secondary action rules

- `ดูรายละเอียด`: opens drawer/sheet; must be available for viewer/read-only roles.
- `คัดลอก`: allowed for phone/location/reference copy where not sensitive; success toast `คัดลอกแล้ว`.
- `แนบรูป`: only for write-capable roles and only where photos are part of the existing flow; photos remain optional unless PRD says required.
- `บันทึกปัญหา`: for large-work task blocked flow; requires reason.
- `แก้ไข`: hidden or disabled for viewer; team-scoped for `team_lead`/`user`; global only for `super_admin`.

## State coverage

### Loading

- Preserve the card layout with skeleton rows and a disabled action rail.
- Thai visible copy near list-level loading: `กำลังโหลดข้อมูลงาน...` or `กำลังโหลดรายชื่อ...`.
- Buttons in pending mutation state must be disabled and show action-specific copy (`กำลังเริ่มงาน...`, `กำลังบันทึกผล...`).

### Empty

- Empty list copy should name the route context:
  - Planning/today: `ยังไม่มีงานในวันนี้`.
  - Large Work: `ยังไม่มีงานระดมทีมที่มอบหมาย`.
  - Contacts: `ไม่พบรายชื่อที่ค้นหา`.
- Do not show fake/demo cards.
- If role can create within approved scope, show the create CTA; otherwise read-only empty state only.

### Error

- Error state must be visible in Thai and include retry when retryable.
- Example copy: `โหลดข้อมูลงานไม่สำเร็จ` + `ลองใหม่`.
- Keep any stale cached data visually marked if shown: `ข้อมูลอาจไม่ล่าสุด`.

### Success

- Mutation success should confirm the user-visible result with Thai toast and updated card state.
- Examples:
  - `เริ่มงานแล้ว` and status chip becomes `กำลังทำ`.
  - `บันทึกเสร็จงานแล้ว` and status chip becomes `เสร็จแล้ว`.
  - `คัดลอกแล้ว`.

### Disabled

- Disabled actions must explain why when the user might reasonably expect access.
- Approved reasons:
  - `ไม่มีสิทธิ์`
  - `อ่านอย่างเดียว`
  - `ไม่มีเบอร์โทร`
  - `ไม่มีพิกัด`
  - `งานนี้เสร็จแล้ว`
  - `รอซิงก์ข้อมูล`
- Use `disabled`, `aria-disabled` for link-styled controls, and keep the visible target at least 44px high.

### No permission

- Viewer must not see write/download/export as active actions.
- For viewer on field cards:
  - Allowed: `ดูรายละเอียด`, `โทร`, `คัดลอก` where PRD/userflow allows.
  - Not allowed: `เริ่มงาน`, `เสร็จงาน`, `แนบรูป`, `แก้ไข`, `ลบ`, `ดาวน์โหลด`, `ส่งออก`.
- Copy: `คุณมีสิทธิ์อ่านอย่างเดียว` or inline reason `ไม่มีสิทธิ์`.
- Backend/API guards remain required; frontend hiding is not sufficient.

### Offline/sync placeholder

Offline-first sync is deferred by the stabilization contract, but the UI pattern must reserve a placeholder so future work does not redesign the cards:

- Show a non-functional status placeholder only when the app detects offline or queued local action support exists later.
- Copy examples:
  - `ออฟไลน์: บันทึกไว้ในเครื่อง รอซิงก์`
  - `รอซิงก์ข้อมูล`
  - `ซิงก์ไม่สำเร็จ ลองใหม่`
- In this sprint, do not build offline persistence unless a separate card approves it.

## Responsive layout rules

- Mobile 320–390px:
  - One card per row.
  - Use `p-4`, `gap-3`, rounded card surface, and no horizontal scroll.
  - Primary action rail: `grid grid-cols-2 gap-2`; each button `min-h-11` or `min-h-12`.
  - Long Thai text must wrap or line-clamp, not overflow.
- 640–767px:
  - Cards may remain single-column if content is operationally dense.
- 768px+:
  - Cards may become 2-column grid or pair with table/board rows, but mobile card content remains canonical.
- Detail drawer:
  - Mobile drawer/sheet must respect bottom navigation and safe area padding.

## Suggested implementation contract

A future frontend worker can implement this as a reusable `FieldActionCard` or route-local pattern first, then extract only after at least two routes use it.

Suggested props shape, not a new backend contract:

```ts
type FieldActionCardAction = {
  key: 'call' | 'navigate' | 'start' | 'complete' | 'detail' | 'copy' | 'attach-photo' | 'block' | 'edit'
  label: string
  href?: string
  disabled?: boolean
  disabledReason?: string
  loading?: boolean
  ariaLabel: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
}

type FieldActionCardProps = {
  title: string
  subtitle?: string
  statusLabel: string
  sourceLabel?: string
  locationLabel?: string
  phoneLabel?: string
  meta?: string[]
  primaryActions: FieldActionCardAction[]
  secondaryActions: FieldActionCardAction[]
  permissionNote?: string
  syncState?: 'online' | 'offline-queued' | 'syncing' | 'sync-error'
}
```

## Thai copy dictionary

- Call: `โทร`
- Navigate: `นำทาง`
- Start: `เริ่มงาน`
- Complete: `เสร็จงาน`
- Details: `ดูรายละเอียด`
- Copy: `คัดลอก`
- Attach photo: `แนบรูป`
- Block/problem: `บันทึกปัญหา`
- Edit: `แก้ไข`
- Retry: `ลองใหม่`
- Read-only: `อ่านอย่างเดียว`
- No permission: `ไม่มีสิทธิ์`
- No phone: `ไม่มีเบอร์โทร`
- No location: `ไม่มีพิกัด`
- Loading work: `กำลังโหลดข้อมูลงาน...`
- Loading contacts: `กำลังโหลดรายชื่อ...`
- Empty today: `ยังไม่มีงานในวันนี้`
- Empty assigned large work: `ยังไม่มีงานระดมทีมที่มอบหมาย`
- Empty contacts search: `ไม่พบรายชื่อที่ค้นหา`
- Start pending: `กำลังเริ่มงาน...`
- Complete pending: `กำลังบันทึกผล...`
- Start success: `เริ่มงานแล้ว`
- Complete success: `บันทึกเสร็จงานแล้ว`
- Offline queued placeholder: `รอซิงก์ข้อมูล`

## Frontend acceptance criteria

- [ ] Mobile viewport 390×844 or narrower is verified before desktop for every route using the pattern.
- [ ] Cards render with no horizontal overflow at 320px, 390px, 430px, 768px, and desktop widths.
- [ ] All visible action controls are at least 44×44px; current `Button` sizes from `src/components/ui/button.tsx` are reused unless a larger route-specific button is needed.
- [ ] `โทร` uses `tel:` href when phone exists; missing phone renders disabled state with `ไม่มีเบอร์โทร`.
- [ ] `นำทาง` uses a reliable map href only when location/coordinates exist; missing location renders `ไม่มีพิกัด`.
- [ ] `เริ่มงาน` and `เสร็จงาน` are active only for permitted roles/scope and show loading/success/error states in Thai.
- [ ] Viewer sees read-only behavior: no write/download/export actions; allowed call/copy/view remain usable where PRD/userflow permits.
- [ ] Disabled or hidden actions are backed by backend/API authorization; frontend-only hiding is not treated as security.
- [ ] Loading, empty, error, success, disabled, no-permission, and offline/sync placeholder states are covered by component tests or route tests.
- [ ] No fake/demo data, production credit copy, route optimization, or offline persistence is added by this pattern.
- [ ] Thai copy matches the dictionary above or documents a route-specific exception.
- [ ] `git diff --check` passes after implementation.

## Verification run for this handoff

- Source context reviewed:
  - `/Users/sakdithat/Desktop/myproject/hotline/plan/37-world-class-production-grade-benchmark-kanban-2026-05-21.md`
  - `/Users/sakdithat/Desktop/myproject/hotline/plan/38-production-grade-stabilization-contract-2026-05-21.md`
  - `/Users/sakdithat/Desktop/myproject/hotline/PRD.md`
  - `/Users/sakdithat/Desktop/myproject/hotline/userflow.md`
  - `/Users/sakdithat/Desktop/myproject/wiki/entities/projects/hotline.md`
  - `src/components/ui/button.tsx`
  - `src/components/ui/card.tsx`
- This task is a UX handoff only; no production UI code was changed.
