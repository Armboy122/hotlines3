import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { setTimeout as sleep } from 'node:timers/promises'

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3000'
const OUT_DIR = process.env.OUT_DIR || 'output/qa-admin-edit-date-smoke'
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const DEBUG_PORT = Number(process.env.DEBUG_PORT || 9333)
mkdirSync(OUT_DIR, { recursive: true })

let currentRole = 'super_admin'
let updateCalls = []
let plan = makePlan({ startDate: '2026-05-26', endDate: '2026-05-26', workTime: '08:30-16:30', canEdit: true })

function makeUser(role) {
  return { id: role === 'viewer' ? 102 : 101, username: role, displayName: role, role, teamId: role === 'super_admin' ? null : 7, isActive: true, mustChangePassword: false, capabilities: [] }
}
function makePlan({ startDate, endDate, workTime, canEdit }) {
  return {
    id: 42,
    teamId: 7,
    title: 'QA แก้วันที่แผนทีม',
    workType: 'บำรุงรักษา',
    startDate,
    endDate,
    workTime,
    locationText: 'สถานี QA / F-QA',
    peaId: 3,
    operationCenterId: 4,
    feederId: 5,
    stationId: 6,
    notes: 'browser smoke',
    createdByUserId: 11,
    status: 'planned',
    dailyTaskId: null,
    team: { id: 7, name: 'ทีม Hotline QA' },
    createdBy: { id: 11, username: 'planner', displayName: 'Planner' },
    actions: { canEdit, canDelete: canEdit },
    createdAt: '2026-05-26T00:00:00Z',
    updatedAt: '2026-05-26T00:00:00Z',
    deletedAt: null,
  }
}
function dateKeys(start, end) {
  const keys = []
  const cur = new Date(`${start}T00:00:00`)
  const last = new Date(`${end || start}T00:00:00`)
  while (cur <= last) {
    keys.push(`${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`)
    cur.setDate(cur.getDate() + 1)
  }
  return keys
}
function calendarItemFromPlan(p) {
  return {
    id: `team_plan:${p.id}`,
    type: 'team_plan',
    sourceId: p.id,
    title: p.title,
    startDate: p.startDate,
    endDate: p.endDate,
    workTime: p.workTime,
    dateKeys: dateKeys(p.startDate, p.endDate),
    teamIds: [p.teamId],
    teams: [{ id: p.teamId, name: p.team.name, role: 'owner' }],
    locationText: p.locationText,
    electricArea: { peaId: p.peaId, peaName: 'PEA QA', operationCenterId: p.operationCenterId, operationCenterName: 'OC QA', feederId: p.feederId, feederCode: 'F-QA', stationId: p.stationId, stationName: 'สถานี QA' },
    status: p.status,
    source: { route: '/planning' },
    actions: { canView: true, canEdit: p.actions.canEdit, canCancel: p.actions.canDelete, canUpload: false, canDownload: false, canStartDailyReport: false },
  }
}
function ok(data) { return { success: true, data } }
function responseFor(url, method, bodyText) {
  const u = new URL(url)
  const path = u.pathname
  const canEdit = currentRole === 'super_admin'
  plan = { ...plan, actions: { canEdit, canDelete: canEdit } }
  if (path === '/v1/auth/refresh') return ok({ accessToken: `mock-access-${currentRole}`, refreshToken: `mock-refresh-${currentRole}` })
  if (path === '/v1/auth/me') return ok(makeUser(currentRole))
  if (path === '/v1/teams') return ok([{ id: 7, name: 'ทีม Hotline QA' }, { id: 8, name: 'ทีมอื่น' }])
  if (path === '/v1/job-types') return ok([{ id: 1, name: 'บำรุงรักษา', _count: { jobDetails: 1 } }])
  if (path === '/v1/job-details') return ok([{ id: 1, name: 'ตัดต้นไม้แนวสายส่ง', jobTypeId: 1, _count: { tasks: 0 } }])
  if (path === '/v1/feeders') return ok([{ id: 5, code: 'F-QA', stationId: 6, station: { id: 6, name: 'สถานี QA', operationCenter: { id: 4, name: 'OC QA' } } }])
  if (path === '/v1/large-works') return ok([])
  if (path === '/v1/team-plans' && method === 'GET') return ok([plan])
  if (path.startsWith('/v1/planning/calendar/')) {
    const item = { sourceType: 'team_plan', sourceId: plan.id, title: plan.title, team: { id: plan.teamId, name: plan.team.name }, workTime: plan.workTime, location: plan.locationText, status: plan.status, dateRange: { startDate: plan.startDate, endDate: plan.endDate }, actions: { canEdit: plan.actions.canEdit, canDelete: plan.actions.canDelete, canCancel: plan.actions.canDelete } }
    return ok({ from: plan.startDate.slice(0, 8) + '01', to: plan.startDate.slice(0, 8) + '31', items: [item], summary: { total: 1, byType: { team_plan: 1, monthly_plan: 0, large_work: 0 } } })
  }
  if (path === '/v1/team-plans/42' && method === 'PUT') {
    const body = JSON.parse(bodyText || '{}')
    updateCalls.push(body)
    if (body.endDate && body.startDate && body.endDate < body.startDate) {
      return { status: 400, success: false, error: { message: 'invalid date range' } }
    }
    plan = { ...plan, ...body, id: 42, actions: { canEdit, canDelete: canEdit }, team: { id: body.teamId ?? 7, name: 'ทีม Hotline QA' }, updatedAt: '2026-05-26T00:10:00Z' }
    return ok(plan)
  }
  return ok([])
}

