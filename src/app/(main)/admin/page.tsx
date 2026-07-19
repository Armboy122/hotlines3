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
    description: 'กำหนดสิทธิ์อัปโหลดไฟล์แผนประจำเดือนที่อนุมัติแล้ว',
    icon: KeyRound,
  },
  {
    href: '/admin/master-data',
    title: 'ข้อมูลปฏิบัติงาน',
    description: 'จัดการประเภทงาน รายละเอียดงาน ฟีดเดอร์ สถานี การไฟฟ้า และศูนย์ปฏิบัติการ',
    icon: SlidersHorizontal,
  },
  {
    href: '/admin/settings',
    title: 'ตั้งค่าระบบ',
    description: 'ตั้งค่าขอบเขตและช่วงเวลาของแผนประจำเดือน',
    icon: Settings,
  },
] as const

const groups = [
  { title: 'บุคลากรและสิทธิ์', items: adminSections.slice(0, 3) },
  { title: 'ข้อมูลปฏิบัติงาน', items: adminSections.slice(3, 4) },
  { title: 'ตั้งค่าระบบ', items: adminSections.slice(4) },
] as const

export default function AdminPage() {
  return (
    <PageShell className="space-y-6" maxWidth="xl">
      <header className="flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-blue-700">
              <ShieldCheck className="h-4 w-4" /> ผู้ดูแลระบบสูงสุด
            </div>
            <h1 className="text-2xl font-bold text-slate-950 md:text-[28px]">จัดการระบบ</h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-600">จัดการบุคลากร ข้อมูลปฏิบัติงาน และการตั้งค่าที่จำเป็นสำหรับการทำงาน</p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-950 md:max-w-md">
            ระบบมีผู้ดูแลระบบสูงสุดได้หนึ่งบัญชี และผู้ใช้ใหม่ต้องเปลี่ยนรหัสผ่านเมื่อเข้าใช้งานครั้งแรก
          </div>
      </header>

      {groups.map((group) => (
      <section key={group.title} className="space-y-3" aria-label={group.title}>
        <h2 className="text-lg font-bold text-slate-950">{group.title}</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {group.items.map((section) => {
          const Icon = section.icon
          return (
            <Link
              key={section.href}
              href={section.href}
              className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:bg-blue-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <div className="flex min-h-full flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-700 group-hover:bg-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h2 className="text-lg font-bold text-slate-950">{section.title}</h2>
                </div>
                <p className="text-sm leading-6 text-slate-600">{section.description}</p>
                <span className="mt-auto inline-flex min-h-11 items-center text-sm font-semibold text-blue-700">
                  เปิดหน้า {section.title}
                </span>
              </div>
            </Link>
          )
        })}</div>
      </section>
      ))}
    </PageShell>
  )
}
