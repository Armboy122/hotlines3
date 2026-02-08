'use client'

import QueryProvider from '@/providers/query-provider'
import { AuthProvider } from '@/lib/auth/auth-context'

export default function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QueryProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryProvider>
  )
}
