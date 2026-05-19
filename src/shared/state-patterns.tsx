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
  message?: string
  className?: string
}

export function EmptyState({
  message = 'ไม่มีข้อมูล',
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12', className)}>
      <p className="text-stone-400 text-sm">{message}</p>
    </div>
  )
}

// ── ERROR ──────────────────────────────────────────────

interface ErrorStateProps {
  message?: string
  /** Retry button label. If provided, a retry button is shown. */
  onRetry?: string
  /** Called when retry is clicked. Not testable via SSR, but part of the API. */
  onRetryClick?: () => void
  className?: string
}

export function ErrorState({
  message = 'เกิดข้อผิดพลาด กรุณาลองใหม่',
  onRetry,
  onRetryClick,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('text-center py-12', className)}>
      <p className="text-red-600 text-sm mb-3">{message}</p>
      {onRetry && (
        <button
          onClick={onRetryClick}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
        >
          {onRetry}
        </button>
      )}
    </div>
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
    <div className={cn('text-center py-12', className)}>
      <p className="text-stone-400 text-sm">{message}</p>
    </div>
  )
}
