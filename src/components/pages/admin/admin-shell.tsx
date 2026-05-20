'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { KeyRound, Settings, ShieldCheck, SlidersHorizontal, Users, UserRoundCog } from 'lucide-react'
import { cn } from '@/lib/utils'

const adminNavItems = [
  { href: '/admin', label: 'ภาพรวม', icon: ShieldCheck },
  { href: '/admin/users', label: 'ผู้ใช้', icon: Users },
  { href: '/admin/teams', label: 'ทีม', icon: UserRoundCog },
  { href: '/admin/capabilities', label: 'สิทธิ์', icon: KeyRound },
  { href: '/admin/master-data', label: 'ข้อมูลหลัก', icon: SlidersHorizontal },
  { href: '/admin/settings', label: 'ตั้งค่า', icon: Settings },
] as const

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="space-y-3">
      <nav
        aria-label="เมนูย่อยจัดการระบบ"
        className="mx-auto w-full max-w-7xl px-3 pt-3 sm:px-5 lg:px-8"
      >
        <div className="flex gap-2 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
          {adminNavItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(`${item.href}/`))
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
                  active
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700',
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>
      {children}
    </div>
  )
}