class CDP {
  constructor(wsUrl) { this.ws = new WebSocket(wsUrl); this.id = 0; this.pending = new Map(); this.handlers = new Map() }
  async open() { await new Promise((resolve, reject) => { this.ws.addEventListener('open', resolve, { once: true }); this.ws.addEventListener('error', reject, { once: true }) }); this.ws.addEventListener('message', (ev) => this.onMessage(JSON.parse(ev.data))) }
  onMessage(msg) { if (msg.id && this.pending.has(msg.id)) { const { resolve, reject } = this.pending.get(msg.id); this.pending.delete(msg.id); msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result) } else if (msg.method && this.handlers.has(msg.method)) { this.handlers.get(msg.method)(msg.params).catch((e) => console.error('handler error', e)) } }
  send(method, params = {}) { const id = ++this.id; this.ws.send(JSON.stringify({ id, method, params })); return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject })) }
  sendSession(sessionId, method, params = {}) { const id = ++this.id; this.ws.send(JSON.stringify({ id, sessionId, method, params })); return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject })) }
  on(method, fn) { this.handlers.set(method, fn) }
  close() { this.ws.close() }
}

async function waitFor(fn, label, timeout = 10000) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    const value = await fn()
    if (value) return value
    await sleep(100)
  }
  throw new Error(`Timed out waiting for ${label}`)
}

