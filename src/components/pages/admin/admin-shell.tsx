'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { KeyRound, Settings, ShieldCheck, SlidersHorizontal, Users, UserRoundCog } from 'lucide-react'
import { cn } from '@/lib/utils'

const adminNavGroups = [
  { label: 'ภาพรวม', items: [{ href: '/admin', label: 'ภาพรวม', icon: ShieldCheck }] },
  { label: 'บุคลากร', items: [{ href: '/admin/users', label: 'ผู้ใช้', icon: Users }, { href: '/admin/teams', label: 'ทีม', icon: UserRoundCog }, { href: '/admin/capabilities', label: 'สิทธิ์พิเศษ', icon: KeyRound }] },
  { label: 'ข้อมูล', items: [{ href: '/admin/master-data', label: 'ข้อมูลปฏิบัติงาน', icon: SlidersHorizontal }] },
  { label: 'ตั้งค่า', items: [{ href: '/admin/settings', label: 'ตั้งค่าระบบ', icon: Settings }] },
] as const

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="space-y-3">
      <nav
        aria-label="เมนูย่อยจัดการระบบ"
        className="mx-auto w-full max-w-7xl px-3 pt-3 sm:px-5 lg:px-8"
      >
        <div className="flex gap-3 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2">
          {adminNavGroups.map((group) => group.items.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(`${item.href}/`))
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2',
                  active
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          }))}
        </div>
      </nav>
      {children}
    </div>
  )
}
