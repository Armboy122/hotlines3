'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { Loader2, Pencil, Plus, RotateCcwKey, ShieldCheck, UserCog } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { PageHero, PageShell } from '@/components/ui/page-shell'
import { useCreateUser, useResetUserPassword, useTeams, useUpdateUser, useUsers } from '@/hooks/useQueries'
import { ALL_USER_ROLES } from '@/lib/auth/role-policy'
import type { CreateUserRequest, UpdateUserRequest, User, UserRole } from '@/types/auth'
import type { Team } from '@/types/query-types'

type UserFormMode = 'create' | 'edit'
type RoleFilter = 'all' | UserRole
type StatusFilter = 'all' | 'active' | 'inactive'

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'ผู้ดูแลสูงสุด',
  admin: 'ผู้ดูแลแผนงาน',
  team_lead: 'หัวหน้าทีม',
  user: 'ผู้ใช้งาน',
  viewer: 'ผู้ดูอย่างเดียว',
}

const baseForm = {
  username: '',
  password: '',
  role: 'user' as UserRole,
  teamId: '',
  isActive: true,
}

type UserFormState = typeof baseForm

function normalize(text: string | null | undefined) {
  return (text ?? '').toLowerCase().trim()
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

function toPayload(form: UserFormState, mode: UserFormMode): CreateUserRequest | UpdateUserRequest {
  return {
    username: form.username.trim(),
    ...(mode === 'create' ? { password: form.password } : {}),
    role: form.role,
    teamId: form.teamId ? Number(form.teamId) : null,
    isActive: form.isActive,
  }
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
              <label className="space-y-2 text-sm font-medium text-gray-700">
                รหัสผ่านเริ่มต้น
                <Input
                  value={form.password}
                  type="password"
                  minLength={6}
                  required
                  className="min-h-11 rounded-2xl bg-white"
                  onChange={(event) => onFormChange({ ...form, password: event.target.value })}
                />
              </label>
            )}
            <label className="space-y-2 text-sm font-medium text-gray-700">
              สิทธิ์
              <select
                value={form.role}
                className="min-h-11 w-full rounded-2xl border border-gray-200 bg-white px-3 text-sm shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                onChange={(event) => onFormChange({ ...form, role: event.target.value as UserRole })}
              >
                {ALL_USER_ROLES.map((role) => (
                  <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-gray-700">
              ทีม
              <select
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

export default function UsersClient() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formMode, setFormMode] = useState<UserFormMode>('create')
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [form, setForm] = useState<UserFormState>(baseForm)
  const [resettingUser, setResettingUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')

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
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? user.isActive : !user.isActive)
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [roleFilter, search, statusFilter, teams, users])

  const openCreate = () => {
    setFormMode('create')
    setEditingUserId(null)
    setForm(baseForm)
    setDialogOpen(true)
  }

  const openEdit = (user: User) => {
    setFormMode('edit')
    setEditingUserId(user.id)
    setForm({
      username: user.username,
      password: '',
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
        await createUser.mutateAsync(toPayload(form, 'create') as CreateUserRequest)
        toast.success('เพิ่มผู้ใช้สำเร็จ')
      } else if (editingUserId != null) {
        await updateUser.mutateAsync({ id: editingUserId, ...(toPayload(form, 'edit') as UpdateUserRequest) })
        toast.success('บันทึกผู้ใช้สำเร็จ')
      }
      setDialogOpen(false)
      setEditingUserId(null)
      setForm(baseForm)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'บันทึกผู้ใช้ไม่สำเร็จ')
    }
  }

  const submitResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!resettingUser) return
    if (!confirm(`ยืนยันรีเซ็ตรหัสผ่านของผู้ใช้ ${resettingUser.username}?`)) return
    try {
      await resetPassword.mutateAsync({ id: resettingUser.id, newPassword })
      toast.success('รีเซ็ตรหัสผ่านสำเร็จ')
      setResettingUser(null)
      setNewPassword('')
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:flex-1">
              <Input value={search} placeholder="ค้นหาชื่อผู้ใช้ ทีม หรือสิทธิ์" className="min-h-11 rounded-2xl bg-white" onChange={(event) => setSearch(event.target.value)} />
              <select value={roleFilter} className="min-h-11 rounded-2xl border border-gray-200 bg-white px-3 text-sm" onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}>
                <option value="all">ทุกสิทธิ์</option>
                {ALL_USER_ROLES.map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}
              </select>
              <select value={statusFilter} className="min-h-11 rounded-2xl border border-gray-200 bg-white px-3 text-sm" onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}>
                <option value="all">ทุกสถานะ</option>
                <option value="active">ใช้งาน</option>
                <option value="inactive">ปิดใช้งาน</option>
              </select>
            </div>
            <Button onClick={openCreate} className="min-h-11 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700">
              <Plus className="h-4 w-4" />
              เพิ่มผู้ใช้
            </Button>
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
                    <td className="px-4 py-4"><div className="flex justify-end gap-2"><Button variant="outline" className="min-h-11 rounded-2xl" onClick={() => openEdit(user)}><Pencil className="h-4 w-4" />แก้ไข</Button><Button variant="outline" className="min-h-11 rounded-2xl" onClick={() => setResettingUser(user)}><RotateCcwKey className="h-4 w-4" />รีเซ็ต</Button></div></td>
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
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button variant="outline" className="min-h-11 rounded-2xl" onClick={() => openEdit(user)}><Pencil className="h-4 w-4" />แก้ไข</Button>
                    <Button variant="outline" className="min-h-11 rounded-2xl" onClick={() => setResettingUser(user)}><RotateCcwKey className="h-4 w-4" />รีเซ็ต</Button>
                  </div>
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

      <Dialog open={!!resettingUser} onOpenChange={(open) => { if (!open) { setResettingUser(null); setNewPassword('') } }}>
        <DialogContent className="w-[calc(100vw-1rem)] rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>รีเซ็ตรหัสผ่าน</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={submitResetPassword}>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <ShieldCheck className="mr-2 inline h-4 w-4" />
              การรีเซ็ตต้องยืนยันอีกครั้งก่อนส่งคำสั่ง
            </div>
            <label className="space-y-2 text-sm font-medium text-gray-700">
              รหัสผ่านใหม่สำหรับ {resettingUser?.username}
              <Input value={newPassword} type="password" minLength={6} required className="min-h-11 rounded-2xl bg-white" onChange={(event) => setNewPassword(event.target.value)} />
            </label>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" className="min-h-11 rounded-2xl" onClick={() => { setResettingUser(null); setNewPassword('') }}>ยกเลิก</Button>
              <Button type="submit" className="min-h-11 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700" disabled={resetPassword.isPending}>{resetPassword.isPending && <Loader2 className="h-4 w-4 animate-spin" />}รีเซ็ต</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
