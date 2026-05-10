'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Building2,
  Loader2,
  Pencil,
  Phone,
  Search,
  User,
  Users,
  X,
} from 'lucide-react'
import { useAuthContext } from '@/lib/auth/auth-context'
import {
  canUpdateAnyContact,
  isSystemAdmin,
} from '@/lib/auth/role-policy'
import { useContactDirectory, useTeams } from '@/hooks/useQueries'
import { useUpdateOwnContact, useUpdateAnyContact } from '@/hooks/mutations/useContactDirectoryMutations'
import type { ContactDirectoryEntry, ContactDirectoryListParams, UpdateContactRequest } from '@/types/contact-directory'
import type { UserRole } from '@/types/auth'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// ── Constants ───────────────────────────────────────────────

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'team_lead', label: 'Team Lead' },
  { value: 'user', label: 'User' },
  { value: 'viewer', label: 'Viewer' },
]

const DEBOUNCE_MS = 300

// ── Helpers ─────────────────────────────────────────────────

function displayName(entry: ContactDirectoryEntry): string {
  return entry.displayName || entry.username
}

function roleLabel(role: UserRole): string {
  return ROLE_OPTIONS.find((o) => o.value === role)?.label ?? role
}

// ── Edit Dialog ─────────────────────────────────────────────

function ContactEditDialog({
  entry,
  open,
  onClose,
}: {
  entry: ContactDirectoryEntry | null
  open: boolean
  onClose: () => void
}) {
  const { user } = useAuthContext()
  const isSuperAdmin = isSystemAdmin(user?.role)
  const isOwn = entry != null && user?.id === entry.id
  const updateOwn = useUpdateOwnContact()
  const updateAny = useUpdateAnyContact()

  const [form, setForm] = useState<UpdateContactRequest>({})

  useEffect(() => {
    if (entry) {
      setForm({
        displayName: entry.displayName ?? '',
        position: entry.position ?? '',
        phoneNumber: entry.phoneNumber ?? '',
      })
    }
  }, [entry])

  if (!entry) return null

  const handleSave = () => {
    const payload: UpdateContactRequest = {
      displayName: form.displayName || null,
      position: form.position || null,
      phoneNumber: form.phoneNumber || null,
    }

    if (isSuperAdmin && !isOwn) {
      updateAny.mutate(
        { userId: entry.id, data: payload },
        { onSuccess: onClose },
      )
    } else {
      updateOwn.mutate(payload, { onSuccess: onClose })
    }
  }

  const isSaving = updateOwn.isPending || updateAny.isPending

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-4 w-4 text-emerald-600" />
            แก้ไขข้อมูลติดต่อ
          </DialogTitle>
          <DialogDescription>
            {isOwn
              ? 'แก้ไขข้อมูลติดต่อของคุณ'
              : `แก้ไขข้อมูลติดต่อของ ${displayName(entry)}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              ชื่อที่แสดง
            </label>
            <Input
              placeholder="ชื่อ-นามสกุล"
              value={(form.displayName as string) ?? ''}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, displayName: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              ตำแหน่ง
            </label>
            <Input
              placeholder="ตำแหน่งงาน"
              value={(form.position as string) ?? ''}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, position: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              เบอร์โทรศัพท์
            </label>
            <Input
              placeholder="0xx-xxx-xxxx"
              value={(form.phoneNumber as string) ?? ''}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))
              }
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            บันทึก
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Contact Card (mobile) ───────────────────────────────────

function ContactCard({
  entry,
  canEdit,
  onEdit,
}: {
  entry: ContactDirectoryEntry
  canEdit: boolean
  onEdit: (entry: ContactDirectoryEntry) => void
}) {
  return (
    <div className="card-glass rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <User className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">
              {displayName(entry)}
            </p>
            <p className="text-xs text-gray-500 truncate">
              @{entry.username}
            </p>
          </div>
        </div>
        {canEdit && (
          <button
            onClick={() => onEdit(entry)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600 active:bg-emerald-100"
            aria-label={`แก้ไขข้อมูลติดต่อ ${displayName(entry)}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="space-y-1.5 pl-1">
        {entry.position && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Building2 className="h-3.5 w-3.5 text-gray-400" />
            <span>{entry.position}</span>
          </div>
        )}
        {entry.phoneNumber && (
          <a
            href={`tel:${entry.phoneNumber.replace(/[^0-9+]/g, '')}`}
            className="flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-emerald-700 transition-colors hover:text-emerald-900 active:bg-emerald-50 active:text-emerald-800"
            aria-label={`โทรหา ${displayName(entry)} ที่เบอร์ ${entry.phoneNumber}`}
          >
            <Phone className="h-4 w-4 text-emerald-500" />
            <span className="underline decoration-emerald-300 underline-offset-2">
              {entry.phoneNumber}
            </span>
          </a>
        )}
        {entry.team?.name && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Users className="h-3.5 w-3.5 text-gray-400" />
            <span>{entry.team.name}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className="inline-flex items-center rounded-full border border-gray-200 bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
          {roleLabel(entry.role)}
        </span>
      </div>
    </div>
  )
}

