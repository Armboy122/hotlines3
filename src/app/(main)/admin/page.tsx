'use client'

import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  History,
  KeyRound,
  Search,
  ShieldCheck,
  Users,
  UserRoundCog,
} from 'lucide-react'
import { useTeams, useUsers } from '@/hooks/useQueries'
import { PageShell } from '@/components/ui/page-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { User } from '@/types/auth'

const ADMIN_TABS = [
  { id: 'users', label: 'ผู้ใช้', icon: Users },
  { id: 'teams', label: 'ทีม', icon: UserRoundCog },
  { id: 'capabilities', label: 'สิทธิ์/Capability', icon: KeyRound },
  { id: 'audit', label: 'Audit', icon: History },
] as const

type AdminTab = (typeof ADMIN_TABS)[number]['id']

const CAPABILITY_ROWS = [
  {
    user: 'หัวหน้าทีมบำรุงรักษา',
    team: 'ทีม Hotline เขต 1',
    role: 'team_lead',
    capability: 'upload approved monthly plan',
    scope: 'แผนประจำเดือนทุกทีม',
    status: 'พร้อมใช้งาน',
  },
  {
    user: 'เจ้าหน้าที่วางแผน',
    team: 'ทีม Hotline เขต 2',
    role: 'user',
    capability: 'เพิ่ม/แก้แผนทีม',
    scope: 'ทีมของตัวเอง',
    status: 'พร้อมใช้งาน',
  },
  {
    user: 'ผู้ประสานงานกลาง',
    team: 'ส่วนกลาง',
    role: 'user',
    capability: 'เห็นภาพรวมทีมอื่น',
    scope: 'อ่านอย่างเดียว',
    status: 'ตรวจสอบล่าสุด',
  },
]

const AUDIT_ROWS = [
  {
    time: '19 พ.ค. 2569 11:20',
    actor: 'ผู้ดูแลระบบสูงสุด',
    action: 'เปลี่ยนสิทธิ์',
    target: 'ผู้ใช้ / Capability',
    detail: 'grant capability สำหรับอัปโหลดไฟล์อนุมัติ',
    result: 'success',
  },
  {
    time: '19 พ.ค. 2569 10:45',
    actor: 'ผู้ดูแลระบบสูงสุด',
    action: 'ปิดการใช้งาน',
    target: 'ทีม',
    detail: 'ปิดทีมที่ไม่ได้ใช้งานหลังยืนยันผลกระทบ',
    result: 'success',
  },
]

function userDisplayName(user: User): string {
  return user.displayName || user.username
}

