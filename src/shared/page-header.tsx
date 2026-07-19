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
    <header className={cn('mb-5 flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="min-w-0">
        <h1 className="text-2xl font-bold leading-tight text-slate-950 sm:text-[28px]">{title}</h1>
        {description && (
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
        )}
      </div>
      {action && (
        <div className="shrink-0">{action}</div>
      )}
    </header>
  )
}
