'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // ข้อมูลจะถือว่า "stale" หลังจาก 5 นาที
            staleTime: 5 * 60 * 1000, // 5 minutes
            // Cache ข้อมูลไว้ 10 นาที
            gcTime: 10 * 60 * 1000, // 10 minutes (เดิมคือ cacheTime)
            // Retry การ fetch ถ้าเกิด error
            retry: 1,
            // Refetch เมื่อ window กลับมา focus
            refetchOnWindowFocus: false,
            // Refetch เมื่อ network กลับมา online
            refetchOnReconnect: true,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
