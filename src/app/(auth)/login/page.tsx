'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuthContext } from '@/lib/auth/auth-context'
import { PageShell, PageHero } from '@/components/ui/page-shell'
import { Zap, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react'

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
          title={<>Hotline<span className="text-amber-200">S3</span></>}
          description="เข้าสู่ระบบสำหรับบันทึกงาน ตรวจแผน และติดตามทีมภาคสนาม"
          className="rounded-[1.6rem] p-5"
        />

        <div className="card-glass rounded-[1.6rem] p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-xl bg-emerald-500/10">
              <Zap className="h-5 w-5 text-emerald-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">เข้าสู่ระบบ</h2>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                <User className="h-4 w-4 text-emerald-500" />
                รหัสพนักงาน
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={username}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '')
                  setUsername(val)
                }}
                placeholder="ตัวเลข 6 หลัก"
                className="w-full h-12 px-4 rounded-xl border border-gray-200/50 bg-white/50 backdrop-blur-sm
                  focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10
                  text-gray-900 placeholder:text-gray-400 transition-all duration-300 outline-none"
                disabled={isLoading}
                autoFocus
              />
            </div>

            {/* Password */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                <Lock className="h-4 w-4 text-emerald-500" />
                รหัสผ่าน
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่าน"
                  className="w-full h-12 px-4 pr-12 rounded-xl border border-gray-200/50 bg-white/50 backdrop-blur-sm
                    focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10
                    text-gray-900 placeholder:text-gray-400 transition-all duration-300 outline-none"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-gray-100/70 hover:text-gray-600"
                  tabIndex={-1}
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
                bg-gradient-to-r from-emerald-500 to-emerald-600
                hover:from-emerald-600 hover:to-emerald-700
                shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40
                transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  กำลังเข้าสู่ระบบ...
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
