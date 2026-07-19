'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Building2,
  Check,
  Clipboard,
  Eye,
  Loader2,
  Pencil,
  Phone,
  Plus,
  Search,
  User,
  Users,
  X,
} from 'lucide-react'
import { useAuthContext } from '@/lib/auth/auth-context'
import { canCreateExternalContact, canUpdateAnyContact, canUpdateOwnContact } from '@/lib/auth/role-policy'
import { useContactDirectory, useTeams } from '@/hooks/useQueries'
import { useCreateExternalContact, useUpdateOwnContact, useUpdateAnyContact } from '@/hooks/mutations/useContactDirectoryMutations'
import type { ContactDirectoryEntry, ContactDirectoryListParams, CreateExternalContactRequest, UpdateContactRequest } from '@/types/contact-directory'
import type { User as AuthUser, UserRole } from '@/types/auth'
import type { Team } from '@/types/query-types'
import {
  buildContactTypeOptions,
  contactCallHref,
  contactDisplayName,
  contactTypeLabel,
  filterContactsByType,
  type ContactTypeFilter,
} from '@/features/contacts/contact-directory-view-model'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { phoneDigitsOnly } from '@/lib/phone'

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'super_admin', label: 'ผู้ดูแลระบบสูงสุด' },
  { value: 'team_lead', label: 'หัวหน้าทีม' },
  { value: 'user', label: 'ผู้ใช้งาน' },
  { value: 'viewer', label: 'ผู้บริหาร' },
]

const CONTACT_TYPE_OPTIONS = buildContactTypeOptions()
const EXTERNAL_CONTACT_TYPE_OPTIONS: { value: CreateExternalContactRequest['type']; label: string }[] = CONTACT_TYPE_OPTIONS.filter((option): option is { value: CreateExternalContactRequest['type']; label: string } => option.value !== 'all' && option.value !== 'user')
const SCOPE_FILTERS = ['ทีมของฉัน', 'ทุกทีมที่มองเห็นได้', 'รายการโปรด/ใช้บ่อย'] as const
const DEBOUNCE_MS = 300

function displayName(entry: ContactDirectoryEntry): string {
  return contactDisplayName(entry)
}

function roleLabel(role: UserRole): string {
  return ROLE_OPTIONS.find((option) => option.value === role)?.label ?? role
}

function phoneHref(phoneNumber: string): string {
  return contactCallHref({ phoneNumber }) ?? '#'
}

function contactType(entry: ContactDirectoryEntry): string {
  return contactTypeLabel(entry)
}

function contactKey(entry: ContactDirectoryEntry): string {
  return `${entry.source ?? 'user'}:${entry.source === 'external_contact' ? entry.externalId ?? entry.id : entry.id}`
}

function organizationLabel(entry: ContactDirectoryEntry): string {
  return entry.organization || entry.team?.name || 'ไม่ระบุทีม/หน่วยงาน'
}

function contactEntryFromUser(user: AuthUser): ContactDirectoryEntry {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName ?? null,
    position: user.position ?? null,
    phoneNumber: user.phoneNumber ?? null,
    role: user.role,
    teamId: user.teamId,
    team: user.team ?? null,
    isActive: user.isActive,
    source: 'user',
    type: 'user',
    organization: null,
    notes: null,
    actions: {
      canEdit: true,
      canEditRoleOrTeam: false,
    },
    updatedAt: '',
  }
}

