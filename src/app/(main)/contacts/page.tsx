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
  Search,
  Star,
  User,
  Users,
  X,
} from 'lucide-react'
import { useAuthContext } from '@/lib/auth/auth-context'
import { canUpdateAnyContact, canUpdateOwnContact } from '@/lib/auth/role-policy'
import { useContactDirectory, useTeams } from '@/hooks/useQueries'
import { useUpdateOwnContact, useUpdateAnyContact } from '@/hooks/mutations/useContactDirectoryMutations'
import type { ContactDirectoryEntry, ContactDirectoryListParams, UpdateContactRequest } from '@/types/contact-directory'
import type { UserRole } from '@/types/auth'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'super_admin', label: 'ผู้ดูแลระบบสูงสุด' },
  { value: 'admin', label: 'ผู้ดูแลแผนเดือน' },
  { value: 'team_lead', label: 'หัวหน้าทีม' },
  { value: 'user', label: 'ผู้ใช้งาน' },
  { value: 'viewer', label: 'ผู้บริหาร' },
]

const CONTACT_TYPE_FILTERS = ['บุคลากรภายใน', 'หน่วยงานภายนอก', 'เบอร์ฉุกเฉิน/สำคัญ'] as const
const SCOPE_FILTERS = ['ทีมของฉัน', 'ทุกทีมที่มองเห็นได้', 'รายการโปรด/ใช้บ่อย'] as const
const DEBOUNCE_MS = 300

function displayName(entry: ContactDirectoryEntry): string {
  return entry.displayName || entry.username
}

function roleLabel(role: UserRole): string {
  return ROLE_OPTIONS.find((option) => option.value === role)?.label ?? role
}

function phoneHref(phoneNumber: string): string {
  return `tel:${phoneNumber.replace(/[^0-9+]/g, '')}`
}

