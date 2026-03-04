import Link from 'next/link'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50">
      <div className="text-center max-w-md">
        {/* 404 Number */}
        <div className="mb-6">
          <span className="text-8xl sm:text-9xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
            404
          </span>
        </div>

        {/* Icon */}
        <div className="mx-auto mb-6 w-20 h-20 rounded-2xl icon-glass-green flex items-center justify-center">
          <Search className="h-10 w-10 text-emerald-600" />
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
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white btn-gradient-green"
        >
          <Home className="h-4 w-4" />
          กลับหน้าหลัก
        </Link>
      </div>
    </div>
  )
}
