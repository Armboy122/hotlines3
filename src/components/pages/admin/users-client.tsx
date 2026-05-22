'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { Braces, Loader2, Pencil, Plus, RotateCcwKey, ShieldCheck, Trash2, UserCog, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { PageHero, PageShell } from '@/components/ui/page-shell'
import { useCreateUser, useResetUserPassword, useTeams, useUpdateUser, useUsers } from '@/hooks/useQueries'
import { ADMIN_MUTABLE_ROLES, buildBulkCreateUserPayloads, buildCreateUserPayload, buildResetPasswordPayload, buildUpdateUserPayload, parseBulkUserJsonInput, type AdminBulkUserRow } from './admin-k5-helpers'
import type { CreateUserRequest, UpdateUserRequest, User, UserRole } from '@/types/auth'
import type { Team } from '@/types/query-types'

type UserFormMode = 'create' | 'edit'
type RoleFilter = 'all' | UserRole
type StatusFilter = 'all' | 'active' | 'inactive'
type TeamFilter = 'all' | 'unassigned' | `${number}`

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'ผู้ดูแลสูงสุด',
  team_lead: 'หัวหน้าทีม',
  user: 'ผู้ใช้งาน',
  viewer: 'ผู้ดูอย่างเดียว',
}

const baseForm = {
  username: '',
  role: 'user' as UserRole,
  teamId: '',
  isActive: true,
}

type UserFormState = typeof baseForm
type BulkUserRow = AdminBulkUserRow & { id: string }

function isProtectedOwner(user: User) {
  return user.role === 'super_admin'
}

function normalize(text: string | null | undefined) {
  return (text ?? '').toLowerCase().trim()
}

function newBulkRow(): BulkUserRow {
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
  return { id, displayName: '', username: '' }
}

function teamOptionLabel(team: Team) {
  return `${team.name} (#${team.id})`
}

function teamName(user: User, teams: Team[]) {
  if (user.team?.name) return user.team.name
  if (user.teamId == null) return 'ไม่ระบุทีม'
  return teams.find((team) => team.id === user.teamId)?.name ?? `ทีม #${user.teamId}`
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function UserStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${isActive ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-gray-100 text-gray-600 ring-1 ring-gray-200'}`}>
      {isActive ? 'ใช้งาน' : 'ปิดใช้งาน'}
    </span>
  )
}

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
      {ROLE_LABELS[role]}
    </span>
  )
}

