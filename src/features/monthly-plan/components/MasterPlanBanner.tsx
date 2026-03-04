'use client'

import { Download, FileText, Crown, Loader2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { PlanFile } from '@/types/monthly-plan'
import { formatFileSize } from '@/features/monthly-plan/utils'
import { monthlyPlanService } from '@/lib/services/monthly-plan.service'
import { toast } from 'sonner'

interface MasterPlanBannerProps {
  masterPlan: PlanFile
  year: number
  month: number
  isAdmin?: boolean
  onHardDelete?: (fileId: number) => void
}

export function MasterPlanBanner({ masterPlan, year, month, isAdmin = false, onHardDelete }: MasterPlanBannerProps) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const url = await monthlyPlanService.getDownloadUrl(masterPlan.id)
      const link = document.createElement('a')
      link.href = url
      link.download = masterPlan.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch {
      toast.error('ไม่สามารถดาวน์โหลดได้ในขณะนี้')
    } finally {
      setDownloading(false)
    }
  }

  const uploadedDate = new Date(masterPlan.createdAt).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-5 sm:p-6 shadow-xl shadow-emerald-500/30">
        {/* Background orbs */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl">
                <Crown className="h-5 w-5 text-amber-300" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">แผนรวมประจำเดือน</p>
                <p className="text-sm font-bold text-white">
                  {masterPlan.uploadedBy?.username ?? 'Admin'}
                </p>
              </div>
            </div>

            {/* Hard Delete button — admin only */}
            {isAdmin && onHardDelete && (
              <button
                onClick={() => {
                  if (confirm('ยืนยันการลบแผนรวมนี้ถาวร?')) {
                    onHardDelete(masterPlan.id)
                  }
                }}
                className="flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm border border-red-300/30 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">ลบถาวร</span>
              </button>
            )}
          </div>

          {/* File info */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl shrink-0">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold text-white truncate">{masterPlan.fileName}</p>
                <p className="text-xs text-white/70 mt-0.5">
                  {formatFileSize(masterPlan.fileSizeBytes)} · อัพโหลด {uploadedDate}
                </p>
              </div>
            </div>

            {/* Download — everyone */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="shrink-0 flex items-center gap-2 bg-white text-emerald-700 font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg hover:bg-emerald-50 hover:shadow-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">ดาวน์โหลด</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export function MasterPlanEmpty() {
  return (
    <div className="card-glass-green rounded-2xl p-5 sm:p-6 border-2 border-dashed border-emerald-300/50">
      <div className="flex items-center gap-3">
        <div className="p-3 icon-glass-green">
          <Crown className="h-6 w-6 text-emerald-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700">แผนรวมประจำเดือน</p>
          <p className="text-xs text-gray-500 mt-0.5">ยังไม่มีแผนรวม — Admin จะอัพโหลดหลังรวบรวมเสร็จ</p>
        </div>
      </div>
    </div>
  )
}
