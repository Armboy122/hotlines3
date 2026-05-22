'use client'

import { useMemo, useState } from 'react'
import { KeyRound, Loader2, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PageHero, PageShell } from '@/components/ui/page-shell'
import { APPROVED_MONTHLY_PLAN_CAPABILITY, buildCapabilityReplacement } from './admin-k5-helpers'
import { useCapabilities, useReplaceUserCapabilities, useUsers, useUsersCapabilities } from '@/hooks/useQueries'
import type { User } from '@/types/auth'

function displayName(user: User) {
  return user.displayName || user.username
}

function activeCapabilities(user: User) {
  return user.capabilities ?? user.capabilityCodes ?? []
}

function canReceiveCapability(user: User) {
  return user.isActive && user.role !== 'viewer' && user.role !== 'super_admin'
}

export function AdminCapabilitiesClient() {
  const [query, setQuery] = useState('')
  const { data: users = [], isLoading, error, refetch } = useUsers({ page: 1, limit: 300 })
  const { data: capabilities = [] } = useCapabilities()
  const capabilityQueries = useUsersCapabilities(users.filter((user) => user.role !== 'super_admin').map((user) => user.id))
  const replaceCapabilities = useReplaceUserCapabilities()

  const capabilityByUserId = useMemo(() => {
    const userIds = users.filter((user) => user.role !== 'super_admin').map((user) => user.id)
    return new Map(userIds.map((userId, index) => [userId, capabilityQueries[index]?.data?.capabilities ?? []]))
  }, [capabilityQueries, users])

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users.filter((user) => {
      if (user.role === 'super_admin') return false
      if (!q) return true
      return [user.username, user.displayName, user.team?.name, user.role].some((part) => (part ?? '').toLowerCase().includes(q))
    })
  }, [query, users])

  const grantedCount = users.filter((user) => (capabilityByUserId.get(user.id) ?? activeCapabilities(user)).includes(APPROVED_MONTHLY_PLAN_CAPABILITY)).length

  const toggleCapability = async (user: User, action: 'grant' | 'revoke') => {
    if (action === 'grant' && !canReceiveCapability(user)) {
      toast.error('ไม่สามารถมอบสิทธิ์ให้บัญชีนี้ได้ ผู้ใช้ต้องใช้งานอยู่และไม่ใช่ viewer')
      return
    }
    const verb = action === 'grant' ? 'มอบสิทธิ์' : 'ถอนสิทธิ์'
    const detail = action === 'grant'
      ? 'สิทธิ์นี้ใช้เฉพาะอัปโหลด/แทนที่ไฟล์ approved/master monthly plan ไม่ใช่สิทธิ์จัดการระบบ'
      : 'ผู้ใช้จะไม่เห็น action อัปโหลดไฟล์ approved/master monthly plan หลัง refresh และ backend จะปฏิเสธการยิง API ตรง'
    if (!window.confirm(`ยืนยัน${verb} ${APPROVED_MONTHLY_PLAN_CAPABILITY} ให้ ${displayName(user)}\n\n${detail}`)) return
    try {
      const payload = buildCapabilityReplacement(capabilityByUserId.get(user.id) ?? activeCapabilities(user), action)
      await replaceCapabilities.mutateAsync({ userId: user.id, ...payload })
      toast.success(`${verb}สำเร็จ`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `${verb}ไม่สำเร็จ`)
    }
  }

  if (error) {
    return (
      <PageShell maxWidth="xl">
        <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-center text-red-700">
          โหลดข้อมูลสิทธิ์ไม่สำเร็จ: {error.message}
          <Button onClick={() => refetch()} className="mt-4 min-h-11 rounded-2xl bg-blue-600 text-white hover:bg-blue-700">ลองใหม่</Button>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell className="space-y-5 sm:space-y-6" maxWidth="xl">
      <PageHero
        eyebrow={<span>Super Admin</span>}
        icon={<KeyRound className="h-6 w-6 text-amber-200" />}
        title="สิทธิ์พิเศษ"
        description="มอบหรือถอนสิทธิ์เฉพาะ can_upload_approved_monthly_plan ผ่าน backend API เท่านั้น"
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="smart-home-card-hover"><CardContent className="p-4"><p className="text-sm text-slate-500">Capability round 1</p><p className="text-lg font-black text-slate-900">1 รายการ</p></CardContent></Card>
        <Card className="smart-home-card-hover"><CardContent className="p-4"><p className="text-sm text-slate-500">มอบสิทธิ์อยู่</p><p className="text-2xl font-black text-blue-700">{grantedCount}</p></CardContent></Card>
        <Card className="smart-home-card-hover"><CardContent className="p-4"><p className="text-sm text-slate-500">Backend capability</p><p className="truncate font-mono text-xs font-bold text-slate-900">{capabilities[0]?.code ?? APPROVED_MONTHLY_PLAN_CAPABILITY}</p></CardContent></Card>
      </div>

      <Card className="smart-home-card">
        <CardContent className="space-y-3 p-4 sm:p-5">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">
            <ShieldAlert className="mr-2 inline h-4 w-4" />
            สิทธิ์นี้ไม่ใช่สิทธิ์จัดการระบบ ห้ามมอบให้ viewer และทุก grant/revoke ต้องยืนยันผลกระทบก่อนส่งคำสั่ง
          </div>
          <Input aria-label="ค้นหาผู้ใช้สำหรับมอบสิทธิ์" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหารหัส ชื่อ ทีม หรือบทบาท" className="smart-home-control min-h-11 rounded-2xl" />
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="smart-home-card flex min-h-52 items-center justify-center text-slate-600">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" /> กำลังโหลดผู้ใช้และสิทธิ์...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {filteredUsers.map((user) => {
            const granted = (capabilityByUserId.get(user.id) ?? activeCapabilities(user)).includes(APPROVED_MONTHLY_PLAN_CAPABILITY)
            const disabled = replaceCapabilities.isPending || (granted ? false : !canReceiveCapability(user))
            return (
              <Card key={user.id} className="smart-home-card-hover">
                <CardHeader className="pb-3">
                  <CardTitle className="flex flex-col gap-1 text-base sm:flex-row sm:items-center sm:justify-between">
                    <span>{displayName(user)} <span className="text-xs font-medium text-gray-500">({user.username})</span></span>
                    <span className="smart-home-chip">{user.role}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-700">
                  <p>ทีม: {user.team?.name ?? user.teamId ?? 'ไม่ระบุทีม'}</p>
                  <p className={granted ? 'font-semibold text-blue-700' : 'text-gray-500'}>{granted ? 'มีสิทธิ์อัปโหลด approved monthly plan' : 'ยังไม่มีสิทธิ์นี้'}</p>
                  {!canReceiveCapability(user) && !granted && <p className="rounded-2xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">มอบสิทธิ์ได้เฉพาะบัญชีที่ใช้งานอยู่และไม่ใช่ viewer</p>}
                  <Button
                    className={`min-h-11 w-full rounded-2xl ${granted ? 'border-red-200 bg-white text-red-700 hover:bg-red-50' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    variant={granted ? 'outline' : 'default'}
                    disabled={disabled}
                    onClick={() => toggleCapability(user, granted ? 'revoke' : 'grant')}
                  >
                    {granted ? 'ถอนสิทธิ์' : 'มอบสิทธิ์'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
          {filteredUsers.length === 0 && <div className="rounded-2xl border border-dashed border-sky-200 bg-white/70 py-10 text-center text-gray-500 lg:col-span-2">ไม่พบผู้ใช้ตามเงื่อนไข</div>}
        </div>
      )}
    </PageShell>
  )
}
