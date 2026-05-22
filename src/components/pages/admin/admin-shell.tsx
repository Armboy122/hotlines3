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
        <div className="smart-home-panel flex gap-2 overflow-x-auto p-2">
          {adminNavItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(`${item.href}/`))
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'smart-home-focus inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-bold transition-colors',
                  active
                    ? 'bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,0.24)]'
                    : 'smart-home-control hover:border-sky-200',
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
