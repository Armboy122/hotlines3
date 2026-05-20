import { redirect } from 'next/navigation'

export default function LegacyAdminRoutePage() {
  redirect('/admin/master-data?group=feeders')
}
