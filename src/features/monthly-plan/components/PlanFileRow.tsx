'use client'

import { FileText, Eye, Download, Trash2, RotateCcw, Loader2 } from 'lucide-react'
import { useState } from 'react'
import type { PlanFile } from '@/types/monthly-plan'
import { formatFileSize } from '@/features/monthly-plan/utils'
import { monthlyPlanService } from '@/lib/services/monthly-plan.service'
import { toast } from 'sonner'

interface PlanFileRowProps {
  file: PlanFile
  canDownload: boolean
  canSoftDelete: boolean
  canHardDelete: boolean
  canRestore: boolean
  onSoftDelete: (fileId: number) => void
  onHardDelete: (fileId: number) => void
  onRestore: (fileId: number) => void
}

export function PlanFileRow({
  file,
  canDownload,
  canSoftDelete,
  canHardDelete,
  canRestore,
  onSoftDelete,
  onHardDelete,
  onRestore,
}: PlanFileRowProps) {
  const [downloading, setDownloading] = useState(false)

  const handleOpen = async (download: boolean) => {
    setDownloading(true)
    try {
      const url = await monthlyPlanService.getDownloadUrl(file.id)
      const a = document.createElement('a')
      a.href = url
      if (download) a.download = file.fileName
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch {
      toast.error('ไม่สามารถเปิดไฟล์ได้')
    } finally {
      setDownloading(false)
    }
  }

  const uploadedDate = new Date(file.createdAt).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
  })

  const uploaderName = file.uploadedBy?.username ?? `user #${file.uploadedById}`
  const isDeleted = file.isDeleted

  return (
    <div
      className={`
        flex items-start gap-3 p-3 sm:p-4 rounded-xl border transition-all duration-200
        ${isDeleted
          ? 'bg-gray-50/60 border-gray-200/40 opacity-60'
          : 'bg-white/50 border-gray-100/60 hover:bg-white/70 hover:border-emerald-200/50'
        }
      `}
    >
      {/* File Icon */}
      <div className={`p-2 rounded-lg shrink-0 ${isDeleted ? 'bg-gray-100' : 'icon-glass-green'}`}>
        <FileText className={`h-4 w-4 ${isDeleted ? 'text-gray-400' : 'text-emerald-600'}`} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${isDeleted ? 'line-through text-gray-400' : 'text-gray-800'}`}>
          {file.fileName}
        </p>
        {file.description && (
          <p className={`text-xs mt-0.5 line-clamp-2 ${isDeleted ? 'text-gray-400' : 'text-gray-500'}`}>
            {file.description}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          {formatFileSize(file.fileSizeBytes)} · {uploaderName} · {uploadedDate}
          {isDeleted && <span className="ml-1 text-red-400">(ยกเลิกแล้ว)</span>}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {!isDeleted && (
          <button
            onClick={() => handleOpen(false)}
            disabled={downloading}
            className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
            title="เปิดในแท็บใหม่"
          >
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
          </button>
        )}

        {!isDeleted && canDownload && (
          <button
            onClick={() => handleOpen(true)}
            disabled={downloading}
            className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
            title="ดาวน์โหลด"
          >
            <Download className="h-4 w-4" />
          </button>
        )}

        {!isDeleted && canSoftDelete && (
          <button
            onClick={() => onSoftDelete(file.id)}
            className="p-2 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
            title="ยกเลิกไฟล์"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}

        {isDeleted && canRestore && (
          <button
            onClick={() => onRestore(file.id)}
            className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
            title="คืนค่าไฟล์"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        )}

        {canHardDelete && (
          <button
            onClick={() => onHardDelete(file.id)}
            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="ลบถาวร"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
