'use client'

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from './auth-context'
import { ShieldX } from 'lucide-react'

export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="card-glass rounded-3xl p-10 max-w-sm w-full text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
              <ShieldX className="h-10 w-10 text-red-500" />
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-gray-900">ไม่มีสิทธิ์เข้าถึง</h2>
            <p className="text-sm text-gray-500">หน้านี้สำหรับ Admin เท่านั้น</p>
          </div>
          <button
            onClick={() => router.replace('/')}
            className="w-full h-11 btn-gradient-green text-white rounded-xl text-sm font-semibold"
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
