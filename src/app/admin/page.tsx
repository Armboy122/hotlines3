import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminPage() {
  const adminMenus = [
    {
      title: 'Dashboard',
      items: [
        { name: 'ภาพรวมแผนงาน', href: '/admin/dashboard', description: 'แสดงสถานะและสถิติของแผนงานทั้งหมด' },
      ]
    },
    {
      title: 'ข้อมูลพื้นฐาน',
      items: [
        { name: 'จุดรวมงาน', href: '/admin/operation-centers', description: 'จัดการจุดรวมงานต่างๆ' },
        { name: 'การไฟฟ้า', href: '/admin/peas', description: 'จัดการข้อมูลการไฟฟ้า' },
        { name: 'สถานี', href: '/admin/stations', description: 'จัดการข้อมูลสถานีไฟฟ้า' },
        { name: 'ฟีดเดอร์', href: '/admin/feeders', description: 'จัดการข้อมูลฟีดเดอร์' },
      ]
    },
    {
      title: 'ประเภทงาน',
      items: [
        { name: 'ประเภทงาน', href: '/admin/job-types', description: 'จัดการประเภทงานต่างๆ' },
        { name: 'รายละเอียดงาน', href: '/admin/job-details', description: 'จัดการรายละเอียดของแต่ละประเภทงาน' },
      ]
    },
    // {
    //   title: 'แผนงาน',
    //   items: [
    //     { name: 'แผนฉีดน้ำสถานี', href: '/admin/plan-stations', description: 'จัดการแผนฉีดน้ำสถานี พร้อม Export ข้อมูล' },
    //     { name: 'แผนฉีดน้ำไลน์', href: '/admin/plan-lines', description: 'จัดการแผนฉีดน้ำในไลน์ 33kV และ 115kV' },
    //     { name: 'แผน ABS', href: '/admin/plan-abs', description: 'จัดการแผน ABS (Automatic Bus Sectionalizer)' },
    //     { name: 'แผนบำรุงรักษาไม้ฉนวน', href: '/admin/plan-conductors', description: 'จัดการแผนบำรุงรักษาไม้ฉนวนของการไฟฟ้า' },
    //     { name: 'แผนตรวจรถกระเช้า', href: '/admin/plan-cable-cars', description: 'จัดการแผนตรวจสอบรถกระเช้าพร้อมประเมินประสิทธิภาพ' },
    //   ]
    // }
  ]

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">ระบบจัดการข้อมูลพื้นฐาน</h1>
      
      <div className="space-y-8">
        {adminMenus.map((section) => (
          <div key={section.title}>
            <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.items.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
