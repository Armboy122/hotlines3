import Link from 'next/link'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <section className="max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        {/* 404 Number */}
        <div className="mb-6">
          <span className="text-8xl font-bold text-blue-700 sm:text-9xl">
            404
          </span>
        </div>

        {/* Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-blue-50">
          <Search className="h-10 w-10 text-blue-600" />
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          ไม่พบหน้าที่ต้องการ
        </h2>

        {/* Description */}
        <p className="text-gray-500 mb-8 leading-relaxed">
          หน้าที่คุณกำลังมองหาอาจถูกย้าย ลบ หรือไม่มีอยู่ในระบบ
        </p>

        {/* Action */}
        <Link
          href="/planning"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
        >
          <Home className="h-4 w-4" />
          กลับหน้าหลัก
        </Link>
      </section>
    </div>
  )
}