// ── Contact Row (desktop) ───────────────────────────────────

function ContactRow({
  entry,
  canEdit,
  onEdit,
}: {
  entry: ContactDirectoryEntry
  canEdit: boolean
  onEdit: (entry: ContactDirectoryEntry) => void
}) {
  return (
    <tr className="border-b border-gray-100/70 last:border-0 hover:bg-emerald-50/30 transition-colors">
      <td className="py-3 px-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <User className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {displayName(entry)}
            </p>
            <p className="text-xs text-gray-400">@{entry.username}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-3 text-sm text-gray-700">
        {entry.position || '-'}
      </td>
      <td className="py-3 px-3 text-sm text-gray-700">
        {entry.phoneNumber ? (
          <a
            href={`tel:${entry.phoneNumber.replace(/[^0-9+]/g, '')}`}
            className="text-emerald-700 hover:text-emerald-900 transition-colors"
          >
            {entry.phoneNumber}
          </a>
        ) : '-'}
      </td>
      <td className="py-3 px-3 text-sm text-gray-700">
        {entry.team?.name || '-'}
      </td>
      <td className="py-3 px-3">
        <span className="inline-flex items-center rounded-full border border-gray-200 bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
          {roleLabel(entry.role)}
        </span>
      </td>
      <td className="py-3 px-3 text-right">
        {canEdit && (
          <button
            onClick={() => onEdit(entry)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
            aria-label="แก้ไข"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}
      </td>
    </tr>
  )
}

// ── Main Page ───────────────────────────────────────────────

export default function ContactsPage() {
  const { user } = useAuthContext()
  const canEditAny = canUpdateAnyContact(user?.role)

  // Filters
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [teamFilter, setTeamFilter] = useState<number | ''>('')
  const [roleFilter, setRoleFilter] = useState<string>('')

  // Edit dialog
  const [editEntry, setEditEntry] = useState<ContactDirectoryEntry | null>(null)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [search])

  // Build query params
  const queryParams = useMemo<ContactDirectoryListParams>(() => {
    const params: ContactDirectoryListParams = {}
    if (debouncedSearch) params.query = debouncedSearch
    if (teamFilter !== '') params.teamId = teamFilter
    if (roleFilter) params.role = roleFilter
    return params
  }, [debouncedSearch, teamFilter, roleFilter])

  // Fetch data
  const { data: contacts = [], isLoading } = useContactDirectory(
    Object.keys(queryParams).length > 0 ? queryParams : undefined,
  )
  const { data: teams = [] } = useTeams()

  const handleEdit = useCallback((entry: ContactDirectoryEntry) => {
    setEditEntry(entry)
  }, [])

  const canEditEntry = useCallback(
    (entry: ContactDirectoryEntry) => {
      if (canEditAny) return true
      return user?.id === entry.id
    },
    [canEditAny, user?.id],
  )

  const clearFilters = useCallback(() => {
    setSearch('')
    setTeamFilter('')
    setRoleFilter('')
  }, [])

  const hasFilters = search || teamFilter !== '' || roleFilter

  return (
    <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-28 md:pb-10 space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="p-2 icon-glass-green">
            <Phone className="h-5 w-5 text-emerald-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            สมุดโทรศัพท์
          </h1>
        </div>
        <p className="text-sm text-gray-500 pl-11">
          ค้นหาและดูข้อมูลติดต่อของบุคลากรในระบบ
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-2">
        <div className="card-glass rounded-2xl p-4">
          <p className="text-xs font-semibold text-gray-500">รายชื่อทั้งหมด</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">
            {contacts.length}
          </p>
          <p className="text-xs text-gray-500">รายชื่อผู้ติดต่อ</p>
        </div>
        <div className="card-glass rounded-2xl p-4">
          <p className="text-xs font-semibold text-gray-500">ทีมทั้งหมด</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {teams.length}
          </p>
          <p className="text-xs text-gray-500">ทีมงาน</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card-glass rounded-2xl p-3 sm:p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, ตำแหน่ง, เบอร์โทร..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-h-11 w-full rounded-xl border border-gray-200 bg-white/70 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter row */}
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={teamFilter}
            onChange={(e) =>
              setTeamFilter(e.target.value ? Number(e.target.value) : '')
            }
            className="w-full sm:flex-1 rounded-xl border border-gray-200 bg-white/70 px-3 py-2.5 text-sm text-gray-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
          >
            <option value="">ทุกทีม</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:flex-1 rounded-xl border border-gray-200 bg-white/70 px-3 py-2.5 text-sm text-gray-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
          >
            <option value="">ทุกบทบาท</option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white/70 px-3 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              ล้างตัวกรอง
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 gap-3 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
          <span className="text-sm">กำลังโหลดข้อมูลผู้ติดต่อ...</span>
        </div>
      ) : contacts.length === 0 ? (
        <div className="card-glass rounded-2xl p-8 text-center space-y-3">
          <Users className="h-10 w-10 text-gray-300 mx-auto" />
          <div>
            <p className="text-sm font-semibold text-gray-700">
              ไม่พบข้อมูลผู้ติดต่อ
            </p>
            <p className="text-xs text-gray-400 mt-1">
              ลองค้นหาด้วยคำอื่น หรือล้างตัวกรอง
            </p>
          </div>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="space-y-3 md:hidden">
            {contacts.map((entry) => (
              <ContactCard
                key={entry.id}
                entry={entry}
                canEdit={canEditEntry(entry)}
                onEdit={handleEdit}
              />
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block card-glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100/70">
                    <th className="py-3 px-3 text-left text-xs font-semibold text-gray-500">
                      ชื่อ
                    </th>
                    <th className="py-3 px-3 text-left text-xs font-semibold text-gray-500">
                      ตำแหน่ง
                    </th>
                    <th className="py-3 px-3 text-left text-xs font-semibold text-gray-500">
                      เบอร์โทร
                    </th>
                    <th className="py-3 px-3 text-left text-xs font-semibold text-gray-500">
                      ทีม
                    </th>
                    <th className="py-3 px-3 text-left text-xs font-semibold text-gray-500">
                      บทบาท
                    </th>
                    <th className="py-3 px-3 text-right text-xs font-semibold text-gray-500">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((entry) => (
                    <ContactRow
                      key={entry.id}
                      entry={entry}
                      canEdit={canEditEntry(entry)}
                      onEdit={handleEdit}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer count */}
          <p className="text-xs text-gray-400 text-center">
            แสดง {contacts.length} รายการ
          </p>
        </>
      )}

      {/* Edit Dialog */}
      <ContactEditDialog
        entry={editEntry}
        open={editEntry !== null}
        onClose={() => setEditEntry(null)}
      />
    </div>
  )
}
