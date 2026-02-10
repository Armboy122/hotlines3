import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LayoutDashboard,
  MapPin,
  Zap,
  Building2,
  Cable,
  Briefcase,
  FileText,
  ArrowRight,
  Sparkles
} from 'lucide-react'

export default function AdminPage() {
  const adminMenus = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      iconClass: 'icon-glass-green',
      items: [
        {
          name: 'Dashboard วิเคราะห์งาน',
          href: '/admin/dashboard',
          description: 'สรุปสถิติและวิเคราะห์รายงานงานประจำวัน',
          icon: LayoutDashboard,
          iconClass: 'icon-glass-green'
        },
      ]
    },
    {
      title: 'ข้อมูลพื้นฐาน',
      icon: Building2,
      iconClass: 'icon-glass-green',
      items: [
        {
          name: 'จุดรวมงาน',
          href: '/admin/operation-centers',
          description: 'จัดการจุดรวมงานต่างๆ',
          icon: MapPin,
          iconClass: 'icon-glass-green'
        },
        {
          name: 'การไฟฟ้า',
          href: '/admin/peas',
          description: 'จัดการข้อมูลการไฟฟ้า',
          icon: Zap,
          iconClass: 'icon-glass-yellow'
        },
        {
          name: 'สถานี',
          href: '/admin/stations',
          description: 'จัดการข้อมูลสถานีไฟฟ้า',
          icon: Building2,
          iconClass: 'icon-glass-green'
        },
        {
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
          name: 'ประเภทงาน',
          href: '/admin/job-types',
          description: 'จัดการประเภทงานต่างๆ',
          icon: Briefcase,
          iconClass: 'icon-glass-yellow'
        },
        {
          name: 'รายละเอียดงาน',
          href: '/admin/job-details',
          description: 'จัดการรายละเอียดของแต่ละประเภทงาน',
          icon: FileText,
          iconClass: 'icon-glass-yellow'
        },
      ]
    },
  ]

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Hero Section with Glassmorphism */}
        <div className="relative overflow-hidden">
          <div className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 rounded-3xl p-6 sm:p-8 lg:p-12 text-white shadow-2xl shadow-emerald-500/20">
            <div className="relative z-10 space-y-4 sm:space-y-6">
              {/* Glass Badge */}
              <div className="inline-flex items-center gap-2 backdrop-blur-sm bg-white/20 border border-white/30 rounded-full px-4 py-2">
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span className="text-sm font-semibold text-white">Admin Panel</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
                ระบบจัดการข้อมูลพื้นฐาน
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-white/90 max-w-2xl">
                จัดการข้อมูลพื้นฐาน ดู Dashboard และวิเคราะห์รายงานงานประจำวัน
              </p>
            </div>

            {/* Animated Floating Orbs */}
            <div className="absolute top-10 right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-10 left-10 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl animate-pulse animation-delay-1000" />
            <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl animate-pulse animation-delay-2000" />
          </div>
        </div>

        {/* Menu Sections */}
        <div className="space-y-8 sm:space-y-10">
          {adminMenus.map((section) => {
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
      </div>
    </div>
  )
}
