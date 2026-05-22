import Link from 'next/link'
import { KeyRound, Settings, ShieldCheck, SlidersHorizontal, Users, UserRoundCog } from 'lucide-react'
import { PageShell } from '@/components/ui/page-shell'

const adminSections = [
  {
    href: '/admin/users',
    title: 'ผู้ใช้',
    description: 'จัดการบัญชี สถานะ ทีม บทบาท และการรีเซ็ตรหัสผ่านตามนโยบายรหัสเริ่มต้น',
    icon: Users,
  },
  {
    href: '/admin/teams',
    title: 'ทีม',
    description: 'จัดการทีม เจ้าของทีม และสมาชิกสำหรับขอบเขตงาน Hotline',
    icon: UserRoundCog,
  },
  {
    href: '/admin/capabilities',
    title: 'สิทธิ์พิเศษ',
    description: 'ให้หรือถอนเฉพาะ can_upload_approved_monthly_plan ตามสัญญา round 1',
    icon: KeyRound,
  },
  {
    href: '/admin/master-data',
    title: 'ข้อมูลหลัก',
    description: 'รวม job types/details, feeders, stations, PEAs และ operation centers ในจุดเดียว',
    icon: SlidersHorizontal,
  },
  {
    href: '/admin/settings',
    title: 'ตั้งค่า',
    description: 'ตั้งค่าขอบเขตแผนประจำเดือนเท่านั้น ไม่เพิ่มค่าที่ backend ยังไม่รองรับ',
    icon: Settings,
  },
] as const

export default function AdminPage() {
  return (
    <PageShell className="space-y-5" maxWidth="xl">
      <section className="smart-home-hero p-5 md:p-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-white/20" />
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="relative z-10 space-y-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/35 bg-white/20 px-3 py-1 text-sm font-bold text-white shadow-sm backdrop-blur-md">
              <ShieldCheck className="h-4 w-4" />
              super_admin เท่านั้น
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-white md:text-3xl">จัดการระบบ</h1>
              <p className="max-w-3xl text-sm font-medium leading-6 text-white/90">
                ศูนย์กลางสำหรับงานจัดการระบบ round 1: ผู้ใช้ ทีม สิทธิ์พิเศษ ข้อมูลหลัก และการตั้งค่าแผนประจำเดือน
              </p>
            </div>
          </div>
          <div className="relative z-10 rounded-2xl border border-amber-200/70 bg-amber-50/90 p-3 text-sm font-medium leading-6 text-amber-950 shadow-inner md:max-w-md">
            ระบบนี้มีเจ้าของ active super_admin ได้หนึ่งบัญชีเท่านั้น และผู้ใช้ที่สร้างใหม่ต้องเปลี่ยนรหัสผ่านเมื่อเข้าใช้งานครั้งแรก
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-label="ส่วนจัดการระบบที่เปิดใช้งาน">
        {adminSections.map((section) => {
          const Icon = section.icon
          return (
            <Link
              key={section.href}
              href={section.href}
              className="smart-home-card-hover smart-home-focus group p-4"
            >
              <div className="flex min-h-full flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-blue-700 shadow-inner group-hover:bg-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h2 className="text-lg font-bold text-slate-950">{section.title}</h2>
                </div>
                <p className="text-sm leading-6 text-slate-600">{section.description}</p>
                <span className="mt-auto inline-flex min-h-11 items-center text-sm font-bold text-blue-700">
                  เปิดหน้า {section.title}
                </span>
              </div>
            </Link>
          )
        })}
      </section>

      <section className="smart-home-panel p-4 text-sm font-medium leading-6 text-slate-700">
        รายการที่ไม่อยู่ใน round 1 จะไม่แสดงในเมนูและไม่อยู่ใน route policy ของผู้ดูแลระบบ
      </section>
    </PageShell>
  )
}
