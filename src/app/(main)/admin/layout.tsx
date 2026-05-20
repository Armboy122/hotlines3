import { AdminGuard } from '@/lib/auth/admin-guard'
import { AdminShell } from '@/components/pages/admin/admin-shell'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminShell>{children}</AdminShell>
    </AdminGuard>
  )
}
