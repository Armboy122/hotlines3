'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Auth error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 flex items-center justify-center">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          เกิดข้อผิดพลาดในการเข้าสู่ระบบ
        </h2>

        <p className="text-gray-500 mb-8 leading-relaxed">
          กรุณาลองใหม่อีกครั้ง หากปัญหายังคงอยู่ กรุณาติดต่อผู้ดูแลระบบ
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white btn-gradient-green"
          >
            <RefreshCw className="h-4 w-4" />
            ลองใหม่อีกครั้ง
          </button>

          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-gray-700 card-glass hover:scale-[1.02] transition-all"
          >
            กลับหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </div>
  )
}
