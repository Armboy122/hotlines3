import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync('src/app/(main)/admin/task-daily/page.tsx', 'utf8')

assert.match(
  source,
  /DrawerContent className="[^"]*h-dvh[^"]*max-h-dvh[^"]*overflow-hidden/,
  'admin task detail drawer should be viewport-height constrained and hide outer overflow so content does not slide below the screen',
)
assert.match(
  source,
  /<div className="[^"]*min-h-0[^"]*flex-1[^"]*overflow-y-auto/,
  'admin task detail body should be the scroll container between fixed header and footer',
)
assert.match(
  source,
  /<DrawerHeader className="[^"]*shrink-0/,
  'admin task detail header should stay visible and not consume the scroll area',
)
assert.match(
  source,
  /<DrawerFooter className="[^"]*shrink-0/,
  'admin task detail footer should remain reachable instead of being pushed below the viewport',
)

console.log('All admin task detail drawer layout tests passed ✓')
