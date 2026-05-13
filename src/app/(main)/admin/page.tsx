'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthContext } from '@/lib/auth/auth-context'
import { getAdminConsoleHeroCopy, getVisibleAdminMenuIds, type AdminMenuId } from '@/lib/auth/role-policy'
import { PageHero, PageShell } from '@/components/ui/page-shell'
import {
  MapPin,
  Zap,
  Building2,
  Cable,
  Briefcase,
  FileText,
  ArrowRight,
  Sparkles,
  CalendarDays,
  Users
} from 'lucide-react'

export default function AdminPage() {
  const adminMenus = [
    {
      title: 'ข้อมูลพื้นฐาน',
      icon: Building2,
      iconClass: 'icon-glass-green',
      items: [
        {
          id: 'operation-centers' satisfies AdminMenuId,
          name: 'จุดรวมงาน',
          href: '/admin/operation-centers',
          description: 'จัดการจุดรวมงานต่างๆ',
          icon: MapPin,
          iconClass: 'icon-glass-green'
        },
        {
          id: 'peas' satisfies AdminMenuId,
          name: 'การไฟฟ้า',
          href: '/admin/peas',
          description: 'จัดการข้อมูลการไฟฟ้า',
          icon: Zap,
          iconClass: 'icon-glass-yellow'
        },
        {
          id: 'stations' satisfies AdminMenuId,
          name: 'สถานี',
          href: '/admin/stations',
          description: 'จัดการข้อมูลสถานีไฟฟ้า',
          icon: Building2,
          iconClass: 'icon-glass-green'
        },
        {
          id: 'feeders' satisfies AdminMenuId,
          name: 'ฟีดเดอร์',
          href: '/admin/feeders',
          description: 'จัดการข้อมูลฟีดเดอร์',
          icon: Cable,
          iconClass: 'icon-glass-yellow'
        },
      ]
    },
    {
      title: 'ประเภทงาน',
      icon: Briefcase,
      iconClass: 'icon-glass-yellow',
      items: [
        {
          id: 'job-types' satisfies AdminMenuId,
          name: 'ประเภทงาน',
          href: '/admin/job-types',
          description: 'จัดการประเภทงานต่างๆ',
          icon: Briefcase,
          iconClass: 'icon-glass-yellow'
        },
        {
          id: 'job-details' satisfies AdminMenuId,
          name: 'รายละเอียดงาน',
          href: '/admin/job-details',
          description: 'จัดการรายละเอียดของแต่ละประเภทงาน',
          icon: FileText,
          iconClass: 'icon-glass-yellow'
        },
      ]
    },
    {
      title: 'ทีมและบุคลากร',
      icon: Users,
      iconClass: 'icon-glass-green',
      items: [
        {
          id: 'users' satisfies AdminMenuId,
          name: 'ผู้ใช้และสิทธิ์',
          href: '/admin/users',
          description: 'จัดการบัญชีผู้ใช้ บทบาท ทีม และสถานะการใช้งาน',
          icon: Users,
          iconClass: 'icon-glass-green'
        },
        {
          id: 'teams' satisfies AdminMenuId,
          name: 'ทีมงาน',
          href: '/admin/teams',
          description: 'จัดการทีมภาคสนาม และตรวจสอบจำนวนสมาชิกจากสมุดโทรศัพท์',
          icon: Users,
          iconClass: 'icon-glass-green'
        },
      ]
    },
    {
      title: 'แผนงาน',
      icon: CalendarDays,
      iconClass: 'icon-glass-green',
      items: [
        {
          id: 'monthly-plan' satisfies AdminMenuId,
          name: 'แผนงานประจำเดือน',
          href: '/admin/monthly-plan',
          description: 'จัดการไฟล์แผนงานประจำเดือน อัพโหลดแผนรวม และตั้งค่าระบบ',
          icon: CalendarDays,
          iconClass: 'icon-glass-green'
        },
        {
          id: 'task-daily' satisfies AdminMenuId,
          name: 'งานทั้งหมด',
          href: '/admin/task-daily',
          description: 'ค้นหาและตรวจสอบรายงานงานประจำวันจากทีมงาน',
          icon: Briefcase,
          iconClass: 'icon-glass-yellow'
        }
      ]
    },
  ]

  const { user } = useAuthContext()
  const visibleMenuIds = getVisibleAdminMenuIds(user?.role)
  const heroCopy = getAdminConsoleHeroCopy(user?.role)
  const visibleAdminMenus = adminMenus
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => visibleMenuIds.includes(item.id as AdminMenuId)),
    }))
    .filter((section) => section.items.length > 0)

  return (
    <PageShell className="space-y-6 sm:space-y-8" maxWidth="xl">
      <PageHero
        eyebrow={<span>ผู้ดูแลระบบ</span>}
        icon={<Sparkles className="h-6 w-6 text-amber-200" />}
        title={heroCopy.title}
        description={heroCopy.description}
      />

      {/* Menu Sections */}
      <div className="space-y-8 sm:space-y-10">
        {visibleAdminMenus.map((section) => {
          const SectionIcon = section.icon
          return (
            <div key={section.title} className="space-y-4 sm:space-y-6">
              {/* Section Header with Glass Icon */}
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`p-3 ${section.iconClass}`}>
                  <SectionIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {section.title}
                </h2>
              </div>

              {/* Menu Cards with Glassmorphism */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {section.items.map((item) => {
                  const ItemIcon = item.icon
                  return (
                    <Link key={item.href} href={item.href}>
                      <Card className="card-glass group relative overflow-hidden cursor-pointer h-full hover:scale-[1.02] transition-all duration-300">
                        <CardHeader className="relative pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors mb-1">
                                {item.name}
                              </CardTitle>
                            </div>
                            <div className={`p-3 ${item.iconClass} group-hover:scale-110 transition-transform duration-300`}>
                              <ItemIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="relative pt-0">
                          <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-2">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm group-hover:gap-3 transition-all">
                            <span>เข้าสู่หน้านี้</span>
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </CardContent>

                        {/* Gradient Border on Hover */}
                        <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-emerald-400/50 transition-all duration-300 pointer-events-none" />

                        {/* Glass Shine Effect on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/0 group-hover:from-white/5 group-hover:via-transparent group-hover:to-transparent transition-all duration-500 pointer-events-none rounded-2xl" />
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </PageShell>
  )
}