function contactType(entry: ContactDirectoryEntry): string {
  if (entry.role === 'viewer') return 'หน่วยงานภายนอก'
  if (entry.role === 'super_admin') return 'เบอร์ฉุกเฉิน/สำคัญ'
  return 'บุคลากรภายใน'
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
      displayName: form.displayName || null,
      position: form.position || null,
      phoneNumber: form.phoneNumber || null,
    }
    if (canEditAny && !isOwn) {
      updateAny.mutate({ userId: entry.id, data: payload }, { onSuccess: onClose })
      return
    }
    updateOwn.mutate(payload, { onSuccess: onClose })
  }

  const isSaving = updateOwn.isPending || updateAny.isPending

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-950">
            <User className="h-4 w-4 text-blue-700" />
            แก้ไขข้อมูลติดต่อ
          </DialogTitle>
          <DialogDescription>
            {isOwn ? 'แก้ไขข้อมูลติดต่อของคุณ' : `แก้ไขข้อมูลติดต่อของ ${displayName(entry)}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            <span>ชื่อ</span>
            <Input placeholder="ชื่อ-นามสกุล" value={(form.displayName as string) ?? ''} onChange={(event) => setForm((prev) => ({ ...prev, displayName: event.target.value }))} />
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            <span>ตำแหน่ง</span>
            <Input placeholder="ตำแหน่งงาน" value={(form.position as string) ?? ''} onChange={(event) => setForm((prev) => ({ ...prev, position: event.target.value }))} />
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            <span>เบอร์โทรหลัก</span>
            <Input placeholder="0xx-xxx-xxxx" value={(form.phoneNumber as string) ?? ''} onChange={(event) => setForm((prev) => ({ ...prev, phoneNumber: event.target.value }))} />
          </label>
          <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">ทีม/หน่วยงานถูกล็อกตามบัญชีผู้ใช้ หากต้องการเปลี่ยนทีมให้ผู้ดูแลระบบสูงสุดจัดการในหน้า Admin</p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>ยกเลิก</Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-blue-700 text-white hover:bg-blue-800">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            บันทึก
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{displayName(entry)}</DialogTitle>
          <DialogDescription>รายละเอียดสมุดโทรศัพท์</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm text-slate-700">
          <p><span className="font-semibold">ตำแหน่ง:</span> {entry.position || '-'}</p>
          <p><span className="font-semibold">ทีม/หน่วยงาน:</span> {entry.team?.name || '-'}</p>
          <p><span className="font-semibold">เบอร์โทรหลัก:</span> {entry.phoneNumber || '-'}</p>
          <p><span className="font-semibold">เบอร์สำรอง:</span> -</p>
          <p><span className="font-semibold">อีเมล/ช่องทางติดต่ออื่น:</span> -</p>
          <p><span className="font-semibold">ประเภท:</span> {contactType(entry)}</p>
          <p><span className="font-semibold">สถานะ:</span> {entry.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}</p>
          <p><span className="font-semibold">หมายเหตุ:</span> -</p>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          {entry.phoneNumber ? <Button asChild className="min-h-11 bg-blue-700 text-white hover:bg-blue-800"><a href={phoneHref(entry.phoneNumber)}><Phone className="h-4 w-4" /> โทร</a></Button> : null}
          {entry.phoneNumber ? <Button variant="outline" className="min-h-11" onClick={() => onCopy(entry)}><Clipboard className="h-4 w-4" /> คัดลอกเบอร์โทร</Button> : null}
          {canEdit ? <Button variant="outline" className="min-h-11" onClick={() => onEdit(entry)}><Pencil className="h-4 w-4" /> แก้ไข</Button> : null}
          <Button variant="outline" className="min-h-11" onClick={onClose}>ปิด</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ContactCard({ entry, canEdit, onEdit, onDetail, onCopy }: { entry: ContactDirectoryEntry; canEdit: boolean; onEdit: (entry: ContactDirectoryEntry) => void; onDetail: (entry: ContactDirectoryEntry) => void; onCopy: (entry: ContactDirectoryEntry) => void }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><User className="h-5 w-5" /></div>
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-slate-950">{displayName(entry)}</h2>
            <p className="truncate text-sm text-slate-500">@{entry.username}</p>
          </div>
        </div>
        {entry.isActive ? <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">ใช้งาน</span> : <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">ไม่ใช้งาน</span>}
      </div>

      <div className="mt-3 space-y-2 text-sm text-slate-700">
        <p className="flex items-center gap-2"><Building2 className="h-4 w-4 text-slate-400" />{entry.position || 'ไม่ระบุตำแหน่ง'}</p>
        <p className="flex items-center gap-2"><Users className="h-4 w-4 text-slate-400" />{entry.team?.name || 'ไม่ระบุทีม/หน่วยงาน'}</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600">{roleLabel(entry.role)}</span>
        <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">{contactType(entry)}</span>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto_auto] gap-2">
        {entry.phoneNumber ? <a href={phoneHref(entry.phoneNumber)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-blue-700 px-4 text-sm font-bold text-white hover:bg-blue-800" aria-label={`โทรหา ${displayName(entry)} ที่เบอร์ ${entry.phoneNumber}`}><Phone className="h-4 w-4" /> โทร {entry.phoneNumber}</a> : <button className="min-h-11 rounded-2xl bg-slate-100 px-4 text-sm font-semibold text-slate-500" disabled>ยังไม่มีเบอร์</button>}
        <button type="button" onClick={() => onDetail(entry)} className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700" aria-label={`ดูรายละเอียด ${displayName(entry)}`}><Eye className="h-4 w-4" /></button>
        {entry.phoneNumber ? <button type="button" onClick={() => onCopy(entry)} className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700" aria-label={`คัดลอกเบอร์โทร ${displayName(entry)}`}><Clipboard className="h-4 w-4" /></button> : null}
      </div>

      {canEdit ? <button type="button" onClick={() => onEdit(entry)} className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-700" aria-label={`แก้ไขข้อมูลติดต่อ ${displayName(entry)}`}><Pencil className="h-4 w-4" /> แก้ไข</button> : null}
    </article>
  )
}

function ContactRow({ entry, canEdit, onEdit, onDetail, onCopy }: { entry: ContactDirectoryEntry; canEdit: boolean; onEdit: (entry: ContactDirectoryEntry) => void; onDetail: (entry: ContactDirectoryEntry) => void; onCopy: (entry: ContactDirectoryEntry) => void }) {
  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-blue-50/40">
      <td className="px-3 py-3"><p className="font-semibold text-slate-950">{displayName(entry)}</p><p className="text-xs text-slate-500">@{entry.username}</p></td>
      <td className="px-3 py-3 text-sm text-slate-700">{entry.position || '-'}</td>
      <td className="px-3 py-3 text-sm text-slate-700">{entry.phoneNumber ? <a href={phoneHref(entry.phoneNumber)} className="font-semibold text-blue-700 hover:text-blue-900">{entry.phoneNumber}</a> : '-'}</td>
      <td className="px-3 py-3 text-sm text-slate-700">{entry.team?.name || '-'}</td>
      <td className="px-3 py-3"><span className="rounded-full bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600">{contactType(entry)}</span></td>
      <td className="px-3 py-3 text-right"><div className="flex justify-end gap-1">{entry.phoneNumber ? <button type="button" onClick={() => onCopy(entry)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label={`คัดลอกเบอร์โทร ${displayName(entry)}`}><Clipboard className="h-4 w-4" /></button> : null}<button type="button" onClick={() => onDetail(entry)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label={`ดูรายละเอียด ${displayName(entry)}`}><Eye className="h-4 w-4" /></button>{canEdit ? <button type="button" onClick={() => onEdit(entry)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label={`แก้ไขข้อมูลติดต่อ ${displayName(entry)}`}><Pencil className="h-4 w-4" /></button> : null}</div></td>
    </tr>
  )
}

export default function ContactsPage() {
  const { user } = useAuthContext()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [teamFilter, setTeamFilter] = useState<number | ''>('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [scopeFilter, setScopeFilter] = useState<(typeof SCOPE_FILTERS)[number]>('ทุกทีมที่มองเห็นได้')
  const [typeFilter, setTypeFilter] = useState<string>('')
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

  const { data: contacts = [], isLoading } = useContactDirectory(Object.keys(queryParams).length > 0 ? queryParams : undefined)
  const { data: teams = [] } = useTeams()
  const canEditAny = canUpdateAnyContact(user?.role)
  const canEditOwn = canUpdateOwnContact(user?.role)

  const visibleContacts = useMemo(() => {
    return contacts.filter((entry) => {
      if (scopeFilter === 'ทีมของฉัน' && user?.teamId != null && entry.teamId !== user.teamId) return false
      if (typeFilter && contactType(entry) !== typeFilter) return false
      return true
    })
  }, [contacts, scopeFilter, typeFilter, user?.teamId])

  const canEditEntry = useCallback((entry: ContactDirectoryEntry) => {
    if (canEditAny) return true
    return canEditOwn && user?.id === entry.id
  }, [canEditAny, canEditOwn, user?.id])

  const ownEntry = useMemo(() => contacts.find((entry) => entry.id === user?.id) ?? null, [contacts, user?.id])

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
    setTypeFilter('')
  }, [])

  const hasFilters = search || teamFilter !== '' || roleFilter || typeFilter || scopeFilter !== 'ทุกทีมที่มองเห็นได้'

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-3 py-4 pb-28 sm:px-6 md:pb-10">
      <header className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2"><div className="rounded-2xl bg-blue-50 p-2 text-blue-700"><Phone className="h-5 w-5" /></div><h1 className="text-2xl font-bold text-slate-950 md:text-3xl">สมุดโทรศัพท์</h1></div>
            <p className="mt-2 text-sm text-slate-600">ค้นหา ดูรายละเอียด โทร และคัดลอกเบอร์โทรตามทีม/หน่วยงานที่มองเห็นได้</p>
          </div>
          {canEditOwn ? <Button className="min-h-11 rounded-2xl bg-blue-700 text-white hover:bg-blue-800" disabled={!ownEntry} onClick={() => ownEntry && setEditEntry(ownEntry)}>แก้ไขข้อมูลของฉัน</Button> : null}
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold text-slate-500">รายชื่อทั้งหมด</p><p className="mt-1 text-2xl font-bold text-blue-700">{visibleContacts.length}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold text-slate-500">ทีมทั้งหมด</p><p className="mt-1 text-2xl font-bold text-slate-950">{teams.length}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold text-slate-500">รายการโปรด/ใช้บ่อย</p><p className="mt-1 flex items-center gap-1 text-2xl font-bold text-amber-600"><Star className="h-5 w-5" />0</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold text-slate-500">สถานะ</p><p className="mt-1 text-sm font-bold text-green-700">พร้อมใช้งาน</p></div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm md:p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="ค้นหาชื่อ, เบอร์โทร, ทีม/หน่วยงาน, ตำแหน่ง" value={search} onChange={(event) => setSearch(event.target.value)} className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-950 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100" />
          {search ? <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400" aria-label="ล้างคำค้นหา"><X className="h-4 w-4" /></button> : null}
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {SCOPE_FILTERS.map((filter) => <button key={filter} type="button" onClick={() => setScopeFilter(filter)} className={`min-h-10 shrink-0 rounded-full px-3 text-sm font-semibold ${scopeFilter === filter ? 'bg-blue-700 text-white' : 'bg-slate-50 text-slate-700'}`}>{filter}</button>)}
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          <select value={teamFilter} onChange={(event) => setTeamFilter(event.target.value ? Number(event.target.value) : '')} className="min-h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700"><option value="">ทุกทีม</option>{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select>
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="min-h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700"><option value="">ทุกประเภท</option>{CONTACT_TYPE_FILTERS.map((type) => <option key={type} value={type}>{type}</option>)}</select>
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="min-h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700"><option value="">ทุกบทบาท</option>{ROLE_OPTIONS.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select>
        </div>
        {hasFilters ? <button type="button" onClick={clearFilters} className="mt-3 inline-flex min-h-10 items-center gap-1 rounded-full border border-slate-200 px-3 text-sm font-semibold text-slate-600"><X className="h-4 w-4" />ล้างตัวกรอง</button> : null}
      </section>

      {copyMessage ? <p className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-2 text-sm font-semibold text-green-700"><Check className="h-4 w-4" />{copyMessage}</p> : null}

      {isLoading ? <div className="flex justify-center gap-3 py-16 text-slate-500"><Loader2 className="h-5 w-5 animate-spin text-blue-700" />กำลังโหลดข้อมูลสมุดโทรศัพท์...</div> : visibleContacts.length === 0 ? <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm"><Users className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-3 font-semibold text-slate-700">{hasFilters ? 'ไม่พบรายชื่อที่ตรงกับเงื่อนไข' : 'ยังไม่มีรายชื่อที่มองเห็นได้'}</p>{hasFilters ? <button type="button" onClick={clearFilters} className="mt-3 text-sm font-semibold text-blue-700">ล้างตัวกรองทั้งหมด</button> : null}</div> : <>
        <div className="space-y-3 md:hidden">{visibleContacts.map((entry) => <ContactCard key={entry.id} entry={entry} canEdit={canEditEntry(entry)} onEdit={setEditEntry} onDetail={setDetailEntry} onCopy={handleCopy} />)}</div>
        <div className="hidden md:block overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-slate-100"><th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">ชื่อ</th><th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">ตำแหน่ง</th><th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">เบอร์โทรหลัก</th><th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">ทีม/หน่วยงาน</th><th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">ประเภท</th><th className="px-3 py-3 text-right text-xs font-semibold text-slate-500">จัดการ</th></tr></thead><tbody>{visibleContacts.map((entry) => <ContactRow key={entry.id} entry={entry} canEdit={canEditEntry(entry)} onEdit={setEditEntry} onDetail={setDetailEntry} onCopy={handleCopy} />)}</tbody></table></div></div>
        <p className="text-center text-xs text-slate-400">แสดง {visibleContacts.length} รายการ</p>
      </>}

      <ContactDetailDialog entry={detailEntry} open={detailEntry !== null} onClose={() => setDetailEntry(null)} onCopy={handleCopy} canEdit={detailEntry ? canEditEntry(detailEntry) : false} onEdit={(entry) => { setDetailEntry(null); setEditEntry(entry) }} />
      <ContactEditDialog entry={editEntry} open={editEntry !== null} onClose={() => setEditEntry(null)} />
    </div>
  )
}
