# U2 Desktop Planning Workspace Pattern — Hotline

วันที่: 2026-05-22
สถานะ: Developer-ready UX/UI handoff
พื้นที่งาน: `/planning`
แหล่งอ้างอิง: `/Users/sakdithat/Desktop/myproject/hotline/plan/37-world-class-production-grade-benchmark-kanban-2026-05-21.md`, `/Users/sakdithat/Desktop/myproject/hotline/plan/38-production-grade-stabilization-contract-2026-05-21.md`, `PRD.md`, `userflow.md`, `src/app/(main)/planning/page.tsx`, `src/features/planning-calendar/components/CalendarGrid.tsx`

## Goal

ทำให้ desktop `/planning` เป็น workspace สำหรับวางแผนงานภาคสนามแบบ manual ที่อ่านสถานการณ์รายเดือนได้เร็ว และแยกหน้าที่ของ Calendar, Agenda/List, Board, และ Context/Map panel ชัดเจน โดยยังไม่เพิ่ม optimization/AI/new dispatch feature ในรอบ stabilization นี้

## User goal / viewport / primary action

- User goal: ดูว่าวันไหนทีมไหนไปทำงานที่ไหน, คัดกรองแหล่งที่มา/สถานะ/ทีม, เปิดรายการที่ต้องจัดการ, และย้ายงานที่ยังไม่กำหนดวันเข้าสู่แผนด้วย flow ที่ backend/API รองรับ
- Target viewport: desktop first for this handoff at `lg+` and `xl` (`1024px+`, ideal `1280px+`), but must degrade to mobile `390x844` or narrower without losing core actions
- Screen/flow: `/planning` after login/default entry
- Primary action: `เพิ่มงาน` / create team plan for users with permission
- Secondary actions: filter by source/status/team, change month, select day, open detail, edit/delete allowed team-plan items, refresh/retry
- Key states: loading, empty, error/retry, success/toast after mutation, disabled/no-permission, read-only viewer, selected day, filtered result, long text, many items in same day

## Workspace hierarchy

Desktop layout must use one stable hierarchy:

1. Command header
   - Title: `ระบบวางแผนงาน`
   - Short operational description only; no marketing/demo copy
   - Primary CTA: `เพิ่มงาน` when allowed
   - Retry/refresh action always visible when data can reload
   - Summary chips: total visible work, active plan days, team-plan/backlog count

2. Control row
   - Month selector first
   - Source filter second
   - Status filter third
   - Team/scope filter only if backend/API contract supports it; otherwise show passive scope chip such as `ทีมของฉัน` / `ทุกทีม` based on role
   - `วันนี้` shortcut as utility action, not primary CTA

3. Workspace body
   - Calendar + Agenda is the default desktop workspace
   - Board is a secondary mode for backlog/status organization
   - Optional map/context panel is a right-side detail surface, not a new route and not a scheduling optimizer

## Desktop layout recommendation

### Default: Calendar + Agenda/List

Use a 12-column mental model:

```text
┌──────────────────────────────────────────────────────────────┐
│ Header: title, primary CTA, retry, filters, summary chips     │
├──────────────────────────────────────────┬───────────────────┤
│ Calendar month grid                       │ Agenda/List       │
│ 8 columns / minmax(0, 1fr)                │ 4 columns / 360px │
│ primary scanning surface                  │ selected day or   │
│                                           │ month list        │
└──────────────────────────────────────────┴───────────────────┘
```

Implementation shape:

- At `lg+`: `grid lg:grid-cols-[minmax(0,8fr)_minmax(360px,4fr)]` or current equivalent `7fr/3fr` if the agenda remains compact.
- Calendar must remain visually first on desktop. DOM order may keep agenda first for mobile if needed, but desktop should use `lg:order-first` for calendar.
- Agenda/List should be sticky with `lg:sticky lg:top-20` and constrained width so it does not stretch into a second table-like page.
- Avoid adding a separate Dashboard. Summary chips are allowed only as local planning counters and must not imply authoritative analytics if backend source is unavailable.

