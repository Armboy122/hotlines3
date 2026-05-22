import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type DeviceCardProps = {
  title: ReactNode
  subtitle?: ReactNode
  icon: ReactNode
  state?: ReactNode
  action?: ReactNode
  tone?: 'blue' | 'teal' | 'green' | 'amber' | 'red' | 'slate'
  className?: string
}

const toneClass: Record<NonNullable<DeviceCardProps['tone']>, string> = {
  blue: 'bg-blue-50 text-blue-700 border-blue-100',
  teal: 'bg-teal-50 text-teal-700 border-teal-100',
  green: 'bg-green-50 text-green-700 border-green-100',
  amber: 'bg-amber-50 text-amber-700 border-amber-100',
  red: 'bg-red-50 text-red-700 border-red-100',
  slate: 'bg-slate-50 text-slate-700 border-slate-100',
}

export function DeviceCard({
  title,
  subtitle,
  icon,
  state,
  action,
  tone = 'blue',
  className,
}: DeviceCardProps) {
  return (
    <article
      className={cn(
        'smart-home-card-hover group min-h-32 p-4 active:scale-[0.98]',
        className,
      )}
    >
      <div className="flex h-full flex-col justify-between gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-inner', toneClass[tone])}>
            {icon}
          </div>
          {state ? (
            <span className={cn('rounded-full border px-2.5 py-1 text-xs font-bold', toneClass[tone])}>
              {state}
            </span>
          ) : null}
        </div>
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h3 className="break-words text-sm font-black leading-5 text-slate-950">{title}</h3>
            {subtitle ? <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{subtitle}</p> : null}
          </div>
          {action ?? (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/80 text-slate-500 shadow-sm transition-colors group-hover:text-blue-700">
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
