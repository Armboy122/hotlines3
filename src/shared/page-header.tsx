'use client'

/**
 * PageHeader — reusable page header per Requirement D §D.7.
 *
 * Contains page title, optional description, and optional action slot.
 * Responsive: stacks vertically on mobile, row on desktop.
 */

import { cn } from '@/lib/utils'

interface PageHeaderProps {
  /** Page title (Thai) */
  title: string
  /** Optional subtitle/description */
  description?: string
  /** Optional action slot (e.g. "เพิ่ม" button) */
  action?: React.ReactNode
  /** Extra className on outer container */
  className?: string
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6', className)}>
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-stone-500">{description}</p>
        )}
      </div>
      {action && (
        <div className="shrink-0">{action}</div>
      )}
    </div>
  )
}
