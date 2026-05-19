# Hotline System-wide Mobile Fit UI Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task. Start from mobile viewport QA, then desktop. Do not make visual-only changes without browser evidence.

**Goal:** Fix the whole Hotline frontend so every page fits mobile viewports without horizontal clipping, bottom-nav overlap, or squeezed desktop layouts.

**Trigger evidence:** User screenshot on 2026-05-19 shows `/planning` clipped horizontally: the left side of content is cut off, the right side has unused blank gutter, filters/cards extend beyond the visible viewport, and bottom nav overlaps/competes with the calendar.

**Architecture:** Establish global layout constraints first, then migrate each page to the same responsive shell/pattern. The frontend remains API-only; backend changes are not expected except if API state is needed for QA fixtures.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS, TanStack Query, Go/Gin backend API.

---

## 0. Root cause hypothesis from screenshot

Visible symptoms:
- Main content is wider than the viewport and shifted left; the first tab/filter chip is clipped at the left edge.
- Calendar/card sections likely use fixed-width or minimum-width containers that do not shrink inside the page shell.
- A centered `max-w-*` shell plus child `min-w-*` / 7-column calendar / wide tab row appears to create horizontal overflow.
- Header is okay-ish but tight; mobile user badge + logout + logo leave little space.
- Bottom nav is fixed and visible, but page content/calendar has insufficient safe-area/bottom padding and feels covered.
- Calendar grid cells are too short/empty for operational information; dots alone do not answer “วันนี้ไปไหน”.

Likely technical causes to verify:
- Root layout lacks `overflow-x-hidden` guard and/or page children have `min-w-*`/fixed widths.
- Page sections use `w-[...]`, `min-w-*`, `grid-cols-*`, or `max-w-*` without mobile overrides.
- Calendar uses desktop-first structure on mobile instead of a mobile calendar summary + agenda stack.
- Bottom nav uses fixed positioning but pages have inconsistent `pb-*` and no shared safe-area token.

---

## 1. Design target

### Global mobile contract

Every primary page must satisfy:
- No horizontal scroll at 320, 360, 390, 430, 768, and desktop widths.
- `document.documentElement.scrollWidth <= document.documentElement.clientWidth`.
- All interactive touch targets are at least 44×44px.
- Fixed header and bottom nav never cover primary content.
- Tables never appear as squeezed tables below `md`; use cards/list on mobile.
- Dialogs become bottom sheets or full-screen sheets on mobile.
- Thai labels wrap; no clipped text in tabs, filters, cards, or nav.

### System visual direction

Follow Requirement D:
- Clean Thai field-operations system.
- Official/deep blue primary.
- Light neutral background.
- Mobile cards and readable Thai text over dense decorative UI.
- No demo/MVP/credit copy.

---

## 2. Implementation phases

### Phase A — Global layout guardrails

