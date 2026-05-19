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
        'relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-800 p-5 text-white shadow-2xl shadow-emerald-500/20 sm:p-7',
        className,
      )}
    >
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/15 blur-3xl" />
      <div className="absolute -bottom-14 -left-10 h-44 w-44 rounded-full bg-amber-300/20 blur-3xl" />
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-3">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-bold text-white/95 backdrop-blur-sm">
              {eyebrow}
            </div>
          )}
          <div className="flex items-start gap-3">
            {icon && (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/15 shadow-inner backdrop-blur-sm">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-2xl font-black leading-tight tracking-tight sm:text-3xl">{title}</h1>
              {description && <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-emerald-50/90">{description}</p>}
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
  emerald: 'from-white/85 to-emerald-50/70 border-emerald-100/70 text-emerald-700',
  amber: 'from-white/85 to-amber-50/70 border-amber-100/70 text-amber-700',
  gray: 'from-white/85 to-slate-50/70 border-slate-200/70 text-slate-600',
}

export function KpiCard({ label, value, icon, tone = 'emerald', className }: KpiCardProps) {
  return (
    <div className={cn('rounded-2xl border bg-gradient-to-br p-4 shadow-lg shadow-slate-900/5', toneClass[tone], className)}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
        </div>
        {icon && <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 shadow-inner">{icon}</div>}
      </div>
    </div>
  )
}