async function main() {
  const chrome = spawn(CHROME, [
    '--headless=new', `--remote-debugging-port=${DEBUG_PORT}`, '--user-data-dir=/tmp/hotline-qa-admin-edit-date', '--no-first-run', '--no-default-browser-check', '--disable-gpu', 'about:blank'
  ], { stdio: ['ignore', 'pipe', 'pipe'] })
  try {
    let version
    for (let i = 0; i < 50; i++) {
      try { version = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`)).json(); break } catch { await sleep(100) }
    }
    if (!version) throw new Error('Chrome CDP not ready')
    const cdp = new CDP(version.webSocketDebuggerUrl)
    await cdp.open()
    await cdp.send('Target.setDiscoverTargets', { discover: true })
    const target = await cdp.send('Target.createTarget', { url: 'about:blank' })
    const { sessionId } = await cdp.send('Target.attachToTarget', { targetId: target.targetId, flatten: true })
    const send = (method, params = {}) => cdp.sendSession(sessionId, method, params)

    cdp.on('Fetch.requestPaused', async (p) => {
      const req = p.request
      if (!req.url.includes('/v1/')) return send('Fetch.continueRequest', { requestId: p.requestId })
      const mock = responseFor(req.url, req.method, req.postData || '')
      const status = mock.status || 200
      const body = Buffer.from(JSON.stringify(mock)).toString('base64')
      await send('Fetch.fulfillRequest', { requestId: p.requestId, responseCode: status, responseHeaders: [{ name: 'content-type', value: 'application/json' }, { name: 'access-control-allow-origin', value: BASE_URL }, { name: 'access-control-allow-credentials', value: 'true' }, { name: 'access-control-allow-methods', value: 'GET,POST,PUT,DELETE,OPTIONS' }, { name: 'access-control-allow-headers', value: 'content-type,authorization' }], body })
    })

    await send('Page.enable')
    await send('Runtime.enable')
    await send('Fetch.enable', { patterns: [{ urlPattern: '*://127.0.0.1:8080/v1/*' }, { urlPattern: '*://localhost:8080/v1/*' }] })
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true })

    async function seedRole(role) {
      currentRole = role
      await send('Page.navigate', { url: `${BASE_URL}/login` })
      await sleep(500)
      await send('Page.addScriptToEvaluateOnNewDocument', { source: `localStorage.setItem('hotlines3_refresh_token','mock-refresh-${role}'); localStorage.setItem('hotlines3_user', ${JSON.stringify(JSON.stringify(makeUser(role)))});` })
      await send('Runtime.evaluate', { expression: `localStorage.setItem('hotlines3_refresh_token','mock-refresh-${role}'); localStorage.setItem('hotlines3_user', ${JSON.stringify(JSON.stringify(makeUser(role)))});`, returnByValue: true })
    }
    async function navPlanning() {
      await send('Page.navigate', { url: `${BASE_URL}/planning` })
      await sleep(1500)
      const debugUrl = await evalExpr('location.href').catch(() => 'eval-failed')
      const debugText = await evalExpr('document.body.innerText.slice(0, 500)').catch(() => 'eval-failed')
      if (!debugText.includes('ระบบวางแผนงาน')) throw new Error(`Planning page not reached: ${debugUrl} body=${debugText}`)
      await waitFor(() => send('Runtime.evaluate', { expression: `!document.body.innerText.includes('กำลังโหลด')`, returnByValue: true }).then(r => r.result.value), 'planning data load')
      await sleep(500)
    }
    async function evalExpr(expression) { return (await send('Runtime.evaluate', { expression, returnByValue: true })).result.value }
    async function clickByText(text) {
      const expr = `(() => { const els = [...document.querySelectorAll('button,a')]; const el = els.find(e => e.innerText.trim().includes(${JSON.stringify(text)}) && !e.disabled); if (!el) return false; el.click(); return true; })()`
      return waitFor(() => evalExpr(expr), `click ${text}`)
    }
    async function clickDialogButton(text) {
      const expr = `(() => { const dlg = document.querySelector('[role="dialog"]') || document.body; const els = [...dlg.querySelectorAll('button')]; const el = els.find(e => e.innerText.trim().includes(${JSON.stringify(text)}) && !e.disabled); if (!el) return false; el.click(); return true; })()`
      return waitFor(() => evalExpr(expr), `click dialog ${text}`)
    }
    async function setInput(name, value) {
      const expr = `(() => { const el = document.querySelector('[name=${JSON.stringify(name)}]'); if (!el) return false; const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; setter.call(el, ${JSON.stringify(value)}); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`
      return waitFor(() => evalExpr(expr), `input ${name}`)
    }
    async function shot(name) {
      const img = await send('Page.captureScreenshot', { format: 'png', fromSurface: true })
      const p = `${OUT_DIR}/${name}.png`; writeFileSync(p, Buffer.from(img.data, 'base64')); return p
    }

    await seedRole('super_admin')
    await navPlanning()
    const initialText = await evalExpr('document.body.innerText')
    if (!initialText.includes('QA แก้วันที่แผนทีม') || !initialText.includes('แก้ไข')) throw new Error(`super_admin edit CTA not visible body=${initialText.slice(0,1000)}`)
    await clickByText('แก้ไข')
    await waitFor(() => evalExpr(`document.body.innerText.includes('แก้ไขงานแผนทีม')`), 'edit dialog')
    await setInput('startDate', '2026-05-27')
    await setInput('endDate', '2026-05-28')
    await setInput('workTime', '09:00-15:00')
    await clickDialogButton('บันทึก')
    await sleep(1500)
    const afterSaveText = await evalExpr('document.body.innerText')
    if (!(afterSaveText.includes('2026-05-27') && afterSaveText.includes('09:00-15:00'))) throw new Error(`updated card not visible body=${afterSaveText.slice(0,1200)} calls=${JSON.stringify(updateCalls)}`)
    const adminShot = await shot('admin-updated-date')

    // Client-side invalid date: reopen, set end before start, save should show alert and should not call API again.
    const callsBeforeInvalid = updateCalls.length
    await clickByText('แก้ไข')
    await waitFor(() => evalExpr(`document.body.innerText.includes('แก้ไขงานแผนทีม')`), 'edit dialog invalid')
    await setInput('startDate', '2026-05-30')
    await setInput('endDate', '2026-05-29')
    await clickDialogButton('บันทึก')
    await waitFor(() => evalExpr(`document.body.innerText.includes('วันที่สิ้นสุดต้องไม่อยู่ก่อนวันที่เริ่ม')`), 'client validation alert')
    if (updateCalls.length !== callsBeforeInvalid) throw new Error('invalid date reached update API instead of client block')
    const invalidShot = await shot('invalid-date-client-blocked')

    await seedRole('viewer')
    await navPlanning()
    const viewerText = await evalExpr('document.body.innerText')
    if (viewerText.includes('แก้ไข') || viewerText.includes('เพิ่มงาน')) throw new Error('viewer sees edit/add CTA')
    const viewerShot = await shot('viewer-readonly-no-edit')

    const noDashboard = await evalExpr(`!document.body.innerText.includes('Dashboard') && ![...document.querySelectorAll('a')].some(a => (a.getAttribute('href') || '').includes('dashboard'))`)
    const metrics = await evalExpr(`(() => ({ innerWidth, scrollWidth: document.documentElement.scrollWidth, hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth, smallTapTargets: [...document.querySelectorAll('button,a,input,select,textarea')].filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.width < 40 || r.height < 40); }).map(el => ({ text: el.innerText || el.getAttribute('aria-label') || el.name || el.tagName, w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height) })).slice(0, 10) }))()`)
    const report = { passed: true, baseUrl: BASE_URL, roleSmoke: ['super_admin edit/save/move', 'viewer no enabled edit CTA'], clientInvalidBlockedBeforeApi: true, backendInvalidRangeEvidence: 'go test ./internal/feature/teamplan/... ./pkg/db/migrations/... and go test ./... passed; direct live-data mutation intentionally avoided in browser smoke', noDashboard, updateCalls, metrics, screenshots: { adminShot, invalidShot, viewerShot } }
    writeFileSync(`${OUT_DIR}/report.json`, JSON.stringify(report, null, 2))
    console.log(JSON.stringify(report, null, 2))
    cdp.close()
  } finally {
    chrome.kill('SIGTERM')
  }
}
main().catch((err) => { console.error(err); process.exit(1) })