**Objective:** Prevent the whole app from becoming wider than the viewport.

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/(main)/layout.tsx`
- Modify: `src/components/header.tsx`
- Modify: `src/components/navbar.tsx`
- Modify: `src/components/ui/page-shell.tsx`
- Create: `src/lib/mobile-layout.test.ts` or `src/app/(main)/layout-mobile-contract.test.ts`

**Changes:**
1. Add root-level horizontal overflow guard: `min-w-0 overflow-x-hidden` on body/main wrappers where appropriate.
2. Change main layout to a shared mobile-safe structure:
   - top padding accounts for fixed header
   - bottom padding accounts for bottom nav + safe area: `pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-8`
3. Ensure `PageShell` uses `min-w-0`, `max-w-full`, and mobile `px-3` only; never lets children force viewport overflow.
4. Make header mobile composition stricter:
   - logo block can shrink (`min-w-0`)
   - app name truncates if needed
   - user badge max-width/truncate
5. Bottom nav:
   - keep compact 5-item max visible nav
   - labels truncate but icons remain centered
   - safe-area padding always present

**Acceptance:**
- [ ] Header content does not overflow at 320px.
- [ ] Bottom nav remains usable and does not cover page CTA/content.
- [ ] No global horizontal scroll on an empty/simple page.

---

### Phase B — Create reusable responsive primitives

**Objective:** Stop each page from inventing mobile behavior independently.

**Files:**
- Create/modify: `src/components/ui/page-shell.tsx`
- Create: `src/components/ui/mobile-section.tsx`
- Create: `src/components/ui/filter-bar.tsx`
- Create: `src/components/ui/mobile-bottom-sheet.tsx` if existing dialog/drawer primitives are insufficient
- Create tests for source assertions and responsive class contracts.

**Components/patterns:**
1. `PageShell`: standard max width, padding, safe bottom spacing.
2. `PageHeader`: title + compact action slot; action wraps below title on mobile.
3. `FilterBar`: mobile horizontal chips or stacked selects; desktop inline controls.
4. `ResponsiveTabs`: `w-full grid grid-cols-*` or horizontally scrollable chips with no page overflow.
5. `MobileCardList`: common card/list structure for mobile tables.
6. `MobileBottomSheet`: `fixed inset-x-0 bottom-0 max-h-[90dvh] overflow-y-auto pb-safe`.

**Acceptance:**
- [ ] New pages can use primitives without adding fixed-width wrappers.
- [ ] No primitive uses `min-w-*` that can force overflow below `sm`.
- [ ] Tabs/filter chips stay inside viewport.

---

### Phase C — Fix `/planning` first because it is default after login

**Objective:** Make the screenshot page fit the phone and become operationally readable.

**Files:**
- Modify: `src/app/(main)/planning/page.tsx`
- Modify: `src/lib/planning-ui.ts`
- Modify/add tests: `src/app/(main)/planning/planning-redesign-requirements.test.ts`
- Add mobile visual/DOM QA script or route report under `.hermes-artifacts/` (not committed unless promoted)

**Changes:**
1. Remove/replace any fixed/min-width containers in header, filters, KPI cards, tabs, and calendar.
2. Mobile layout order:
   - compact month header
   - primary action / refresh row
   - active filters as chips or full-width selects
   - summary cards in `grid-cols-2`, never clipped
   - tabs full width: Calendar | Board
   - month calendar full width
   - agenda/list below calendar
3. Calendar mobile pattern:
   - 7-column grid must be `w-full min-w-0`.
   - Use `min-h-*` cells rather than square cells when showing details.
   - Show day number + source dots + short location line/+N where possible.
   - Tapping a day opens details/agenda; do not rely on dots alone.
4. Board mobile pattern:
   - stacked lanes/accordion, no drag-only requirement.
   - primary assignment/action visible without expanding hidden panels.
5. Keep backend integration intact; do not reintroduce mock-only behavior.

**Acceptance:**
- [ ] `/planning` has no horizontal scroll at 320/390px.
- [ ] Month controls, filters, KPI cards, tabs, calendar, and bottom nav are all fully visible.
- [ ] Calendar detail remains reachable by tap.
- [ ] Calendar still separates source/status per Requirements C/D.

---

### Phase D — Apply same layout to the rest of user-facing pages

**Objective:** Make every main flow mobile-first and consistent.

**Pages/files:**
- `/monthly-plan`: `src/app/(main)/monthly-plan/page.tsx`
- `/daily-report`: `src/app/(main)/daily-report/page.tsx`, `src/features/task-daily/components/task-daily-form.tsx`
- `/work-report`: `src/app/(main)/work-report/page.tsx`, `src/features/work-report/work-report-client.tsx`
- `/contacts`: `src/app/(main)/contacts/page.tsx`
- `/admin`: `src/app/(main)/admin/**`, `src/components/pages/admin/*-client.tsx`

**Rules by page:**
1. Monthly Plan:
   - file sections become mobile cards
   - upload/action area stays visible but not sticky over content
   - team/other-team sections stack cleanly
2. Daily Report:
   - form is single column on mobile
   - sticky save bar must sit above bottom nav or be integrated into page bottom spacing
   - image upload cards fit 1-column mobile and 2-column tablet+
3. Work Report:
   - report list uses cards on mobile, table/list only desktop
   - detail drawer becomes bottom sheet/full-screen sheet on mobile
4. Contacts:
   - mobile cards show name, username, position/team, role, tel action
   - phone action is a real `tel:` link
5. Admin:
   - all master-data tables must have mobile card alternative
   - dialogs use `w-[calc(100vw-1rem)] max-h-[92dvh] overflow-y-auto`
   - risk actions remain confirmed and readable

**Acceptance:**
- [ ] Each route has no horizontal scroll at 320/390px.
- [ ] No desktop table is visible below `md` unless it is inside an intentional horizontal scroller with clear affordance; preferred is mobile cards.
- [ ] All dialogs/sheets fit within viewport.

---

### Phase E — Objective mobile QA automation

**Objective:** Prevent regressions by measuring layout instead of eyeballing only.

**Files:**
- Create: `scripts/mobile-viewport-qa.mjs` or adapt existing CDP/Playwright tooling
- Create: `plan/35-system-wide-mobile-fit-ui-qa-report-template.md` if needed

**QA script should check:**
- routes: `/planning`, `/monthly-plan`, `/daily-report`, `/work-report`, `/contacts`, `/admin`
- viewports: 320×740, 390×844, 430×932, 768×1024, 1440×900
- metrics:
  - `scrollWidth - clientWidth`
  - fixed elements dimensions/positions
  - bottom nav overlap against last visible content
  - tap targets under 44px
  - console errors
- screenshots for each route/viewport.

**Acceptance:**
- [ ] Script returns non-zero on horizontal overflow.
- [ ] Screenshots saved for review.
- [ ] QA result can be attached to Kanban card completion.

---

## 3. Kanban-ready card split

### UI-FIT-1 — Global shell and primitives
Owner: frontend/UX
- Implement Phase A/B.
- Verify with mobile QA on simple pages.

### UI-FIT-2 — `/planning` mobile fit
Owner: frontend
- Implement Phase C.
- This is highest priority because it is default page after login.

### UI-FIT-3 — Reports and forms
Owner: frontend
- Fix `/daily-report` and `/work-report`.
- Focus on sticky submit bar, image upload, drawers.

### UI-FIT-4 — Monthly plan and contacts
Owner: frontend
- Fix file cards, team sections, contact mobile cards.

### UI-FIT-5 — Admin mobile card/table conversion
Owner: frontend
- Fix admin master-data pages and dialogs.

### UI-FIT-QA — Cross-route mobile QA gate
Owner: QA/Playwright
- Run automated viewport checks and manual screenshot review.
- Block completion if any primary route has horizontal scroll or blocked actions.

---

## 4. Verification commands

Run after each implementation card:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Run page/unit tests that exist or are added:

```bash
npx --yes tsx src/app/(main)/planning/planning-redesign-requirements.test.ts
npx --yes tsx src/config/navigation-mobile-ux.test.ts
```

Run mobile QA script once created:

```bash
node scripts/mobile-viewport-qa.mjs --base-url http://127.0.0.1:3000
```

Manual browser checks:
- 320px width
- 390×844
- 430×932
- tablet width
- desktop width

---

## 5. Definition of done

- [ ] No primary route creates horizontal page scroll on mobile.
- [ ] `/planning` screenshot issue is gone: nothing clipped left/right, no blank gutter, bottom nav does not cover calendar/agenda.
- [ ] All main pages use the same shell spacing and safe-area behavior.
- [ ] Tables are desktop-only or have mobile-card alternatives.
- [ ] Dialogs/drawers fit mobile viewport.
- [ ] Thai text remains readable and wraps cleanly.
- [ ] Mobile QA screenshots and metrics are attached to the final handoff.
- [ ] Wiki/Obsidian is updated with the new mobile layout rule once implementation is accepted.
