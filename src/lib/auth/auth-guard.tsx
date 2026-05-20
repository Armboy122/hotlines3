'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthContext } from './auth-context'

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuthContext()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
      return
    }
    if (!isLoading && isAuthenticated && user?.mustChangePassword && pathname !== '/change-password') {
      router.replace('/change-password')
    }
  }, [isAuthenticated, isLoading, pathname, router, user?.mustChangePassword])

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

  if (!isAuthenticated || (user?.mustChangePassword && pathname !== '/change-password')) {
    return null
  }

  return <>{children}</>
}
