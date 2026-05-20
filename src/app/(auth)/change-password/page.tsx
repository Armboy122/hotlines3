'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, LockKeyhole } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuthContext } from '@/lib/auth/auth-context'

export default function ChangePasswordPage() {
  const router = useRouter()
  const { changePassword, isAuthenticated, isLoading, user, logout } = useAuthContext()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
      return
    }
    if (!isLoading && isAuthenticated && user && !user.mustChangePassword) {
      router.replace('/planning')
    }
  }, [isAuthenticated, isLoading, router, user])

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน')
      return
    }
    if (newPassword.length < 6) {
      toast.error('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร')
      return
    }
    try {
      setSaving(true)
      await changePassword({ oldPassword, newPassword })
      toast.success('เปลี่ยนรหัสผ่านสำเร็จ')
      router.replace('/planning')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'เปลี่ยนรหัสผ่านไม่สำเร็จ')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading || (!user && isAuthenticated)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-sky-50 px-4">
        <div className="flex items-center gap-3 rounded-3xl bg-white/80 p-6 text-gray-600 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin" /> กำลังโหลดข้อมูลผู้ใช้...
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-sky-50 px-4 py-8">
      <Card className="w-full max-w-md rounded-3xl border-emerald-100 bg-white/90 shadow-xl shadow-emerald-900/10 backdrop-blur">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white">
            <LockKeyhole className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl font-black text-gray-900">เปลี่ยนรหัสผ่านก่อนใช้งาน</CardTitle>
          <p className="text-sm leading-6 text-gray-600">
            บัญชี {user?.username ?? ''} ต้องเปลี่ยนรหัสผ่านครั้งแรกตามนโยบายความปลอดภัยของระบบ ก่อนเข้าใช้งานหน้า /planning
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            <label className="space-y-2 text-sm font-semibold text-gray-700">
              รหัสผ่านปัจจุบัน
              <Input
                value={oldPassword}
                autoComplete="current-password"
                type="password"
                required
                className="min-h-12 rounded-2xl bg-white"
                onChange={(event) => setOldPassword(event.target.value)}
              />
            </label>
            <label className="space-y-2 text-sm font-semibold text-gray-700">
              รหัสผ่านใหม่
              <Input
                value={newPassword}
                autoComplete="new-password"
                type="password"
                minLength={6}
                required
                className="min-h-12 rounded-2xl bg-white"
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </label>
            <label className="space-y-2 text-sm font-semibold text-gray-700">
              ยืนยันรหัสผ่านใหม่
              <Input
                value={confirmPassword}
                autoComplete="new-password"
                type="password"
                minLength={6}
                required
                className="min-h-12 rounded-2xl bg-white"
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </label>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">
              หลังบันทึกสำเร็จ ระบบจะปลดล็อกการเข้าใช้งานและพาไปหน้า /planning อัตโนมัติ
            </div>
            <Button type="submit" disabled={saving} className="min-h-12 w-full rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              บันทึกรหัสผ่านใหม่
            </Button>
            <Button type="button" variant="ghost" className="min-h-11 w-full rounded-2xl text-gray-600" onClick={logout}>
              ออกจากระบบ
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