function confirmRiskyAction(target: string, consequence: string) {
  window.confirm(`ยืนยันการเปลี่ยนแปลง ${target}\nการดำเนินการนี้มีผลต่อ ${consequence}`)
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
      {active ? 'active' : 'inactive'}
    </span>
  )
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('users')
  const [search, setSearch] = useState('')
  const { data: users = [], isLoading: usersLoading } = useUsers()
  const { data: teams = [], isLoading: teamsLoading } = useTeams()

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q || activeTab !== 'users') return users
    return users.filter((user) =>
      [userDisplayName(user), user.username, user.role, user.team?.name ?? '']
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [activeTab, search, users])

  const filteredTeams = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q || activeTab !== 'teams') return teams
    return teams.filter((team) => team.name.toLowerCase().includes(q))
  }, [activeTab, search, teams])

  const activeUsers = users.filter((user) => user.isActive).length
  const inactiveUsers = Math.max(users.length - activeUsers, 0)

  return (
    <PageShell className="space-y-5" maxWidth="xl">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
              <ShieldCheck className="h-4 w-4" />
              ผู้ดูแลระบบสูงสุดเท่านั้น
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-950 md:text-3xl">จัดการระบบ</h1>
              <p className="mt-1 text-sm text-slate-600">จัดการผู้ใช้ ทีม และสิทธิ์การใช้งาน</p>
            </div>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 md:max-w-md">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>การเปลี่ยนสิทธิ์มีผลต่อการเข้าถึงเมนูและการทำงานของผู้ใช้</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ['จำนวนผู้ใช้ทั้งหมด', users.length],
          ['จำนวนทีมทั้งหมด', teams.length],
          ['จำนวนผู้ใช้ที่ active', activeUsers],
          ['จำนวนผู้ใช้ที่ inactive', inactiveUsers],
          ['จำนวน capability grant ทั้งหมด', CAPABILITY_ROWS.length],
          ['จำนวนการเปลี่ยนแปลงล่าสุด', AUDIT_ROWS.length],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm md:p-4">
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="แท็บจัดการระบบ">
          {ADMIN_TABS.map((tab) => {
            const Icon = tab.icon
            const selected = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-2xl px-4 text-sm font-semibold transition-colors ${selected ? 'bg-blue-700 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={activeTab === 'capabilities' ? 'ค้นหาผู้ใช้, capability, ทีม' : activeTab === 'audit' ? 'ค้นหาผู้กระทำ, target, action' : 'ค้นหาชื่อ, username/email, ทีม'}
              className="min-h-11 rounded-2xl border-slate-200 pl-10"
            />
          </div>
          {activeTab !== 'audit' && (
            <Button
              type="button"
              className="min-h-11 rounded-2xl bg-blue-700 text-white hover:bg-blue-800"
              onClick={() => confirmRiskyAction('ข้อมูลระบบ', 'สิทธิ์และขอบเขตการใช้งาน')}
            >
              {activeTab === 'users' ? 'เพิ่มผู้ใช้' : activeTab === 'teams' ? 'เพิ่มทีม' : 'ให้สิทธิ์'}
            </Button>
          )}
        </div>

        {activeTab === 'users' && (
          <div className="space-y-3">
            {usersLoading ? <p className="text-sm text-slate-500">กำลังโหลดผู้ใช้...</p> : null}
            {!usersLoading && filteredUsers.length === 0 ? <p className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">ยังไม่มีผู้ใช้</p> : null}
            {filteredUsers.map((user) => (
              <div key={user.id} className="grid gap-3 rounded-2xl border border-slate-200 p-4 md:grid-cols-[1.2fr_1fr_0.8fr_auto] md:items-center">
                <div>
                  <p className="font-semibold text-slate-950">{userDisplayName(user)}</p>
                  <p className="text-sm text-slate-500">@{user.username}</p>
                </div>
                <p className="text-sm text-slate-700">{user.team?.name ?? 'ยังไม่กำหนดทีม'}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">{user.role}</span>
                  <StatusBadge active={user.isActive} />
                </div>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  <Button variant="outline" size="sm">ดูรายละเอียด</Button>
                  <Button variant="outline" size="sm" onClick={() => confirmRiskyAction(userDisplayName(user), 'role ทีม และสถานะของผู้ใช้')}>แก้ไขผู้ใช้</Button>
                  <Button variant="outline" size="sm" onClick={() => confirmRiskyAction(userDisplayName(user), 'การเข้าใช้งานระบบของผู้ใช้')}>เปิด/ปิดการใช้งาน</Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="space-y-3">
            {teamsLoading ? <p className="text-sm text-slate-500">กำลังโหลดทีม...</p> : null}
            {!teamsLoading && filteredTeams.length === 0 ? <p className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">ยังไม่มีทีม</p> : null}
            {filteredTeams.map((team) => (
              <div key={team.id} className="grid gap-3 rounded-2xl border border-slate-200 p-4 md:grid-cols-[1.4fr_1fr_auto] md:items-center">
                <div>
                  <p className="font-semibold text-slate-950">{team.name}</p>
                  <p className="text-sm text-slate-500">คำอธิบายและสมาชิกทีมดูได้ในรายละเอียด</p>
                </div>
                <p className="text-sm text-slate-700">team_lead: รอข้อมูลจาก API</p>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  <Button variant="outline" size="sm">ดูสมาชิกทีม</Button>
                  <Button variant="outline" size="sm" onClick={() => confirmRiskyAction(team.name, 'team_lead และสมาชิกทีม')}>แก้ไขทีม</Button>
                  <Button variant="outline" size="sm" onClick={() => confirmRiskyAction(team.name, 'สถานะทีมและการมองเห็นในระบบ')}>เปิด/ปิดทีม</Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'capabilities' && (
          <div className="space-y-3">
            <p className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">capability may override normal role behavior สำหรับ scope ที่กำหนด ต้องตรวจสอบก่อน grant/revoke</p>
            {CAPABILITY_ROWS.map((row) => (
              <div key={`${row.user}-${row.capability}`} className="grid gap-3 rounded-2xl border border-slate-200 p-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-center">
                <div>
                  <p className="font-semibold text-slate-950">{row.user}</p>
                  <p className="text-sm text-slate-500">{row.team} · {row.role}</p>
                </div>
                <p className="text-sm font-medium text-blue-700">{row.capability}</p>
                <p className="text-sm text-slate-600">scope: {row.scope}</p>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  <Button variant="outline" size="sm">ดูรายละเอียด</Button>
                  <Button variant="outline" size="sm" onClick={() => confirmRiskyAction(row.user, `capability ${row.capability}`)}>revoke capability</Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-3" data-read-only="true">
            <p className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">Audit เป็น readOnly / อ่านอย่างเดียว ไม่มี action แก้ไขหรือลบประวัติ</p>
            {AUDIT_ROWS.length === 0 ? <p className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">ยังไม่มีประวัติการเปลี่ยนแปลง</p> : null}
            {AUDIT_ROWS.map((row) => (
              <div key={`${row.time}-${row.target}`} className="grid gap-2 rounded-2xl border border-slate-200 p-4 md:grid-cols-[1fr_1fr_1fr_0.8fr] md:items-center">
                <div>
                  <p className="font-semibold text-slate-950">{row.time}</p>
                  <p className="text-sm text-slate-500">ผู้กระทำ: {row.actor}</p>
                </div>
                <p className="text-sm text-slate-700">{row.action} · {row.target}</p>
                <p className="text-sm text-slate-600">{row.detail}</p>
                <span className="inline-flex w-fit items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700"><CheckCircle2 className="h-3 w-3" />{row.result}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  )
}
