'use client'

import type { SubmissionStatus } from '@/types/monthly-plan'
import { getStatusLabel } from '@/features/monthly-plan/utils'

interface SubmissionStatusBadgeProps {
  status: SubmissionStatus
  size?: 'sm' | 'md'
}

export function SubmissionStatusBadge({ status, size = 'md' }: SubmissionStatusBadgeProps) {
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'

  switch (status) {
    case 'submitted':
      return (
        <span className={`inline-flex items-center gap-1 badge-glass-green rounded-full font-semibold ${sizeClass}`}>
          <span>✓</span>
          <span>{getStatusLabel(status)}</span>
        </span>
      )
    case 'pending':
      return (
        <span className={`inline-flex items-center gap-1 badge-glass-yellow rounded-full font-semibold ${sizeClass}`}>
          <span>−</span>
          <span>{getStatusLabel(status)}</span>
        </span>
      )
    case 'missed':
      return (
        <span className={`inline-flex items-center gap-1 badge-glass-red rounded-full font-semibold ${sizeClass}`}>
          <span>✕</span>
          <span>{getStatusLabel(status)}</span>
        </span>
      )
  }
}
