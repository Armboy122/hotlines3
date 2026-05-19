# PRD/Userflow Logic Test Coverage

Date: 2026-05-19

## Covered By Automated Tests

- Final 4-role model and legacy `admin` rejection across frontend policy and backend policy.
- Main navigation order: `/planning`, `/large-work`, `/monthly-plan`, `/daily-report`, `/work-report`, `/contacts`, `/admin`.
- Admin route/nav visibility is `super_admin` only.
- Planning team scoping: `team_lead`/`user` own team, `viewer`/`super_admin` cross-team.
- Planning cards do not link directly to Daily Report.
- Large Work calendar markers route to `/large-work`.
- Monthly Plan capability gate for `can_upload_approved_monthly_plan`.
- Viewer monthly-plan download is blocked.
- Work Report source attribution for `team_plan`, `monthly_plan`, `large_work`, and ad hoc.
- Contacts call/copy/detail behavior and viewer no-edit policy.
- Backend protected route groups reject unauthenticated requests before controllers.
- Large Work task completion surfaces Daily Report creation failure and does not recreate for terminal tasks.

## Deferred Product Gaps

- First-class external/emergency/center contact entity is still a product implementation gap; current UI derives contact types from user roles.
- Monthly Plan to Planning conversion is not auto-created; explicit conversion API/UI remains a future implementation gap.
- Full browser smoke requires a running frontend/backend environment and seeded users per role.
- Repository-level Large Work auto-report idempotency is covered by pure helper tests; DB transaction behavior still needs integration coverage when a test database harness is available.