function ContactEditDialog({ entry, open, onClose }: { entry: ContactDirectoryEntry | null; open: boolean; onClose: () => void }) {
  const { user } = useAuthContext()
  const canEditAny = canUpdateAnyContact(user?.role)
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
      position: form.position || null,
      phoneNumber: form.phoneNumber || null,
    }
    if (canEditAny && !isOwn) {
      updateAny.mutate(
        {
          userId: entry.id,
          data: {
            ...payload,
            displayName: form.displayName || null,
          },
        },
        { onSuccess: onClose },
      )
      return
    }
    updateOwn.mutate(payload, { onSuccess: onClose })
  }

  const isSaving = updateOwn.isPending || updateAny.isPending

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="smart-home-card max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-950">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><User className="h-4 w-4" /></span>
            {isOwn ? 'แก้ไขข้อมูลของฉัน' : 'แก้ไขข้อมูลติดต่อ'}
          </DialogTitle>
          <DialogDescription>
            {isOwn ? 'แก้ไขเบอร์โทรและตำแหน่งของคุณ' : `แก้ไขข้อมูลติดต่อของ ${displayName(entry)}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {!isOwn ? (
            <label className="block space-y-2 text-sm font-medium text-slate-700">
              <span>ชื่อ</span>
              <Input name="displayName" autoComplete="name" placeholder="ชื่อ-นามสกุล" value={(form.displayName as string) ?? ''} onChange={(event) => setForm((prev) => ({ ...prev, displayName: event.target.value }))} className="smart-home-control smart-home-focus min-h-11" />
            </label>
          ) : null}
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            <span>ตำแหน่ง</span>
            <Input name="position" autoComplete="organization-title" placeholder="ตำแหน่งงาน" value={(form.position as string) ?? ''} onChange={(event) => setForm((prev) => ({ ...prev, position: event.target.value }))} className="smart-home-control smart-home-focus min-h-11" />
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            <span>เบอร์โทรหลัก</span>
            <Input name="phoneNumber" autoComplete="tel" inputMode="numeric" pattern="[0-9]*" placeholder="กรอกเฉพาะตัวเลข" value={(form.phoneNumber as string) ?? ''} onChange={(event) => setForm((prev) => ({ ...prev, phoneNumber: phoneDigitsOnly(event.target.value) }))} className="smart-home-control smart-home-focus min-h-11" />
          </label>
          <p className="smart-home-panel rounded-xl p-3 text-xs text-slate-600">ทีม/หน่วยงานถูกล็อกตามบัญชีผู้ใช้ หากต้องการเปลี่ยนทีมให้ผู้ดูแลระบบสูงสุดจัดการในหน้า Admin</p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving} className="smart-home-control min-h-11">ยกเลิก</Button>
          <Button onClick={handleSave} disabled={isSaving} className="min-h-11 bg-blue-700 text-white hover:bg-blue-800">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            บันทึก
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AddExternalContactDialog({
  open,
  onClose,
  teams,
  userTeamId,
  canSelectTeam,
}: {
  open: boolean
  onClose: () => void
  teams: Team[]
  userTeamId: number | null | undefined
  canSelectTeam: boolean
}) {
  const createExternalContact = useCreateExternalContact()
  const defaultTeamId = canSelectTeam ? null : userTeamId ?? null
  const [form, setForm] = useState<CreateExternalContactRequest>({
    type: 'external',
    displayName: '',
    phoneNumber: '',
    organization: '',
    position: '',
    notes: '',
    teamId: defaultTeamId,
  })

  useEffect(() => {
    if (!open) return
    setForm({
      type: 'external',
      displayName: '',
      phoneNumber: '',
      organization: '',
      position: '',
      notes: '',
      teamId: defaultTeamId,
    })
  }, [defaultTeamId, open])

  const handleSave = () => {
    const payload: CreateExternalContactRequest = {
      type: form.type,
      displayName: form.displayName.trim(),
      phoneNumber: form.phoneNumber.trim(),
      organization: form.organization?.trim() || null,
      position: form.position?.trim() || null,
      notes: form.notes?.trim() || null,
      teamId: canSelectTeam ? form.teamId ?? null : userTeamId ?? null,
      isActive: true,
    }
    createExternalContact.mutate(payload, { onSuccess: onClose })
  }

  const isSaving = createExternalContact.isPending
  const isIncomplete = !form.displayName.trim() || !form.phoneNumber.trim()

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="smart-home-card max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-950">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Plus className="h-4 w-4" /></span>
            เพิ่มเบอร์ติดต่อหน่วยงานอื่น
          </DialogTitle>
          <DialogDescription>บันทึกรายชื่อภายนอกสำหรับติดต่อประสานงาน</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <label className="block space-y-2 text-sm font-medium text-slate-700 sm:col-span-2">
            <span>ชื่อผู้ติดต่อ/หน่วยงาน</span>
            <Input name="externalDisplayName" autoComplete="organization" placeholder="เช่น เทศบาลเมือง / คุณสมชาย" value={form.displayName} onChange={(event) => setForm((prev) => ({ ...prev, displayName: event.target.value }))} className="smart-home-control smart-home-focus min-h-11" />
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            <span>หมายเลขโทรศัพท์</span>
            <Input name="externalPhoneNumber" autoComplete="tel" inputMode="numeric" pattern="[0-9]*" placeholder="กรอกเฉพาะตัวเลข เช่น 0812345678" value={form.phoneNumber} onChange={(event) => setForm((prev) => ({ ...prev, phoneNumber: phoneDigitsOnly(event.target.value) }))} className="smart-home-control smart-home-focus min-h-11" />
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            <span>ประเภท</span>
            <select name="externalType" value={form.type} onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as CreateExternalContactRequest['type'] }))} className="smart-home-control smart-home-focus min-h-11 w-full px-3 text-sm text-slate-700">
              {EXTERNAL_CONTACT_TYPE_OPTIONS.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
            </select>
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            <span>หน่วยงาน/สังกัด</span>
            <Input name="externalOrganization" autoComplete="organization" placeholder="เช่น เทศบาล / สถานีตำรวจ" value={form.organization ?? ''} onChange={(event) => setForm((prev) => ({ ...prev, organization: event.target.value }))} className="smart-home-control smart-home-focus min-h-11" />
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            <span>หน้าที่/เรื่องที่ติดต่อ</span>
            <Input name="externalPosition" autoComplete="organization-title" placeholder="เช่น ประสานงานพื้นที่" value={form.position ?? ''} onChange={(event) => setForm((prev) => ({ ...prev, position: event.target.value }))} className="smart-home-control smart-home-focus min-h-11" />
          </label>
          {canSelectTeam ? (
            <label className="block space-y-2 text-sm font-medium text-slate-700 sm:col-span-2">
              <span>ขอบเขตข้อมูล</span>
              <select name="externalTeamId" value={form.teamId ?? ''} onChange={(event) => setForm((prev) => ({ ...prev, teamId: event.target.value ? Number(event.target.value) : null }))} className="smart-home-control smart-home-focus min-h-11 w-full px-3 text-sm text-slate-700">
                <option value="">ข้อมูลกลางทุกทีม</option>
                {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
              </select>
            </label>
          ) : null}
          <label className="block space-y-2 text-sm font-medium text-slate-700 sm:col-span-2">
            <span>หมายเหตุไว้ติดต่อ</span>
            <textarea name="externalNotes" rows={3} placeholder="เช่น ติดต่อเวลาราชการ / ใช้กรณีประสานรถกระเช้า" value={form.notes ?? ''} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} className="smart-home-control smart-home-focus w-full px-3 py-2 text-sm text-slate-700" />
          </label>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving} className="smart-home-control min-h-11">ยกเลิก</Button>
          <Button onClick={handleSave} disabled={isSaving || isIncomplete} className="min-h-11 bg-blue-700 text-white hover:bg-blue-800">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            เพิ่มรายชื่อ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ContactDetailDialog({ entry, open, onClose, onCopy, canEdit, onEdit }: { entry: ContactDirectoryEntry | null; open: boolean; onClose: () => void; onCopy: (entry: ContactDirectoryEntry) => void; canEdit: boolean; onEdit: (entry: ContactDirectoryEntry) => void }) {
  if (!entry) return null
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="smart-home-card max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-950">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><User className="h-4 w-4" /></span>
            {displayName(entry)}
          </DialogTitle>
          <DialogDescription>รายละเอียดสมุดโทรศัพท์</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 text-sm text-slate-700">
          <p className="smart-home-panel rounded-xl p-3"><span className="font-semibold">ตำแหน่ง:</span> {entry.position || '-'}</p>
          <p className="smart-home-panel rounded-xl p-3"><span className="font-semibold">ทีม/หน่วยงาน:</span> {organizationLabel(entry)}</p>
          <p className="smart-home-panel rounded-xl p-3"><span className="font-semibold">เบอร์โทรหลัก:</span> {entry.phoneNumber || '-'}</p>
          <p className="smart-home-panel rounded-xl p-3"><span className="font-semibold">เบอร์สำรอง:</span> -</p>
          <p className="smart-home-panel rounded-xl p-3"><span className="font-semibold">อีเมล/ช่องทางติดต่ออื่น:</span> -</p>
          <p className="smart-home-panel rounded-xl p-3"><span className="font-semibold">ประเภท:</span> {contactType(entry)}</p>
          <p className="smart-home-panel rounded-xl p-3"><span className="font-semibold">สถานะ:</span> {entry.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}</p>
          <p className="smart-home-panel rounded-xl p-3"><span className="font-semibold">หมายเหตุ:</span> {entry.notes || '-'}</p>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          {entry.phoneNumber ? <Button asChild className="min-h-11 bg-blue-700 text-white hover:bg-blue-800"><a href={phoneHref(entry.phoneNumber)}><Phone className="h-4 w-4" /> โทร</a></Button> : null}
          {entry.phoneNumber ? <Button variant="outline" className="smart-home-control min-h-11" onClick={() => onCopy(entry)}><Clipboard className="h-4 w-4" /> คัดลอกเบอร์โทร</Button> : null}
          {canEdit ? <Button variant="outline" className="smart-home-control min-h-11" onClick={() => onEdit(entry)}><Pencil className="h-4 w-4" /> แก้ไข</Button> : null}
          <Button variant="outline" className="smart-home-control min-h-11" onClick={onClose}>ปิด</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ContactCard({ entry, onDetail, onCopy }: { entry: ContactDirectoryEntry; onDetail: (entry: ContactDirectoryEntry) => void; onCopy: (entry: ContactDirectoryEntry) => void }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 shadow-sm"><User className="h-5 w-5" /></div>
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-slate-950">{displayName(entry)}</h2>
            <p className="truncate text-sm text-slate-500">@{entry.username}</p>
          </div>
        </div>
        {entry.isActive ? <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">ใช้งาน</span> : <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">ไม่ใช้งาน</span>}
      </div>

      <div className="mt-3 space-y-2 text-sm text-slate-700">
        <p className="flex items-center gap-2"><Building2 className="h-4 w-4 text-slate-400" />{entry.position || 'ไม่ระบุตำแหน่ง'}</p>
        <p className="flex items-center gap-2"><Users className="h-4 w-4 text-slate-400" />{organizationLabel(entry)}</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {entry.source !== 'external_contact' ? <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{roleLabel(entry.role)}</span> : null}
        <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">{contactType(entry)}</span>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto_auto] gap-2">
        {entry.phoneNumber ? <a href={phoneHref(entry.phoneNumber)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800" aria-label={`โทรหา ${displayName(entry)} ที่เบอร์ ${entry.phoneNumber}`}><Phone className="h-4 w-4" /> โทร {entry.phoneNumber}</a> : <button className="min-h-11 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-500" disabled>ยังไม่มีเบอร์</button>}
        <button type="button" onClick={() => onDetail(entry)} className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50" aria-label={`ดูรายละเอียด ${displayName(entry)}`}><Eye className="h-4 w-4" /></button>
        {entry.phoneNumber ? <button type="button" onClick={() => onCopy(entry)} className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50" aria-label={`คัดลอกเบอร์โทร ${displayName(entry)}`}><Clipboard className="h-4 w-4" /></button> : null}
      </div>

    </article>
  )
}

function ContactRow({ entry, canEdit, onEdit, onDetail, onCopy }: { entry: ContactDirectoryEntry; canEdit: boolean; onEdit: (entry: ContactDirectoryEntry) => void; onDetail: (entry: ContactDirectoryEntry) => void; onCopy: (entry: ContactDirectoryEntry) => void }) {
  return (
    <tr className="border-b border-sky-100/70 last:border-0 hover:bg-blue-50/40">
      <td className="px-3 py-3"><p className="font-semibold text-slate-950">{displayName(entry)}</p><p className="text-xs text-slate-500">@{entry.username}</p></td>
      <td className="px-3 py-3 text-sm text-slate-700">{entry.position || '-'}</td>
      <td className="px-3 py-3 text-sm text-slate-700">{entry.phoneNumber ? <a href={phoneHref(entry.phoneNumber)} className="inline-flex min-h-11 items-center font-semibold text-blue-700 hover:text-blue-900">{entry.phoneNumber}</a> : '-'}</td>
      <td className="px-3 py-3 text-sm text-slate-700">{organizationLabel(entry)}</td>
      <td className="px-3 py-3"><span className="smart-home-chip border-blue-100 bg-blue-50 text-blue-700">{contactType(entry)}</span></td>
      <td className="px-3 py-3 text-right"><div className="flex justify-end gap-1">{entry.phoneNumber ? <button type="button" onClick={() => onCopy(entry)} className="smart-home-control smart-home-focus flex h-11 w-11 items-center justify-center text-slate-500" aria-label={`คัดลอกเบอร์โทร ${displayName(entry)}`}><Clipboard className="h-4 w-4" /></button> : null}<button type="button" onClick={() => onDetail(entry)} className="smart-home-control smart-home-focus flex h-11 w-11 items-center justify-center text-slate-500" aria-label={`ดูรายละเอียด ${displayName(entry)}`}><Eye className="h-4 w-4" /></button>{canEdit ? <button type="button" onClick={() => onEdit(entry)} className="smart-home-control smart-home-focus flex h-11 w-11 items-center justify-center text-slate-500" aria-label={`แก้ไขข้อมูลติดต่อ ${displayName(entry)}`}><Pencil className="h-4 w-4" /></button> : null}</div></td>
    </tr>
  )
}

function StateMessage({ title, description, tone = 'slate', action }: { title: string; description: string; tone?: 'slate' | 'red'; action?: React.ReactNode }) {
  const toneClass = tone === 'red' ? 'border-red-200 bg-red-50/80 text-red-700' : 'text-slate-700'
  const iconClass = tone === 'red' ? 'text-red-300' : 'text-slate-300'

  return (
    <div className={`smart-home-card p-8 text-center ${toneClass}`}>
      <Users className={`mx-auto h-10 w-10 ${iconClass}`} />
      <p className="mt-3 font-semibold">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      {action}
    </div>
  )
}

export default function ContactsPage() {
  const { user } = useAuthContext()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [teamFilter, setTeamFilter] = useState<number | ''>('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [scopeFilter, setScopeFilter] = useState<(typeof SCOPE_FILTERS)[number]>('ทุกทีมที่มองเห็นได้')
  const [typeFilter, setTypeFilter] = useState<ContactTypeFilter>('all')
  const [addExternalOpen, setAddExternalOpen] = useState(false)
  const [editEntry, setEditEntry] = useState<ContactDirectoryEntry | null>(null)
  const [detailEntry, setDetailEntry] = useState<ContactDirectoryEntry | null>(null)
  const [copyMessage, setCopyMessage] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [search])

  const queryParams = useMemo<ContactDirectoryListParams>(() => {
    const params: ContactDirectoryListParams = {}
    if (debouncedSearch) params.query = debouncedSearch
    if (teamFilter !== '') params.teamId = teamFilter
    if (roleFilter) params.role = roleFilter
    return params
  }, [debouncedSearch, roleFilter, teamFilter])

  const { data: contacts, isLoading, isError, isFetching, refetch } = useContactDirectory(Object.keys(queryParams).length > 0 ? queryParams : undefined)
  const { data: teams = [] } = useTeams()
  const canEditAny = canUpdateAnyContact(user?.role)
  const canEditOwn = canUpdateOwnContact(user?.role)
  const canCreateExternal = canCreateExternalContact(user?.role, user?.teamId != null)

  const visibleContacts = useMemo(() => {
    return filterContactsByType(contacts ?? [], typeFilter).filter((entry) => {
      if (scopeFilter === 'ทีมของฉัน' && user?.teamId != null && entry.teamId != null && entry.teamId !== user.teamId) return false
      return true
    })
  }, [contacts, scopeFilter, typeFilter, user?.teamId])

  const canEditEntry = useCallback((entry: ContactDirectoryEntry) => {
    if (entry.source === 'external_contact') return false
    if (canEditAny) return true
    return canEditOwn && user?.id === entry.id
  }, [canEditAny, canEditOwn, user?.id])

  const ownEntry = useMemo(() => {
    const contactListEntry = contacts?.find((entry) => entry.source !== 'external_contact' && entry.id === user?.id)
    if (contactListEntry) {
      return {
        ...contactListEntry,
        displayName: contactListEntry.displayName?.trim() ? contactListEntry.displayName : user?.displayName ?? null,
        position: contactListEntry.position?.trim() ? contactListEntry.position : user?.position ?? null,
        phoneNumber: contactListEntry.phoneNumber?.trim() ? contactListEntry.phoneNumber : user?.phoneNumber ?? null,
      }
    }
    return user ? contactEntryFromUser(user) : null
  }, [contacts, user])

  const handleCopy = useCallback(async (entry: ContactDirectoryEntry) => {
    if (!entry.phoneNumber) return
    await navigator.clipboard?.writeText(entry.phoneNumber)
    setCopyMessage('คัดลอกเบอร์โทรแล้ว')
    window.setTimeout(() => setCopyMessage(''), 1800)
  }, [])

  const clearFilters = useCallback(() => {
    setSearch('')
    setTeamFilter('')
    setRoleFilter('')
    setScopeFilter('ทุกทีมที่มองเห็นได้')
    setTypeFilter('all')
  }, [])

  const hasFilters = search || teamFilter !== '' || roleFilter || typeFilter !== 'all' || scopeFilter !== 'ทุกทีมที่มองเห็นได้'

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-3 py-4 sm:px-4 lg:px-6">
      <header className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2"><div className="rounded-lg bg-blue-50 p-2 text-blue-700"><Phone className="h-5 w-5" /></div><h1 className="text-2xl font-bold text-slate-900 md:text-3xl">สมุดโทรศัพท์</h1></div>
            <p className="mt-2 text-sm text-slate-600">ค้นหา โทร และคัดลอกเบอร์โทรตามทีม/หน่วยงานที่มองเห็นได้</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {canCreateExternal ? <Button className="min-h-11 rounded-lg bg-blue-700 text-white hover:bg-blue-800" onClick={() => setAddExternalOpen(true)}><Plus className="h-4 w-4" /> เพิ่มเบอร์หน่วยงานอื่น</Button> : null}
            {canEditOwn ? <Button variant="outline" className="min-h-11 rounded-lg" disabled={!ownEntry} onClick={() => ownEntry && setEditEntry(ownEntry)}>แก้ไขข้อมูลของฉัน</Button> : null}
          </div>
        </div>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-3 md:p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input aria-label="ค้นหาสมุดโทรศัพท์" name="contactSearch" autoComplete="off" type="text" placeholder="ค้นหาชื่อ, เบอร์โทร, ทีม/หน่วยงาน, ตำแหน่ง" value={search} onChange={(event) => setSearch(event.target.value)} className="min-h-11 w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-12 text-sm text-slate-950 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100" />
          {search ? <button type="button" onClick={() => setSearch('')} className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100" aria-label="ล้างคำค้นหา"><X className="h-4 w-4" /></button> : null}
        </div>
        <details className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <summary className="cursor-pointer text-sm font-semibold text-slate-700">กลุ่มและตัวกรอง</summary>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {SCOPE_FILTERS.map((filter) => <button key={filter} type="button" onClick={() => setScopeFilter(filter)} className={`min-h-11 shrink-0 rounded-lg px-3 text-sm font-semibold ${scopeFilter === filter ? 'bg-blue-700 text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}>{filter}</button>)}
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          <select aria-label="กรองตามทีม" name="teamFilter" value={teamFilter} onChange={(event) => setTeamFilter(event.target.value ? Number(event.target.value) : '')} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700"><option value="">ทุกทีม</option>{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select>
          <select aria-label="กรองตามประเภท" name="typeFilter" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as ContactTypeFilter)} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700">{CONTACT_TYPE_OPTIONS.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select>
          <select aria-label="กรองตามบทบาท" name="roleFilter" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700"><option value="">ทุกบทบาท</option>{ROLE_OPTIONS.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select>
        </div>
          {hasFilters ? <button type="button" onClick={clearFilters} className="mt-3 inline-flex min-h-11 items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-600"><X className="h-4 w-4" />ล้างตัวกรอง</button> : null}
        </details>
      </section>

      {copyMessage ? <p className="smart-home-chip badge-success px-3 py-2 text-sm"><Check className="h-4 w-4" />{copyMessage}</p> : null}

      {isLoading ? <StateMessage title="กำลังติดต่อระบบสมุดโทรศัพท์" description="กำลังเตรียมรายชื่อ ทีม/หน่วยงาน และเบอร์โทรที่คุณมีสิทธิ์มองเห็น" action={<div className="smart-home-chip mt-3 px-4 py-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" />กำลังโหลด</div>} /> : isError ? <StateMessage title="โหลดข้อมูลสมุดโทรศัพท์ไม่สำเร็จ" description="ระบบยังโหลดข้อมูลไม่ได้ ไม่ใช่รายชื่อว่าง และยังสรุปไม่ได้ว่ามีรายชื่อหรือไม่ กรุณาลองใหม่อีกครั้ง" tone="red" action={<button type="button" onClick={() => void refetch()} disabled={isFetching} className="smart-home-focus mt-3 inline-flex min-h-11 items-center gap-2 rounded-2xl border border-red-200 bg-red-50/80 px-4 text-sm font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-60">{isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{isFetching ? 'กำลังลองใหม่' : 'ลองใหม่'}</button>} /> : visibleContacts.length === 0 ? <StateMessage title={hasFilters ? 'ไม่พบรายชื่อที่ตรงกับเงื่อนไข' : 'ยังไม่มีรายชื่อที่มองเห็นได้'} description={hasFilters ? 'ลองล้างตัวกรองหรือค้นหาด้วยคำอื่น' : 'เมื่อมีข้อมูลติดต่อที่คุณมีสิทธิ์มองเห็น รายชื่อจะแสดงที่นี่'} action={hasFilters ? <button type="button" onClick={clearFilters} className="mt-3 text-sm font-semibold text-blue-700">ล้างตัวกรองทั้งหมด</button> : null} /> : <>
        <div className="space-y-3 lg:hidden">{visibleContacts.map((entry) => <ContactCard key={contactKey(entry)} entry={entry} onDetail={setDetailEntry} onCopy={handleCopy} />)}</div>
        <div className="smart-home-table hidden lg:block"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-sky-100/80 bg-sky-50/50"><th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">ชื่อ</th><th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">ตำแหน่ง</th><th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">เบอร์โทรหลัก</th><th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">ทีม/หน่วยงาน</th><th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">ประเภท</th><th className="px-3 py-3 text-right text-xs font-semibold text-slate-500">จัดการ</th></tr></thead><tbody>{visibleContacts.map((entry) => <ContactRow key={contactKey(entry)} entry={entry} canEdit={canEditEntry(entry)} onEdit={setEditEntry} onDetail={setDetailEntry} onCopy={handleCopy} />)}</tbody></table></div></div>
        <p className="text-center text-xs text-slate-400">แสดง {visibleContacts.length} รายการ</p>
      </>}

      <AddExternalContactDialog open={addExternalOpen} onClose={() => setAddExternalOpen(false)} teams={teams} userTeamId={user?.teamId} canSelectTeam={canEditAny} />
      <ContactDetailDialog entry={detailEntry} open={detailEntry !== null} onClose={() => setDetailEntry(null)} onCopy={handleCopy} canEdit={detailEntry ? canEditEntry(detailEntry) : false} onEdit={(entry) => { setDetailEntry(null); setEditEntry(entry) }} />
      <ContactEditDialog entry={editEntry} open={editEntry !== null} onClose={() => setEditEntry(null)} />
    </div>
  )
}