### Board mode

Board is not the default destination. It is for work organization when date is missing or status scanning matters.

Recommended lanes:

1. `รอวางแผน`
   - Items with no scheduled date/backlog
   - Primary use: find work that needs a date/team confirmation
2. `กำหนดวันแล้ว`
   - Scheduled but not started
   - Primary use: verify upcoming workload
3. `กำลังทำ`
   - Active field work state when backend provides it
4. `เสร็จแล้ว`
   - Completed items for traceability
5. `ยกเลิก` should be a filter/status option, not a default lane unless operations explicitly need cancellation review

Board card order inside each lane:

- Highest priority: date/time or `รอวางแผน`
- Then source type: large work, monthly plan, team plan
- Then team name
- Then title/location

Do not implement drag/drop as the persistence model in this stabilization card. If future drag/drop is approved, it must be progressive enhancement over the same draft/API state with keyboard/plain controls still available.

### Optional map/context panel

The map/context panel is optional and should appear only when a date or card is selected and location data is present.

Use cases allowed in this sprint:

- Show selected item's location text, feeder/station/PEA metadata, team list, status, source, and quick link to detail
- If lat/lng exists, show a passive map preview/pin using existing map components
- If no lat/lng exists, show a clear non-blocking message: `ยังไม่มีพิกัด ใช้ข้อมูลพื้นที่จากแผนงานก่อน`

Do not turn this panel into dispatch optimization, route planning, travel-time calculation, skill matching, or AI suggestion.

## Calendar vs Agenda vs Board decision

- Calendar answers: `วันไหนมีงาน / วันนี้ไปไหน / เดือนไหนแน่น`
- Agenda/List answers: `วันที่เลือกมีงานอะไรบ้าง / งานนี้ของทีมไหน / เปิดแก้ไขหรือดูรายละเอียดตรงไหน`
- Board answers: `งานใดยังไม่กำหนดวัน / งานอยู่สถานะใด / ต้องจัดคิวอะไรก่อน`
- Context/Map answers: `งานที่เลือกอยู่พื้นที่ไหน / มีข้อมูลอ้างอิงอะไร / ดูรายละเอียดที่ไหน`

Default tab must remain Calendar. Board is secondary because Hotline is planning-first and day/month scanning is the primary route acceptance requirement.

## Card content rules

Every planning card in Agenda and Board should show the same minimum content:

1. Source badge
   - `งานแผนของทีม` = team-owned manual plan
   - `งานจากแผนรายเดือน` = generated/imported monthly-plan source
   - `งานระดมทีม` = large-work source
2. Status badge
   - `รอวางแผน`, `กำหนดวันแล้ว`, `กำลังทำ`, `เสร็จแล้ว`, `ยกเลิก`
3. Title
4. Location line
   - Preferred fallback: `locationText -> feederCode -> stationName -> peaName -> ไม่ระบุสถานที่`
5. Date/range and time when available
6. Team line
   - Owner team first; participant teams after, truncated with `+N` if crowded
7. Action row based on permissions

Card density rules:

- Desktop Agenda cards can show 2-column metadata.
- Board cards should be more compact than Agenda cards; avoid action overflow by using a kebab/details menu only if actions exceed two visible controls.
- Long Thai text must wrap at title level but metadata should truncate with accessible full label/title.

## Badge and visual semantics

Use source and status badges consistently across Calendar cells, Agenda cards, Board cards, and Context panel.

Source badges:

- Team plan: neutral gray/slate or approved Requirement D source color if already implemented
- Monthly plan: distinct non-status color; must not look like `เสร็จแล้ว`
- Large work: distinct accent; should be recognizable but not imply urgent unless status/priority says so

Status badges:

- `รอวางแผน`: neutral gray
- `กำหนดวันแล้ว`: green/emerald or approved planned token
- `กำลังทำ`: amber/yellow
- `เสร็จแล้ว`: slate/green-muted, visually calmer than active work
- `ยกเลิก`: red