interface UserFormDialogProps {
  open: boolean
  mode: UserFormMode
  teams: Team[]
  form: UserFormState
  saving: boolean
  onOpenChange: (open: boolean) => void
  onFormChange: (form: UserFormState) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

function UserFormDialog({ open, mode, teams, form, saving, onOpenChange, onFormChange, onSubmit }: UserFormDialogProps) {
  const isCreate = mode === 'create'
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] w-[calc(100vw-1rem)] overflow-y-auto rounded-3xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isCreate ? 'เพิ่มผู้ใช้ใหม่' : 'แก้ไขผู้ใช้'}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-gray-700">
              รหัสผู้ใช้ (ตัวเลข 6 หลัก)
              <Input
                name="username"
                autoComplete="username"
                value={form.username}
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                minLength={6}
                required
                className="min-h-11 rounded-2xl bg-white"
                onChange={(event) => onFormChange({ ...form, username: event.target.value.replace(/\D/g, '').slice(0, 6) })}
              />
            </label>
            {isCreate && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800 sm:col-span-2">
                ระบบจะตั้งรหัสผ่านเริ่มต้นตามนโยบาย backend และบังคับให้ผู้ใช้เปลี่ยนรหัสผ่านเมื่อเข้าสู่ระบบครั้งแรก
              </div>
            )}
            <label className="space-y-2 text-sm font-medium text-gray-700">
              สิทธิ์
              <select
                aria-label="สิทธิ์ผู้ใช้"
                name="role"
                value={form.role}
                className="min-h-11 w-full rounded-2xl border border-gray-200 bg-white px-3 text-sm shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                onChange={(event) => onFormChange({ ...form, role: event.target.value as UserRole })}
              >
                {ADMIN_MUTABLE_ROLES.map((role) => (
                  <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-gray-700">
              ทีม
              <select
                aria-label="ทีมผู้ใช้"
                name="teamId"
                value={form.teamId}
                className="min-h-11 w-full rounded-2xl border border-gray-200 bg-white px-3 text-sm shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                onChange={(event) => onFormChange({ ...form, teamId: event.target.value })}
              >
                <option value="">ไม่ระบุทีม</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="flex min-h-11 items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm font-medium text-gray-700">
            <input
              name="isActive"
              type="checkbox"
              checked={form.isActive}
              className="h-5 w-5 accent-emerald-600"
              onChange={(event) => onFormChange({ ...form, isActive: event.target.checked })}
            />
            เปิดใช้งานบัญชีนี้
          </label>
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" className="min-h-11 rounded-2xl" onClick={() => onOpenChange(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" className="min-h-11 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              บันทึก
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface BulkUserDialogProps {
  open: boolean
  teams: Team[]
  teamId: string
  rows: BulkUserRow[]
  saving: boolean
  onOpenChange: (open: boolean) => void
  onTeamChange: (teamId: string) => void
  onRowsChange: (rows: BulkUserRow[]) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

function BulkUserDialog({ open, teams, teamId, rows, saving, onOpenChange, onTeamChange, onRowsChange, onSubmit }: BulkUserDialogProps) {
  const [jsonText, setJsonText] = useState('')
  const [jsonError, setJsonError] = useState('')

  const updateRow = (id: string, patch: Partial<AdminBulkUserRow>) => {
    onRowsChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }
  const removeRow = (id: string) => {
    onRowsChange(rows.length > 1 ? rows.filter((row) => row.id !== id) : rows)
  }
  const importJson = () => {
    try {
      const result = parseBulkUserJsonInput(jsonText)
      if (result.teamId) {
        onTeamChange(result.teamId)
      } else if (result.teamName) {
        const matchedTeam = teams.find((team) => normalize(team.name) === normalize(result.teamName))
        if (!matchedTeam) {
          throw new Error(`ไม่พบทีม "${result.teamName}" ในระบบ กรุณาตรวจชื่อทีมหรือเลือกทีมจากรายการ`)
        }
        onTeamChange(String(matchedTeam.id))
      }
      onRowsChange(result.rows.map((row) => ({ ...row, id: newBulkRow().id })))
      setJsonError('')
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : 'นำเข้า JSON ไม่สำเร็จ')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] w-[calc(100vw-1rem)] overflow-y-auto rounded-3xl sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>เพิ่มพนักงานหลายคน</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-900">
              <Braces className="h-4 w-4" />
              วางรายชื่อหรือ JSON
            </div>
            <textarea
              aria-label="รายชื่อพนักงานหรือ JSON"
              name="bulkEmployeeJson"
              value={jsonText}
              rows={6}
              spellCheck={false}
              placeholder={`นายชนวัฒน์ ปรีดาศักดิ์    505047
นายวิชัย เอี่ยมจิตร        506797

หรือ JSON:
{
  "teamName": "หาดใหญ่",
  "employees": [
    { "name": "นายสมชาย ใจดี", "code": "900001" },
    { "name": "นางสาวมาลี ดีมาก", "code": "900002" }
  ]
}`}
              className="min-h-36 w-full resize-y rounded-2xl border border-blue-100 bg-white p-3 font-mono text-sm leading-6 text-gray-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              onChange={(event) => {
                setJsonText(event.target.value)
                setJsonError('')
              }}
            />
            {jsonError && <p className="mt-2 text-sm font-medium text-red-700">{jsonError}</p>}
            <div className="mt-2 flex justify-end">
              <Button type="button" variant="outline" className="min-h-11 rounded-2xl bg-white" disabled={saving || !jsonText.trim()} onClick={importJson}>
                นำเข้ารายชื่อ
              </Button>
            </div>
            <div className="mt-3 rounded-2xl border border-blue-100 bg-white/80 p-3">
              <p className="text-xs font-semibold text-blue-900">เลือกทีมด้านล่างก่อนวางรายชื่อได้เลย หรือถ้าใช้ JSON จะใส่ teamName/teamId ก็ได้</p>
              <div className="mt-2 flex max-h-24 flex-wrap gap-2 overflow-y-auto">
                {teams.map((team) => (
                  <span key={team.id} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">
                    {teamOptionLabel(team)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <label className="space-y-2 text-sm font-medium text-gray-700">
            ทีม
            <select
              aria-label="ทีมสำหรับพนักงานชุดนี้"
              name="bulkTeamId"
              value={teamId}
              required
              className="min-h-11 w-full rounded-2xl border border-gray-200 bg-white px-3 text-sm shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              onChange={(event) => onTeamChange(event.target.value)}
            >
              <option value="">เลือกทีม</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>{teamOptionLabel(team)}</option>
              ))}
            </select>
          </label>

          <div className="space-y-2">
            <div className="hidden grid-cols-[1fr_11rem_2.75rem] gap-2 px-1 text-xs font-semibold text-gray-500 sm:grid">
              <span>ชื่อพนักงาน</span>
              <span>รหัสพนักงาน</span>
              <span aria-hidden="true" />
            </div>
            {rows.map((row, index) => (
              <div key={row.id} className="grid grid-cols-1 gap-2 rounded-2xl border border-gray-100 bg-gray-50 p-2 sm:grid-cols-[1fr_11rem_2.75rem] sm:items-center sm:bg-white">
                <Input
                  aria-label={`ชื่อพนักงานแถวที่ ${index + 1}`}
                  name={`bulkDisplayName-${index}`}
                  autoComplete="name"
                  value={row.displayName}
                  placeholder="ชื่อพนักงาน"
                  required
                  className="min-h-11 rounded-2xl bg-white"
                  onChange={(event) => updateRow(row.id, { displayName: event.target.value })}
                />
                <Input
                  aria-label={`รหัสพนักงานแถวที่ ${index + 1}`}
                  name={`bulkUsername-${index}`}
                  autoComplete="off"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  minLength={6}
                  value={row.username}
                  placeholder="000000"
                  required
                  className="min-h-11 rounded-2xl bg-white"
                  onChange={(event) => updateRow(row.id, { username: event.target.value.replace(/\D/g, '').slice(0, 6) })}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 rounded-2xl px-3"
                  aria-label={`ลบแถวที่ ${index + 1}`}
                  disabled={rows.length === 1 || saving}
                  onClick={() => removeRow(row.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button type="button" variant="outline" className="min-h-11 rounded-2xl" disabled={saving} onClick={() => onRowsChange([...rows, newBulkRow()])}>
            <Plus className="h-4 w-4" />
            เพิ่มแถว
          </Button>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" className="min-h-11 rounded-2xl" disabled={saving} onClick={() => onOpenChange(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" className="min-h-11 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              บันทึกทั้งหมด
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function UsersClient() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [teamFilter, setTeamFilter] = useState<TeamFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formMode, setFormMode] = useState<UserFormMode>('create')
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [form, setForm] = useState<UserFormState>(baseForm)
  const [resettingUser, setResettingUser] = useState<User | null>(null)
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false)
  const [bulkTeamId, setBulkTeamId] = useState('')
  const [bulkRows, setBulkRows] = useState<BulkUserRow[]>(() => [newBulkRow(), newBulkRow()])
  const [bulkSubmitting, setBulkSubmitting] = useState(false)

  const { data: users = [], isLoading, error, refetch } = useUsers({ page: 1, limit: 200 })
  const { data: teams = [] } = useTeams()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const resetPassword = useResetUserPassword()

  const counts = useMemo(() => {
    const active = users.filter((user) => user.isActive).length
    return { total: users.length, active, inactive: users.length - active }
  }, [users])

  const filteredUsers = useMemo(() => {
    const q = normalize(search)
    return users.filter((user) => {
      const matchesSearch = !q || [user.username, user.displayName, teamName(user, teams), ROLE_LABELS[user.role]].some((part) => normalize(part).includes(q))
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      const matchesTeam = teamFilter === 'all' || (teamFilter === 'unassigned' ? user.teamId == null : String(user.teamId) === teamFilter)
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? user.isActive : !user.isActive)
      return matchesSearch && matchesRole && matchesTeam && matchesStatus
    })
  }, [roleFilter, search, statusFilter, teamFilter, teams, users])

  const openCreate = () => {
    setFormMode('create')
    setEditingUserId(null)
    setForm(baseForm)
    setDialogOpen(true)
  }

  const openBulkCreate = () => {
    setBulkTeamId('')
    setBulkRows([newBulkRow(), newBulkRow()])
    setBulkDialogOpen(true)
  }

  const openEdit = (user: User) => {
    if (isProtectedOwner(user)) return
    setFormMode('edit')
    setEditingUserId(user.id)
    setForm({
      username: user.username,
      role: user.role,
      teamId: user.teamId == null ? '' : String(user.teamId),
      isActive: user.isActive,
    })
    setDialogOpen(true)
  }

  const submitUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      if (formMode === 'create') {
        if (!window.confirm('ยืนยันเพิ่มผู้ใช้ใหม่ ระบบจะตั้งรหัสผ่านเริ่มต้นและบังคับเปลี่ยนรหัสผ่านเมื่อเข้าสู่ระบบครั้งแรก')) return
        await createUser.mutateAsync(buildCreateUserPayload(form) as CreateUserRequest)
        toast.success('เพิ่มผู้ใช้สำเร็จ')
      } else if (editingUserId != null) {
        if (!window.confirm('ยืนยันแก้ไขผู้ใช้ การเปลี่ยนสิทธิ์ ทีม หรือสถานะมีผลกับการเข้าใช้ระบบทันที')) return
        await updateUser.mutateAsync({ id: editingUserId, ...(buildUpdateUserPayload(form) as UpdateUserRequest) })
        toast.success('บันทึกผู้ใช้สำเร็จ')
      }
      setDialogOpen(false)
      setEditingUserId(null)
      setForm(baseForm)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'บันทึกผู้ใช้ไม่สำเร็จ')
    }
  }

  const submitBulkUsers = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const payloads = buildBulkCreateUserPayloads({ teamId: bulkTeamId, rows: bulkRows })
      if (!window.confirm(`ยืนยันเพิ่มพนักงาน ${payloads.length} คนเข้าทีมที่เลือก ระบบจะตั้งรหัสผ่านเริ่มต้นและบังคับเปลี่ยนรหัสผ่านเมื่อเข้าสู่ระบบครั้งแรก`)) return
      setBulkSubmitting(true)
      const results = await Promise.allSettled(payloads.map((payload) => createUser.mutateAsync(payload as CreateUserRequest)))
      const failed = results.filter((result) => result.status === 'rejected')
      const succeeded = results.length - failed.length
      if (succeeded > 0) {
        toast.success(`เพิ่มพนักงานสำเร็จ ${succeeded} คน`)
      }
      if (failed.length > 0) {
        const firstError = failed[0]
        const message = firstError.status === 'rejected' && firstError.reason instanceof Error ? firstError.reason.message : 'บางรายการเพิ่มไม่สำเร็จ'
        toast.error(`เพิ่มไม่สำเร็จ ${failed.length} รายการ: ${message}`)
        return
      }
      setBulkDialogOpen(false)
      setBulkTeamId('')
      setBulkRows([newBulkRow(), newBulkRow()])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'เพิ่มพนักงานไม่สำเร็จ')
    } finally {
      setBulkSubmitting(false)
    }
  }

  const submitResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!resettingUser) return
    try {
      if (!window.confirm(`ยืนยันรีเซ็ตรหัสผ่านของ ${resettingUser.username} ระบบจะตั้งรหัสผ่านเริ่มต้นใหม่และบังคับให้เปลี่ยนรหัสผ่านเมื่อเข้าสู่ระบบครั้งถัดไป`)) return
      await resetPassword.mutateAsync({ id: resettingUser.id, ...buildResetPasswordPayload() })
      toast.success('รีเซ็ตรหัสผ่านสำเร็จ')
      setResettingUser(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'รีเซ็ตรหัสผ่านไม่สำเร็จ')
    }
  }

  if (error) {
    return (
      <PageShell maxWidth="xl">
        <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-center text-red-700">
          เกิดข้อผิดพลาด: {error.message}
          <Button onClick={() => refetch()} className="mt-4 min-h-11 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700">ลองใหม่</Button>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell className="space-y-5 sm:space-y-6" maxWidth="xl">
      <PageHero
        eyebrow={<span>ผู้ดูแลสูงสุด</span>}
        icon={<UserCog className="h-6 w-6 text-amber-200" />}
        title="ผู้ใช้และสิทธิ์"
        description="จัดการบัญชีผู้ใช้ บทบาท ทีม และสถานะตามสิทธิ์ที่ backend อนุญาต"
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="card-glass"><CardContent className="p-4"><p className="text-sm text-gray-500">ผู้ใช้ทั้งหมด</p><p className="text-2xl font-black text-gray-900">{counts.total}</p></CardContent></Card>
        <Card className="card-glass"><CardContent className="p-4"><p className="text-sm text-gray-500">ใช้งาน</p><p className="text-2xl font-black text-emerald-700">{counts.active}</p></CardContent></Card>
        <Card className="card-glass"><CardContent className="p-4"><p className="text-sm text-gray-500">ปิดใช้งาน</p><p className="text-2xl font-black text-gray-700">{counts.inactive}</p></CardContent></Card>
      </div>

      <Card className="card-glass">
        <CardContent className="space-y-3 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 lg:flex-1">
              <Input aria-label="ค้นหาผู้ใช้" name="userSearch" autoComplete="off" value={search} placeholder="ค้นหาชื่อผู้ใช้ ทีม หรือสิทธิ์" className="min-h-11 rounded-2xl bg-white" onChange={(event) => setSearch(event.target.value)} />
              <select aria-label="กรองตามสิทธิ์" name="roleFilter" value={roleFilter} className="min-h-11 rounded-2xl border border-gray-200 bg-white px-3 text-sm" onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}>
                <option value="all">ทุกสิทธิ์</option>
                {ADMIN_MUTABLE_ROLES.map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}
              </select>
              <select aria-label="กรองตามทีม" name="teamFilter" value={teamFilter} className="min-h-11 rounded-2xl border border-gray-200 bg-white px-3 text-sm" onChange={(event) => setTeamFilter(event.target.value as TeamFilter)}>
                <option value="all">ทุกทีม</option>
                <option value="unassigned">ไม่ระบุทีม</option>
                {teams.map((team) => <option key={team.id} value={String(team.id)}>{team.name}</option>)}
              </select>
              <select aria-label="กรองตามสถานะ" name="statusFilter" value={statusFilter} className="min-h-11 rounded-2xl border border-gray-200 bg-white px-3 text-sm" onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}>
                <option value="all">ทุกสถานะ</option>
                <option value="active">ใช้งาน</option>
                <option value="inactive">ปิดใช้งาน</option>
              </select>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:w-auto">
              <Button type="button" variant="outline" onClick={openBulkCreate} className="min-h-11 rounded-2xl bg-white">
                <UserPlus className="h-4 w-4" />
                เพิ่มหลายคน
              </Button>
              <Button onClick={openCreate} className="min-h-11 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700">
                <Plus className="h-4 w-4" />
                เพิ่มผู้ใช้
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex min-h-52 items-center justify-center rounded-3xl bg-white/70 text-gray-600">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" /> กำลังโหลดผู้ใช้...
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-sm lg:block">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">ผู้ใช้</th>
                  <th className="px-4 py-3 font-semibold">สิทธิ์</th>
                  <th className="px-4 py-3 font-semibold">ทีม</th>
                  <th className="px-4 py-3 font-semibold">สถานะ</th>
                  <th className="px-4 py-3 font-semibold">เข้าใช้ล่าสุด</th>
                  <th className="px-4 py-3 text-right font-semibold">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="align-middle">
                    <td className="px-4 py-4"><p className="font-semibold text-gray-900">{user.displayName || user.username}</p><p className="text-xs text-gray-500">{user.username}</p></td>
                    <td className="px-4 py-4"><RoleBadge role={user.role} /></td>
                    <td className="px-4 py-4 text-gray-700">{teamName(user, teams)}</td>
                    <td className="px-4 py-4"><UserStatusBadge isActive={user.isActive} /></td>
                    <td className="px-4 py-4 text-gray-600">{formatDate(user.lastLogin)}</td>
                    <td className="px-4 py-4"><div className="flex justify-end gap-2">{isProtectedOwner(user) ? <span className="rounded-full bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">บัญชีเจ้าของระบบ</span> : <><Button variant="outline" className="min-h-11 rounded-2xl" onClick={() => openEdit(user)}><Pencil className="h-4 w-4" />แก้ไข</Button><Button variant="outline" className="min-h-11 rounded-2xl" onClick={() => setResettingUser(user)}><RotateCcwKey className="h-4 w-4" />รีเซ็ต</Button></>}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:hidden">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="card-glass">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-start justify-between gap-3 text-base">
                    <span><span className="block text-gray-900">{user.displayName || user.username}</span><span className="block text-xs font-medium text-gray-500">{user.username}</span></span>
                    <UserStatusBadge isActive={user.isActive} />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-700">
                  <div className="flex flex-wrap gap-2"><RoleBadge role={user.role} /><span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">{teamName(user, teams)}</span></div>
                  <p className="text-xs text-gray-500">เข้าใช้ล่าสุด: {formatDate(user.lastLogin)}</p>
                  {isProtectedOwner(user) ? <div className="rounded-2xl bg-amber-50 px-3 py-2 text-center text-xs font-semibold text-amber-700 ring-1 ring-amber-200">บัญชีเจ้าของระบบถูกป้องกัน</div> : <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button variant="outline" className="min-h-11 rounded-2xl" onClick={() => openEdit(user)}><Pencil className="h-4 w-4" />แก้ไข</Button>
                    <Button variant="outline" className="min-h-11 rounded-2xl" onClick={() => setResettingUser(user)}><RotateCcwKey className="h-4 w-4" />รีเซ็ต</Button>
                  </div>}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredUsers.length === 0 && <div className="rounded-3xl border border-dashed border-emerald-200 bg-white/70 py-10 text-center text-gray-500">ไม่พบผู้ใช้ตามเงื่อนไข</div>}
        </>
      )}

      <UserFormDialog
        open={dialogOpen}
        mode={formMode}
        teams={teams}
        form={form}
        saving={createUser.isPending || updateUser.isPending}
        onOpenChange={setDialogOpen}
        onFormChange={setForm}
        onSubmit={submitUser}
      />

      <BulkUserDialog
        open={bulkDialogOpen}
        teams={teams}
        teamId={bulkTeamId}
        rows={bulkRows}
        saving={bulkSubmitting}
        onOpenChange={setBulkDialogOpen}
        onTeamChange={setBulkTeamId}
        onRowsChange={setBulkRows}
        onSubmit={submitBulkUsers}
      />

      <Dialog open={!!resettingUser} onOpenChange={(open) => { if (!open) setResettingUser(null) }}>
        <DialogContent className="w-[calc(100vw-1rem)] rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>รีเซ็ตรหัสผ่าน</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={submitResetPassword}>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">
              <ShieldCheck className="mr-2 inline h-4 w-4" />
              ระบบจะรีเซ็ตรหัสผ่านเป็นค่าเริ่มต้นตามนโยบาย backend และตั้งสถานะบังคับเปลี่ยนรหัสผ่านเมื่อเข้าสู่ระบบครั้งถัดไป ต้องแจ้งผู้ใช้ผ่านช่องทางภายนอกอย่างปลอดภัย
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" className="min-h-11 rounded-2xl" onClick={() => setResettingUser(null)}>ยกเลิก</Button>
              <Button type="submit" className="min-h-11 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700" disabled={resetPassword.isPending}>{resetPassword.isPending && <Loader2 className="h-4 w-4 animate-spin" />}รีเซ็ต</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
