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
      <section className="max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm" role="alert" aria-live="assertive">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-lg border border-red-200 bg-red-50">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          เกิดข้อผิดพลาด
        </h2>

        {/* Description */}
        <p className="text-gray-500 mb-8 leading-relaxed">
          ระบบยังโหลดหน้านี้ไม่ได้ ข้อมูลที่ยังไม่บันทึกอาจไม่แสดงในขณะนี้ กรุณาลองใหม่หรือกลับไปหน้าแผนงาน
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
          >
            <RefreshCw className="h-4 w-4" />
            ลองใหม่อีกครั้ง
          </button>

          <Link
            href="/planning"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
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
      </section>
    </div>
  )
}
