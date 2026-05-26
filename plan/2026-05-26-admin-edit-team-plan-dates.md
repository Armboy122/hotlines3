# Admin Edit Team Plan Dates — Kanban Execution Plan

> **For Hermes workers:** Execute via Kanban cards. Follow strict TDD: write failing test first, verify RED, implement minimal GREEN, then run scoped + full gates.

**Goal:** แอดมิน/ผู้มีสิทธิ์จัดการแผนงานต้องแก้ไขวันที่ของงานแผนทีมได้จากหน้า `/planning` โดยไม่ทำลายสิทธิ์ viewer/user และไม่ทำให้แผนไร้วัน/ช่วงวันผิดพลาด

**Architecture:** Frontend Next.js SPA talks to Go backend REST `/v1/team-plans/:id`. Backend remains source of truth for role/date validation. Frontend exposes clear Thai UI to edit start/end date and work time only when `actions.canEdit=true`.

**Repos:**
- Frontend: `/Users/sakdithat/Desktop/myproject/hotline/hotlines3`
- Backend: `/Users/sakdithat/Desktop/myproject/hotline/backend-hotline`

**Current evidence:**
- Frontend has `teamPlanService.update(id, data)` and `/planning` imports `useUpdateTeamPlan`.
- Backend `UpdateRequest` includes `startDate`, `endDate`, `workTime`, `status`; controller parses `YYYY-MM-DD`.
- Backend update currently uses pointer fields, so workers must verify omitted/null/empty semantics before changing clear-date behavior.

## Locked Contract (K0, 2026-05-26)

Source anchors inspected:
- Frontend `/planning`: `src/app/(main)/planning/page.tsx`, `src/lib/planning-ui.ts`, `src/lib/auth/role-policy.ts`, `src/hooks/mutations/useTeamPlanMutations.ts`, `src/types/team-plan.ts`.
- Backend team plan policy/API: `internal/feature/auth/policy/roles.go`, `internal/feature/teamplan/entity/entity.go`, `internal/feature/teamplan/service/initiator.go`, `internal/feature/teamplan/controller/v1.go`, `internal/feature/teamplan/dto/dto.go`, existing tests under `internal/feature/teamplan/**`.
- Wiki/source-of-truth: `~/Desktop/myproject/wiki/entities/projects/hotline.md` and `hotline-u3-thai-state-copy-rules-2026-05-22.md` confirm final roles and Thai no-permission copy.

Final role wording:
- Thai user request word `แอดมิน` maps to existing `super_admin` only.
- Final valid roles are `super_admin`, `team_lead`, `user`, `viewer`.
- Legacy `admin` may still exist as a constant only for migration/rejection tests; it is not an admin-equivalent role and must not gain edit-date permission.

Edit-date permission contract:
- Backend remains source of truth. Frontend must show/enable edit only from API `actions.canEdit=true`; it must not infer permission from labels or route access.
- `super_admin` can edit any team-plan date/team fields where backend `CanUpdateTeamPlan` allows it.
- `team_lead` and `user` can edit own-team team-plan records where backend `CanUpdateTeamPlan` allows it.
- `viewer` and legacy `admin` cannot create/edit/delete team plans and must not see enabled edit/delete CTAs.
- `viewer` read-only page/access remains allowed for visible planning data.

Date mutation contract:
- Valid date format is `YYYY-MM-DD`.
- `PUT /v1/team-plans/:id` date edits must support `startDate`, `endDate`, `workTime`, and status preservation/update through existing endpoint.
- `endDate < startDate` is blocked client-side before save and backend-side with `ErrInvalidRange`/400.
- Omitted date fields preserve existing DB values.
- Explicit date clearing is out of scope for this Day 1-3 feature because current DTO/controller/service use pointer fields that do not distinguish omitted vs `null`/empty clear. UI must not expose a clear-date flow for an already scheduled team plan; if the native date input is emptied during edit, block save with Thai validation copy instead of sending a clear request.
- Existing unscheduled/draft behavior remains: creating or keeping a draft without `startDate` is allowed; setting `startDate` may transition draft/planned according to current status rules; no accidental conversion to `planned` unless a start date exists.

## Acceptance Criteria

1. Admin edit path
   - On `/planning`, editable team-plan item shows an edit action in day detail/list/agenda/board context only when `actions.canEdit=true`.
   - Dialog pre-fills existing title/team/date range/work time/location/status.
   - Saving date-only changes calls `PUT /v1/team-plans/:id` with `startDate`, `endDate`, `workTime` and preserves unchanged required fields.
   - Success invalidates `teamPlans`/planning calendar queries and the item moves to the new date cell/range without reload.

2. Permission boundary
   - `viewer` never sees enabled edit CTA.
   - normal `user` and `team_lead` can edit only if backend policy already allows via `actions.canEdit`; UI must not invent permission.
   - `super_admin` can edit date/team where backend permits.
   - legacy `admin` is forbidden and must not be treated as equivalent to `super_admin`.
   - Forbidden backend response shows Thai no-permission copy (`ไม่มีสิทธิ์` / `ไม่มีสิทธิ์เข้าถึง` as appropriate), not silent failure.

3. Date rules
   - Valid format is `YYYY-MM-DD`.
   - `endDate < startDate` is blocked client-side and backend-side.
   - Unscheduled/draft behavior remains consistent with existing migration: no accidental conversion to planned unless a startDate exists.
   - Clearing dates on an already scheduled team plan is not supported in this feature; tests must cover omitted fields preserving existing dates and UI blocking an attempted empty-date edit.

4. Testing / gates
   - Backend: focused controller/service/repository tests, then `go test ./...`.
   - Frontend: assertion-style tests or existing test harness for planning payload/view model, then `npm run lint`, `npx tsc --noEmit`, `npm run build`.
   - Browser smoke: admin edit date success, viewer no edit, invalid date blocked, item moves date.

## Kanban Task Graph

- K0 planner-architect: lock detailed contract and resolve exact admin role wording.
- B1 backend-go: TDD backend date update/permission contract.
- F1 frontend-next: TDD planning edit-date view model/payload tests.
- F2 frontend-next: implement `/planning` edit-date UI after F1 and backend contract.
- Q1 qa-tdd: integration/browser smoke after backend/frontend.
- R1 code-reviewer: final review and release notes after QA.

## Worker Rules

- Do not overwrite unrelated pending diffs in either repo.
- Before edits: run `git status --short` and inspect touched files.
- Tests first. If a test passes on first run, rewrite it until it proves missing behavior.
- Use Thai UI copy, no demo/credit text, no dashboard scope.
- Keep implementation minimal: edit dates/status/work time in existing planning surface; do not add analytics/monitoring.
