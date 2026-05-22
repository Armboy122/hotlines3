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
        'mx-auto w-full px-3 py-4 sm:px-5 sm:py-6 lg:px-8',
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
        'smart-home-hero p-5 sm:p-6',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-white/20" />
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-3">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/20 px-3 py-1 text-xs font-bold text-white/95 shadow-sm backdrop-blur-md">
              {eyebrow}
            </div>
          )}
          <div className="flex items-start gap-3">
            {icon && (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/40 bg-white/20 shadow-inner backdrop-blur-md">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-2xl font-black leading-tight sm:text-3xl">{title}</h1>
              {description && <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-white/90">{description}</p>}
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
  emerald: 'from-white/80 to-teal-50/70 border-teal-100/80 text-teal-700',
  amber: 'from-white/80 to-amber-50/70 border-amber-100/80 text-amber-700',
  gray: 'from-white/80 to-sky-50/70 border-sky-100/80 text-slate-600',
}

export function KpiCard({ label, value, icon, tone = 'emerald', className }: KpiCardProps) {
  return (
    <div className={cn('rounded-2xl border bg-gradient-to-br p-4 shadow-[0_12px_30px_rgba(30,92,165,0.08)] backdrop-blur-xl', toneClass[tone], className)}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
        </div>
        {icon && <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/80 bg-white/75 shadow-inner">{icon}</div>}
      </div>
    </div>
  )
}
