# Planning Agenda/List UI Review — 2026-05-19

## Scope

Review only. No production UI code was changed.

Target page: `/planning`, especially Calendar + Agenda/List layout.

## Evidence reviewed

- Source: `src/app/(main)/planning/page.tsx`
- Source: `src/features/planning-calendar/components/CalendarGrid.tsx`
- Source: `src/lib/services/planning-calendar.service.ts`
- Requirement source: wiki `hotline-redesign-requirement-c-final-page-by-page-spec-2026-05-18.md`
- Requirement source: wiki `hotline-redesign-requirement-d-design-system-2026-05-19.md`
- Browser check: local Next dev on webpack port 3002 because Turbopack failed on `.next-bak/server 2/middleware` deadlock.
- Mock API check: `GET http://127.0.0.1:8080/v1/planning/calendar/2026/5` returns 1 planning item, but UI shows 0 items.

## Findings

### P0 — Planning calendar data adapter drops API items

`planning-calendar.service.ts` expects backend shape:

- `monthStart`
- `monthEnd`
- `days[].items[]`

The local mock/API currently returns normalized shape:

- `from`
- `to`
- `items[]`
- `summary`

Because `normalizeCalendarResponse()` only reads `month.days`, the page renders an empty calendar and empty Agenda/List even when API has data. This is visible in local browser review: KPI `งานทั้งหมด` is 0 while API returns 1 item.

Expected:

- Page must render dated planning items in Calendar.
- Agenda/List should show relevant cards when no date is selected or when selected date has items.
- Add regression coverage for both accepted API shapes or align mock/API/frontend contract to one shape.

### P1 — Empty/loading/error states make Agenda/List look broken

Current behavior:

- Calendar section replaces the full calendar grid with a dashed empty card.
- Agenda/List remains a side panel with its own dashed empty card and duplicate `เพิ่มงานแรก` CTA.
- During loading/error, Agenda/List can show empty state independently of Calendar query state.

Why it feels wrong:

- Requirement D says loading/empty/error should preserve page structure and avoid layout jumps.
- Desktop spec is `[Month Calendar 70%] [Agenda/List 30%]`; replacing the calendar with a small empty box makes the whole workspace feel unfinished.
- Duplicate empty CTAs split attention.

Expected:

- Keep calendar grid shell visible even when empty; show an inline/month-level empty hint without collapsing the grid.
- Agenda/List should share the same loading/error state as the calendar data query.
- Avoid duplicate primary CTA; keep one clear add action in header or a single contextual empty action.

### P1 — Agenda/List copy and selected-date behavior are inconsistent

Current behavior:

- Section title is English: `Agenda / List`, while product requires Thai-first UI.
- When no date is selected, subtitle says `เลือกวันที่บนปฏิทินเพื่อดูรายการงาน`, but the component receives `filteredItems.slice(0, 8)` and is intended to show items.
- Empty title says `ยังไม่มีงานในเดือนนี้`, even when the real state is “ยังไม่ได้เลือกวันที่” or data failed to normalize.

Expected:

- Use Thai title, e.g. `รายการงาน` or `รายการตามวันที่`.
- Decide one behavior:
  - no date selected = show month agenda (`งานเดือนนี้`) with clear copy, or
  - no date selected = prompt to select a date and do not pass month items.
- Empty copy should distinguish:
  - no month work
  - selected date has no work
  - data loading/error

### P1 — Status model is inconsistent between filters, cards, and Board lanes

Current behavior:

- `planned` is shown as card label `กำหนดวันแล้ว`.
- Status filter has no `planned` / `กำหนดวันแล้ว` option.
- `normalizePlanningStatus('planned')` returns `not_started`, so filtering `ยังไม่เริ่ม` includes planned items.
- Board has a `กำหนดวันแล้ว` lane based on raw `planned`, but the filter model cannot select it.

Expected:

- Treat `planned` as a first-class UI status (`กำหนดวันแล้ว`) across filters, badge, agenda, and board.
- `not_started` / `รอวางแผน` should be reserved for undated/backlog work.

### P2 — Planning item actions look clickable but route to the same place

Current behavior:

- `ดูรายละเอียด`, `แก้ไข`, and `ย้ายลง Calendar` are links.
- Several actions route to `item.source.route`, often `/planning?...`, without opening the right modal/action.
- `ย้ายลง Calendar` is shown as an action, but does not perform move/schedule behavior.

Expected:

- Actions should either perform the action/open the correct UI or be hidden/disabled until implemented.
- Do not show fake/duplicate action links in production UI.

### P2 — Add-work permission rule appears too strict

Requirement C says user with permission can manage own team work. Current UI calculates:

- `canCreateTeam = canCreateTeamPlan(...)`
- `canAddPlanningWork = canCreateTeam && user?.role !== 'user'`

This blocks all `user` roles even if `canCreateTeamPlan` would allow capability-based creation.

Expected:

- Permission behavior should match role/capability rules from Requirement A/C.

## Recommended Kanban split

1. Frontend contract/data fix for planning calendar adapter + tests.
2. UX/UI polish for Calendar + Agenda/List empty/loading/error states and Thai copy.
3. Frontend behavior fix for status filters and action semantics.
4. QA/Playwright verification across desktop/mobile with seeded/mock data.
