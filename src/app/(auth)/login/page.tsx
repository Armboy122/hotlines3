'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuthContext } from '@/lib/auth/auth-context'
import { PageShell, PageHero } from '@/components/ui/page-shell'
import { LogIn, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, isLoading: authLoading } = useAuthContext()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/planning')
    }
  }, [authLoading, isAuthenticated, router])

  if (authLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username.trim()) {
      setError('กรุณากรอกรหัสพนักงาน')
      return
    }

    if (!/^\d{6}$/.test(username.trim())) {
      setError('รหัสพนักงานต้องเป็นตัวเลข 6 หลัก')
      return
    }

    if (!password) {
      setError('กรุณากรอกรหัสผ่าน')
      return
    }

    setIsLoading(true)

    try {
      await login({ username: username.trim(), password })
      // Don't redirect here - let the isAuthenticated check at line 27-30 handle it
      // This prevents race condition where router.replace happens before state updates
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageShell maxWidth="sm" className="flex min-h-screen items-center px-4 py-8">
      <div className="w-full space-y-4">
        <PageHero
          eyebrow={<span>Mobile Field Ops</span>}
          icon={
            <Image
              src="/logoHL.png"
              alt="Hotline Logo"
              width={34}
              height={34}
              className="rounded-xl"
              priority
              unoptimized
            />
          }
          title={<>Hotline<span className="text-blue-100">S3</span></>}
          description="เข้าสู่ระบบสำหรับบันทึกงาน ตรวจแผน และติดตามทีมภาคสนาม"
          className="rounded-lg p-5"
        />

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-blue-50">
              <LogIn className="h-5 w-5 text-blue-700" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">เข้าสู่ระบบ</h2>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm" aria-live="polite">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label htmlFor="username" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                <User className="h-4 w-4 text-blue-700" />
                รหัสพนักงาน
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={username}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '')
                  setUsername(val)
                }}
                placeholder="ตัวเลข 6 หลัก"
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white
                  focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
                  text-gray-900 placeholder:text-gray-400 transition-all duration-300 outline-none"
                disabled={isLoading}
                spellCheck={false}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                <Lock className="h-4 w-4 text-blue-700" />
                รหัสผ่าน
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่าน"
                  className="w-full h-12 px-4 pr-12 rounded-xl border border-slate-200 bg-white
                    focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
                    text-gray-900 placeholder:text-gray-400 transition-all duration-300 outline-none"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-gray-100/70 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl font-semibold text-white
                bg-blue-700 hover:bg-blue-800 shadow-sm
                transition-colors duration-200
                disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  กำลังเข้าสู่ระบบ…
                </span>
              ) : (
                'เข้าสู่ระบบ'
              )}
            </button>
          </form>
        </div>
      </div>
    </PageShell>
  )
}
