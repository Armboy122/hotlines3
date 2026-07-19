import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const pageSource = readFileSync(resolve(process.cwd(), 'src/app/(main)/planning/page.tsx'), 'utf8')
const calendarGridSource = readFileSync(resolve(process.cwd(), 'src/features/planning-calendar/components/CalendarGrid.tsx'), 'utf8')
const planningTypeBadgeSource = readFileSync(resolve(process.cwd(), 'src/features/planning-calendar/components/PlanningItemTypeBadge.tsx'), 'utf8')
const renderedReturnStart = pageSource.indexOf('return (\n    <div className="mx-auto max-w-7xl')
const renderedReturnEnd = pageSource.indexOf('<TeamPlanDialog', renderedReturnStart)
assert(renderedReturnStart >= 0 && renderedReturnEnd > renderedReturnStart, 'planning rendered return must be discoverable')
const renderedSource = pageSource.slice(renderedReturnStart, renderedReturnEnd)

assert(
  /type PlanningTab = 'calendar' \| 'board'/.test(pageSource),
  'planning page must expose only Requirement C tabs: Calendar and Board',
)
assert(
  /\['calendar', 'ปฏิทิน'\][\s\S]*\['board', 'บอร์ด'\]/.test(pageSource),
  'planning tabs must be Thai Calendar/Board labels with Calendar default',
)
assert(
  /งานแผนของทีม/.test(pageSource) && /งานจากแผนรายเดือน/.test(pageSource) && /งานระดมทีม/.test(pageSource) && /ทั้งหมด/.test(pageSource),
  'planning header must include Thai source filter copy for team/monthly/large work',
)
assert(
  /รอวางแผน/.test(pageSource) && /กำหนดวันแล้ว/.test(pageSource) && /กำลังทำ/.test(pageSource) && /เสร็จแล้ว/.test(pageSource) && /ยกเลิก/.test(pageSource),
  'planning header must include first-class planned and backlog status filter copy',
)
assert(
  /รอวางแผน/.test(pageSource) && /กำหนดวันแล้ว/.test(pageSource) && /กำลังทำ/.test(pageSource) && /เสร็จแล้ว/.test(pageSource),
  'board must include Requirement C lanes',
)
assert(
  /เพิ่มงาน/.test(pageSource) && /ไม่มีสิทธิ์/.test(pageSource),
  'normal users without create permission must see disabled add-work action with ไม่มีสิทธิ์',
)
assert(
  !/team-plan/.test(renderedSource) && !/worker-todos/.test(renderedSource),
  'planning rendered tabs must not expose legacy team-plan or worker-todos tabs',
)
assert(
  !/ศูนย์ควบคุมแผนงาน/.test(renderedSource),
  'planning visible page must use production Requirement C copy, not legacy large-work center copy',
)
assert(
  /<h1[^>]*>ระบบวางแผนงาน<\/h1>/.test(renderedSource),
  'planning page title must use Thai Requirement C title ระบบวางแผนงาน, not English Planning',
)
assert(
  /function PlanningFilterControls/.test(pageSource) && /<Drawer>/.test(pageSource) && /ตัวกรอง\{appliedCount > 0/.test(pageSource),
  'planning mobile filters must be available through a drawer and communicate the applied-filter count',
)
assert(
  renderedSource.indexOf('<CalendarGrid') < renderedSource.indexOf('<PlanningAgenda'),
  'planning calendar must precede the agenda in DOM order so desktop focus order matches the visual work surface',
)
assert(
  /className="hidden md:block"[\s\S]*<PlanningFilterControls/.test(renderedSource) && /className="md:hidden"[\s\S]*<PlanningFilterControls/.test(renderedSource),
  'desktop filters must remain compact while mobile filters are rendered after the core work surface',
)
assert(
  /team_plan:\s*'bg-sky-/.test(planningTypeBadgeSource) && /monthly_plan:\s*'bg-teal-/.test(planningTypeBadgeSource),
  'planning source badges/dots must use Requirement D source colors: team-planning blue and monthly-plan teal',
)
assert(
  !/emerald|green/.test(calendarGridSource),
  'planning calendar surface must not use legacy green/emerald styling after Requirement D override',
)

assert(
  /const dateKeys = plan\.startDate \? expandDateKeys\(plan\.startDate, plan\.endDate \?\? null\) : \[\]/.test(pageSource),
  'planning team-plan fallback items must expand start/end date ranges so 18-20 renders on 18, 19, and 20',
)
assert(
  /useTeamPlans\(\{\s*status:\s*'draft',\s*limit:\s*100\s*\}\)/.test(pageSource),
  'planning board backlog must fetch draft team plans directly so unscheduled work lands in รอวางแผน',
)
assert(
  /useCancelLargeWork/.test(pageSource) &&
    /item\.type === 'large_work'/.test(pageSource) &&
    /cancelLargeWork\.mutate\(item\.sourceId/.test(pageSource),
  'planning page must let authorized owners/super admins delete large-work cards through the cancel mutation',
)

console.log('Planning redesign requirement assertions passed ✓')
