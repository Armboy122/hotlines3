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
  ArrowRight
} from 'lucide-react'

export default function AdminPage() {
  const adminMenus = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      color: 'green',
      items: [
        {
          name: 'Dashboard วิเคราะห์งาน',
          href: '/admin/dashboard',
          description: 'สรุปสถิติและวิเคราะห์รายงานงานประจำวัน',
          icon: LayoutDashboard,
          bgColor: 'bg-green-500',
          iconColor: 'text-white'
        },
      ]
    },
    {
      title: 'ข้อมูลพื้นฐาน',
      icon: Building2,
      color: 'green',
      items: [
        {
          name: 'จุดรวมงาน',
          href: '/admin/operation-centers',
          description: 'จัดการจุดรวมงานต่างๆ',
          icon: MapPin,
          bgColor: 'bg-green-500',
          iconColor: 'text-white'
        },
        {
          name: 'การไฟฟ้า',
          href: '/admin/peas',
          description: 'จัดการข้อมูลการไฟฟ้า',
          icon: Zap,
          bgColor: 'bg-yellow-500',
          iconColor: 'text-white'
        },
        {
          name: 'สถานี',
          href: '/admin/stations',
          description: 'จัดการข้อมูลสถานีไฟฟ้า',
          icon: Building2,
          bgColor: 'bg-green-500',
          iconColor: 'text-white'
        },
        {
          name: 'ฟีดเดอร์',
          href: '/admin/feeders',
          description: 'จัดการข้อมูลฟีดเดอร์',
          icon: Cable,
          bgColor: 'bg-green-500',
          iconColor: 'text-white'
        },
      ]
    },
    {
      title: 'ประเภทงาน',
      icon: Briefcase,
      color: 'green',
      items: [
        {
          name: 'ประเภทงาน',
          href: '/admin/job-types',
          description: 'จัดการประเภทงานต่างๆ',
          icon: Briefcase,
          bgColor: 'bg-yellow-500',
          iconColor: 'text-white'
        },
        {
          name: 'รายละเอียดงาน',
          href: '/admin/job-details',
          description: 'จัดการรายละเอียดของแต่ละประเภทงาน',
          icon: FileText,
          bgColor: 'bg-green-500',
          iconColor: 'text-white'
        },
      ]
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="bg-green-500 rounded-2xl p-6 sm:p-8 lg:p-12 text-white shadow-sm">
            <div className="relative z-10">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
                ระบบจัดการข้อมูลพื้นฐาน
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-white max-w-2xl">
                จัดการข้อมูลพื้นฐาน ดู Dashboard และวิเคราะห์รายงานงานประจำวัน
              </p>
            </div>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full -mr-24 -mb-24" />
          </div>
        </div>

        {/* Menu Sections */}
        <div className="space-y-8 sm:space-y-10">
          {adminMenus.map((section) => {
            const SectionIcon = section.icon
            return (
              <div key={section.title} className="space-y-4 sm:space-y-6">
                {/* Section Header */}
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-50">
                    <SectionIcon className="h-6 w-6 text-green-500" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {section.title}
                  </h2>
                </div>

                {/* Menu Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {section.items.map((item) => {
                    const ItemIcon = item.icon
                    return (
                      <Link key={item.href} href={item.href}>
                        <Card className="group relative overflow-hidden shadow-sm border-gray-200 hover:shadow-md transition-all duration-300 cursor-pointer h-full bg-white">
                          <CardHeader className="relative">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors mb-1">
                                  {item.name}
                                </CardTitle>
                              </div>
                              <div className={`p-2.5 rounded-lg ${item.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                                <ItemIcon className={`h-5 w-5 sm:h-6 sm:w-6 ${item.iconColor}`} />
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="relative">
                            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-2">
                              {item.description}
                            </p>
                            <div className="flex items-center gap-2 text-green-600 font-semibold text-sm group-hover:gap-3 transition-all">
                              <span>เข้าสู่หน้านี้</span>
                              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </CardContent>

                          {/* Hover Border Effect */}
                          <div className="absolute inset-0 border-2 border-transparent group-hover:border-green-500 rounded-lg transition-all duration-300" />
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
