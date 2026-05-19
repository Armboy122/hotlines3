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
  /\['calendar', 'Calendar'\][\s\S]*\['board', 'Board'\]/.test(pageSource),
  'planning tabs must be Calendar then Board with Calendar default',
)
assert(
  /งานแผนของทีม/.test(pageSource) && /งานจาก monthly plan/.test(pageSource) && /ทั้งหมด/.test(pageSource),
  'planning header must include Requirement C source filter copy',
)
assert(
  /ยังไม่เริ่ม/.test(pageSource) && /กำลังทำ/.test(pageSource) && /เสร็จแล้ว/.test(pageSource) && /ยกเลิก/.test(pageSource),
  'planning header must include Requirement C status filter copy',
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
  !/ศูนย์ควบคุมแผนงาน/.test(renderedSource) && !/งานระดมทีม/.test(renderedSource),
  'planning visible page must use production Requirement C copy, not legacy large-work center copy',
)
assert(
  /<h1[^>]*>ระบบวางแผนงาน<\/h1>/.test(renderedSource),
  'planning page title must use Thai Requirement C title ระบบวางแผนงาน, not English Planning',
)
assert(
  /team_plan:\s*'bg-sky-/.test(planningTypeBadgeSource) && /monthly_plan:\s*'bg-teal-/.test(planningTypeBadgeSource),
  'planning source badges/dots must use Requirement D source colors: team-planning blue and monthly-plan teal',
)
assert(
  !/emerald|green/.test(calendarGridSource),
  'planning calendar surface must not use legacy green/emerald styling after Requirement D override',
)

console.log('Planning redesign requirement assertions passed ✓')