No-permission/disabled badge or action copy:

- Use `ไม่มีสิทธิ์` in the disabled action label or helper text.
- Viewer write/download/export actions should generally be hidden. If an educational disabled state is more useful, it must still be non-interactive and include `ไม่มีสิทธิ์`.

## Permission behavior

Role matrix for this screen:

- `super_admin`
  - See all teams/scopes
  - Can create/edit allowed planning records based on backend permissions
  - Can use filters for source/status/team
- `team_lead`
  - Default scope is own team
  - Can manage own-team planning records if backend allows
  - Can see team-relevant large-work participation
- `user`
  - Default scope is own team/team-relevant work
  - Can create only if role/capability/team contract allows; otherwise disabled with `ไม่มีสิทธิ์`
- `viewer`
  - Read-only overview
  - Must not create/edit/delete/upload/download/export
  - Can inspect Calendar/Agenda/Board and use filters if allowed by backend

Frontend hiding is not security. The Go backend must enforce the same rules for direct API calls.

## State requirements

### Loading

- Header shell and controls remain stable.
- Calendar loads with skeleton grid, not blank space.
- Agenda loads with 3 compact skeleton cards.
- Board loads with lane skeletons.
- Loading copy/aria label should be Thai, e.g. `กำลังโหลดรายการงาน`.

### Empty

Calendar empty state:

- Keep the month grid visible.
- Show Thai helper copy below/near grid: `เดือนนี้ยังไม่มีงานตามเงื่อนไข`.
- If filters are active, copy should suggest clearing filters, not creating fake data.

Agenda empty state:

- Selected day: `วันที่นี้ยังไม่มีงาน`.
- Month/no selected day: `เดือนนี้ยังไม่มีงานตามเงื่อนไข`.

Board empty lane:

- Per lane message: `ยังไม่มีงานในช่องนี้`.
- If the whole board is empty, include one calm state and preserve lane structure.

### Error/retry

- Show Thai error explanation and `ลองใหม่ / รีเฟรช`.
- Do not show stale zero counts as if authoritative.
- If Calendar API fails but team-plan fallback exists, label the partial data explicitly; do not mix partial data silently.

### Success

- Mutations should show Thai toast: created/updated/deleted.
- After mutation, refresh both Calendar and Board data sources if the item can appear in both surfaces.
- If a create/edit dialog closes on success, preserve month/date context.

### Disabled/no permission

- Disabled actions use `disabled`, `aria-disabled` where applicable, and visual disabled style.
- Include `ไม่มีสิทธิ์` for users who might expect the action.
- Viewer write actions should not be active anywhere, including card menus and context panel.

## Responsive behavior

Mobile-first fallback is mandatory even though this card defines desktop.

At `390x844` or narrower:

- Header stacks: title, filters, summary chips, actions.
- Primary CTA is full-width or clearly tap-sized (`min-h-11`) when visible.
- Calendar cells use `min-h` instead of square cells and keep day number + type dots + one short location line + `+N`.
- Agenda appears below Calendar as stacked cards.
- Board lanes become stacked accordions/sections; mobile must not require drag/drop.
- Context/map panel becomes a bottom drawer or inline detail section after selecting an item.
- No horizontal scroll; tap targets at least 44px.

At tablet (`768px`):

- Keep filters in two columns.
- Calendar and Agenda may remain stacked if width is constrained.
- Board can use two columns if cards remain readable.

At desktop (`1024px+`):

- Calendar + Agenda split view.
- Board uses 4 columns only when each lane remains at least ~260px; otherwise use 2 columns.
- Optional context panel can replace or sit under Agenda, but do not create a four-column cramped layout.

## Existing component reuse

Prefer existing components before adding new ones:

- `src/components/ui/button.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/textarea.tsx`
- `src/components/ui/select.tsx` or native select pattern already used in planning page
- `src/components/ui/badge.tsx` / shared badge utilities where practical
- `src/components/ui/skeletons.tsx` for reusable skeleton surfaces
- `src/components/ui/map-component.tsx` only for passive context preview if lat/lng exists
- `src/features/planning-calendar/components/CalendarGrid.tsx`
- `src/features/planning-calendar/components/CalendarMonthSelector.tsx`
- `src/features/planning-calendar/components/PlanningItemTypeBadge.tsx`

Do not add a new design system or broad component library for this card.

## API/data contract notes for frontend workers

Frontend should consume backend-owned data only:

- Calendar items from planning calendar API
- Team plans from team-plan API
- Large work from large-work API
- Monthly plan derived items only through approved backend/service contract

A normalized planning item for UI should include:

- `id`
- `type`: `team_plan | monthly_plan | large_work`
- `sourceId`
- `title`
- `startDate`, `endDate`, `dateKeys`
- `workTime`
- `teamIds`, `teams` with owner/participant roles
- `locationText`
- optional electric area fields: feeder, station, PEA, operation center
- `status`
- `source.route`
- actions: `canView`, `canEdit`, `canCancel`, `canUpload`, `canDownload`, `canStartDailyReport`

Do not infer final permissions or source truth from UI-only conditions when backend can provide action flags.

## Out of scope for U2/stabilization

Explicitly out of scope unless a future card approves it:

- Scheduling optimization
- AI scheduling suggestions
- Travel-time calculation
- Skill matching/resource optimization
- Emergency insertion optimizer
- SLA/live monitoring dashboard
- Full map dispatch surface
- Drag/drop persistence as the only planning workflow
- Offline-first sync/autosave implementation
- Full asset hierarchy/EAM history system
- Bulk import/export
- Production credit/demo/marketing copy
- Frontend-only mock persistence for production planning data

## Developer acceptance criteria

- [ ] `/planning` default view is Calendar + Agenda/List; Board is secondary.
- [ ] Calendar answers day/month scanning and keeps location summary visible in cells.
- [ ] Agenda/List shows selected-day or month list with source badge, status, team, date/time, location, and permission-safe actions.
- [ ] Board shows lanes for `รอวางแผน`, `กำหนดวันแล้ว`, `กำลังทำ`, `เสร็จแล้ว`; `ยกเลิก` is filter/status unless approved as lane.
- [ ] Source badges are consistent across Calendar/Agenda/Board/context.
- [ ] No-permission actions include `ไม่มีสิทธิ์` or are hidden for viewer when write/download/export is not allowed.
- [ ] Loading, empty, error/retry, success/toast, disabled, selected-day, and no-permission states are implemented in Thai.
- [ ] Desktop `1024px+` has no cramped four-column layout; mobile `390x844` has no horizontal overflow.
- [ ] Viewer cannot write/download/export from any planning surface.
- [ ] No optimization/AI/map-dispatch feature is added under this card.
- [ ] `git diff --check` passes before handoff.

## Suggested regression tests for implementation cards

Docs-only U2 does not add code tests, but downstream frontend implementation should add/keep regression tests for:

- Planning tabs remain only Calendar and Board.
- Calendar is default and Board is secondary.
- Source/status filter Thai copy is present.
- Viewer does not see active create/edit/delete/download/export controls.
- Non-creator sees `เพิ่มงาน · ไม่มีสิทธิ์` or no write CTA as appropriate.
- Calendar cell summary includes location and `+N` for multi-item day.
- Board lanes render the four approved lane names.
- Error and empty states use Thai copy and keep layout stable.

## Implementation notes

The current planning page already contains much of the desired pattern:

- Calendar/Board tabs with Calendar default
- Calendar + Agenda split at desktop
- Source/status filters
- Planning item cards with source/status/team/date/location
- Thai loading/empty/error/no-permission copy
- Calendar cells with location summary and `+N`

Frontend workers should harden and refine this pattern rather than replace it. The main design gap for future work is the optional context/map panel, which should stay passive and selected-item based until a separate approved map/dispatch card exists.
