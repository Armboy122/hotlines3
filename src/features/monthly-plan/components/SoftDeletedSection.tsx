'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import type { PlanFile } from '@/types/monthly-plan'
import { PlanFileRow } from './PlanFileRow'

interface SoftDeletedSectionProps {
  files: PlanFile[]
  canHardDelete: boolean
  canRestore: boolean
  onHardDelete: (fileId: number) => void
  onRestore: (fileId: number) => void
}

export function SoftDeletedSection({
  files,
  canHardDelete,
  canRestore,
  onHardDelete,
  onRestore,
}: SoftDeletedSectionProps) {
  const [expanded, setExpanded] = useState(false)

  if (files.length === 0) return null

  return (
    <div className="mt-4">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        <span>ไฟล์ที่ยกเลิกแล้ว ({files.length} รายการ)</span>
      </button>

      {expanded && (
        <div className="mt-2 space-y-2 pl-2 border-l-2 border-gray-200/60">
          {files.map((file) => (
            <PlanFileRow
              key={file.id}
              file={file}
              canDownload={false}
              canSoftDelete={false}
              canHardDelete={canHardDelete}
              canRestore={canRestore}
              onSoftDelete={() => {}}
              onHardDelete={onHardDelete}
              onRestore={onRestore}
            />
          ))}
        </div>
      )}
    </div>
  )
}
