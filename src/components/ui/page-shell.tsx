import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type PageShellProps = {
  children: ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const maxWidthClass: Record<NonNullable<PageShellProps['maxWidth']>, string> = {
  sm: 'max-w-xl',
  md: 'max-w-2xl',
  lg: 'max-w-5xl',
  xl: 'max-w-7xl',
  full: 'max-w-none',
}

export function PageShell({ children, className, maxWidth = 'xl' }: PageShellProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8',
        maxWidthClass[maxWidth],
        className,
      )}
    >
      {children}
    </div>
  )
}

type PageHeroProps = {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  icon?: ReactNode
  actions?: ReactNode
  className?: string
}

export function PageHero({ eyebrow, title, description, icon, actions, className }: PageHeroProps) {
  return (
    <section
      className={cn(
        'border-b border-border pb-4 sm:pb-5',
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-2">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
              {eyebrow}
            </div>
          )}
          <div className="flex items-start gap-3">
            {icon && (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-2xl font-bold leading-tight text-slate-950 sm:text-[28px]">{title}</h1>
              {description && <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>}
            </div>
          </div>
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
    </section>
  )
}

type KpiCardProps = {
  label: ReactNode
  value: ReactNode
  icon?: ReactNode
  tone?: 'emerald' | 'amber' | 'gray'
  className?: string
}

const toneClass: Record<NonNullable<KpiCardProps['tone']>, string> = {
  emerald: 'border-teal-200 bg-teal-50 text-teal-800',
  amber: 'border-amber-200 bg-amber-50 text-amber-800',
  gray: 'border-slate-200 bg-slate-50 text-slate-700',
}

export function KpiCard({ label, value, icon, tone = 'emerald', className }: KpiCardProps) {
  return (
    <div className={cn('rounded-xl border p-4', toneClass[tone], className)}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-600">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
        </div>
        {icon && <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-current/20 bg-white/70">{icon}</div>}
      </div>
    </div>
  )
}
