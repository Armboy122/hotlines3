import type { ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Inbox, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type StateViewProps = {
  variant: 'loading' | 'empty' | 'error' | 'success'
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

const iconMap = {
  loading: Loader2,
  empty: Inbox,
  error: AlertCircle,
  success: CheckCircle2,
} as const

const toneClass = {
  loading: 'bg-sky-50 text-sky-700 border-sky-100',
  empty: 'bg-slate-50 text-slate-600 border-slate-100',
  error: 'bg-red-50 text-red-700 border-red-100',
  success: 'bg-green-50 text-green-700 border-green-100',
} as const

export function StateView({ variant, title, description, action, className }: StateViewProps) {
  const Icon = iconMap[variant]

  return (
    <section className={cn('smart-home-card p-6 text-center', className)}>
      <div className={cn('mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border shadow-inner', toneClass[variant])}>
        <Icon className={cn('h-7 w-7', variant === 'loading' && 'animate-spin')} />
      </div>
      <h2 className="mt-4 text-base font-black text-slate-950">{title}</h2>
      {description ? <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-600">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </section>
  )
}

export function StateRetryButton({ onClick, loading = false }: { onClick: () => void; loading?: boolean }) {
  return (
    <Button type="button" variant="outline" onClick={onClick} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      ลองใหม่
    </Button>
  )
}
