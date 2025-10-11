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
      color: 'blue',
      items: [
        {
          name: 'Dashboard วิเคราะห์งาน',
          href: '/admin/dashboard',
          description: 'สรุปสถิติและวิเคราะห์รายงานงานประจำวัน',
          icon: LayoutDashboard,
          gradient: 'from-blue-500 to-blue-600'
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
          gradient: 'from-green-500 to-green-600'
        },
        {
          name: 'การไฟฟ้า',
          href: '/admin/peas',
          description: 'จัดการข้อมูลการไฟฟ้า',
          icon: Zap,
          gradient: 'from-yellow-500 to-orange-600'
        },
        {
          name: 'สถานี',
          href: '/admin/stations',
          description: 'จัดการข้อมูลสถานีไฟฟ้า',
          icon: Building2,
          gradient: 'from-purple-500 to-purple-600'
        },
        {
          name: 'ฟีดเดอร์',
          href: '/admin/feeders',
          description: 'จัดการข้อมูลฟีดเดอร์',
          icon: Cable,
          gradient: 'from-indigo-500 to-indigo-600'
        },
      ]
    },
    {
      title: 'ประเภทงาน',
      icon: Briefcase,
      color: 'purple',
      items: [
        {
          name: 'ประเภทงาน',
          href: '/admin/job-types',
          description: 'จัดการประเภทงานต่างๆ',
          icon: Briefcase,
          gradient: 'from-pink-500 to-rose-600'
        },
        {
          name: 'รายละเอียดงาน',
          href: '/admin/job-details',
          description: 'จัดการรายละเอียดของแต่ละประเภทงาน',
          icon: FileText,
          gradient: 'from-cyan-500 to-blue-600'
        },
      ]
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-6 sm:p-8 lg:p-12 text-white shadow-2xl">
            <div className="relative z-10">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
                ระบบจัดการข้อมูลพื้นฐาน
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-blue-100 max-w-2xl">
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
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${
                    section.color === 'blue' ? 'from-blue-100 to-blue-200' :
                    section.color === 'green' ? 'from-green-100 to-green-200' :
                    'from-purple-100 to-purple-200'
                  }`}>
                    <SectionIcon className={`h-6 w-6 ${
                      section.color === 'blue' ? 'text-blue-700' :
                      section.color === 'green' ? 'text-green-700' :
                      'text-purple-700'
                    }`} />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                    {section.title}
                  </h2>
                </div>

                {/* Menu Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {section.items.map((item) => {
                    const ItemIcon = item.icon
                    return (
                      <Link key={item.href} href={item.href}>
                        <Card className="group relative overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer h-full">
                          {/* Gradient Background */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                          <CardHeader className="relative">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-lg sm:text-xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors mb-1">
                                  {item.name}
                                </CardTitle>
                              </div>
                              <div className={`p-2.5 rounded-lg bg-gradient-to-br ${item.gradient} shadow-md group-hover:scale-110 transition-transform duration-300`}>
                                <ItemIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="relative">
                            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-2">
                              {item.description}
                            </p>
                            <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm group-hover:gap-3 transition-all">
                              <span>เข้าสู่หน้านี้</span>
                              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </CardContent>

                          {/* Hover Border Effect */}
                          <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-400 rounded-lg transition-all duration-300" />
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
