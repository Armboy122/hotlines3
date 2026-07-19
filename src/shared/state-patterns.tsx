'use client'

/**
 * State pattern components per Requirement D §D.8.
 *
 * - LoadingState: skeleton/pulse animation
 * - EmptyState: centered message
 * - ErrorState: error message with optional retry
 * - NoPermissionState: muted no-permission message
 *
 * All use Thai-first copy. All preserve page layout structure.
 */

import { cn } from '@/lib/utils'

// ── LOADING ────────────────────────────────────────────

interface LoadingStateProps {
  /** Number of skeleton rows (default 4) */
  rows?: number
  className?: string
}

export function LoadingState({ rows = 4, className }: LoadingStateProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-4 bg-stone-200 rounded w-full" />
        </div>
      ))}
    </div>
  )
}

// ── EMPTY ──────────────────────────────────────────────

interface EmptyStateProps {
  title?: string
  message?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  title = 'ยังไม่มีข้อมูล',
  message = 'ไม่มีข้อมูล',
  action,
  className,
}: EmptyStateProps) {
  return (
    <section className={cn('rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center', className)}>
      <h2 className="text-base font-semibold text-slate-800">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">{message}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </section>
  )
}

// ── ERROR ──────────────────────────────────────────────

interface ErrorStateProps {
  title?: string
  message?: string
  /** Retry button label. If provided, a retry button is shown. */
  onRetry?: string
  /** Called when retry is clicked. Not testable via SSR, but part of the API. */
  onRetryClick?: () => void
  className?: string
}

export function ErrorState({
  title = 'โหลดข้อมูลไม่สำเร็จ',
  message = 'เกิดข้อผิดพลาด กรุณาลองใหม่',
  onRetry,
  onRetryClick,
  className,
}: ErrorStateProps) {
  return (
    <section className={cn('rounded-xl border border-red-200 bg-red-50 px-4 py-8 text-center', className)} role="alert" aria-live="assertive">
      <h2 className="text-base font-semibold text-red-900">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-red-800">{message}</p>
      {onRetry && (
        <button
          onClick={onRetryClick}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
        >
          {onRetry}
        </button>
      )}
    </section>
  )
}

// ── NO PERMISSION ──────────────────────────────────────

interface NoPermissionStateProps {
  message?: string
  className?: string
}

export function NoPermissionState({
  message = 'ไม่มีสิทธิ์',
  className,
}: NoPermissionStateProps) {
  return (
    <section className={cn('rounded-xl border border-slate-200 bg-slate-50 px-4 py-10 text-center', className)}>
      <h2 className="text-base font-semibold text-slate-800">ไม่มีสิทธิ์เข้าถึง</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">{message}</p>
    </section>
  )
}
