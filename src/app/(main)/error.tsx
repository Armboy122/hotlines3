'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Route error:', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 flex items-center justify-center">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          เกิดข้อผิดพลาด
        </h2>

        {/* Description */}
        <p className="text-gray-500 mb-8 leading-relaxed">
          ขออภัย เกิดข้อผิดพลาดบางอย่าง กรุณาลองใหม่อีกครั้ง
          หากปัญหายังคงอยู่ กรุณาติดต่อผู้ดูแลระบบ
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white btn-gradient-green"
          >
            <RefreshCw className="h-4 w-4" />
            ลองใหม่อีกครั้ง
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-gray-700 card-glass hover:scale-[1.02] transition-all"
          >
            <Home className="h-4 w-4" />
            กลับหน้าหลัก
          </Link>
        </div>

        {/* Error Digest (for debugging) */}
        {error.digest && (
          <p className="mt-6 text-xs text-gray-400">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
