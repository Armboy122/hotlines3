'use client'

/**
 * ResponsiveTableCard — desktop table / mobile card pattern per Requirement D §D.7.
 *
 * - Desktop (md+): standard table with column headers
 * - Mobile (<md): stacked cards with key-value pairs
 * - Empty state: centered message
 */

import { cn } from '@/lib/utils'

export interface Column<T = Record<string, unknown>> {
  key: string
  header: string
  /** Optional custom cell renderer; receives row data */
  render?: (row: T) => React.ReactNode
}

interface ResponsiveTableCardProps<T = Record<string, unknown>> {
  columns: Column<T>[]
  data: T[]
  /** Row key field (defaults to 'id') */
  rowKey?: string
  /** Which field to use as card title on mobile */
  cardLabelKey: string
  /** Empty state message */
  emptyMessage?: string
  /** Extra className on outer container */
  className?: string
}

export function ResponsiveTableCard<T extends Record<string, unknown>>({
  columns,
  data,
  rowKey = 'id',
  cardLabelKey,
  emptyMessage = 'ไม่มีข้อมูล',
  className,
}: ResponsiveTableCardProps<T>) {
  if (data.length === 0) {
    return (
      <div className={cn('text-center py-12 text-stone-400', className)}>
        <p>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-0', className)}>
      {/* Desktop table — hidden on mobile */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left py-3 px-4 text-xs font-medium text-stone-500 uppercase tracking-wide"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={String(row[rowKey as keyof T] ?? i)}
                className="border-b border-stone-100 hover:bg-stone-50"
              >
                {columns.map((col) => (
                  <td key={col.key} className="py-3 px-4 text-stone-700">
                    {col.render
                      ? col.render(row)
                      : String(row[col.key as keyof T] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards — visible on mobile only */}
      <div className="block md:hidden space-y-3">
        {data.map((row, i) => (
          <div
            key={String(row[rowKey as keyof T] ?? i)}
            className="bg-white border border-stone-200 rounded-xl p-4"
          >
            <p className="font-medium text-stone-900 mb-2">
              {String(row[cardLabelKey as keyof T] ?? '')}
            </p>
            {columns
              .filter((col) => col.key !== cardLabelKey)
              .map((col) => (
                <div key={col.key} className="flex justify-between py-1">
                  <span className="text-xs text-stone-500">{col.header}</span>
                  <span className="text-sm text-stone-700">
                    {col.render
                      ? col.render(row)
                      : String(row[col.key as keyof T] ?? '')}
                  </span>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  )
}
