'use client'

import { useState, useRef } from 'react'
import { X, Upload, FileText, Loader2, AlertCircle, Users } from 'lucide-react'
import { usePlanUpload } from '@/hooks/usePlanUpload'
import { useConfirmUpload } from '@/hooks/mutations/useMonthlyPlanMutations'
import { formatFileSize } from '@/features/monthly-plan/utils'

interface TeamOption {
  teamId: number
  teamName: string
}

interface UploadPlanDialogProps {
  open: boolean
  year: number
  month: number
  onClose: () => void
  /** Admin mode — shows team selector so admin can upload on behalf of a team */
  isAdmin?: boolean
  teams?: TeamOption[]
  /** User mode — show which team this upload is for (read-only) */
  userTeamId?: number
  userTeamName?: string
}

export function UploadPlanDialog({ open, year, month, onClose, isAdmin = false, teams = [], userTeamId, userTeamName }: UploadPlanDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [selectedTeamId, setSelectedTeamId] = useState<number | ''>('')
  const [fileError, setFileError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { uploadPlan, uploading, progress, reset } = usePlanUpload()
  const confirmUpload = useConfirmUpload(year, month)

  const isSubmitting = uploading || confirmUpload.isPending

  const handleFileSelect = (file: File) => {
    setFileError(null)
    if (file.type !== 'application/pdf') {
      setFileError('รองรับเฉพาะไฟล์ PDF เท่านั้น')
      setSelectedFile(null)
      return
    }
    setSelectedFile(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleSubmit = async () => {
    if (!selectedFile) return

    if (isAdmin && selectedTeamId === '') {
      setFileError('กรุณาเลือกทีมก่อนอัพโหลด')
      return
    }

    if (!description.trim()) {
      setFileError('กรุณาใส่คำอธิบายไฟล์')
      return
    }

    const uploadResult = await uploadPlan(year, month, selectedFile)
    if (!uploadResult.success || !uploadResult.data) {
      setFileError(uploadResult.error ?? 'การอัพโหลดล้มเหลว')
      return
    }

    await confirmUpload.mutateAsync({
      fileKey: uploadResult.data.fileKey,
      fileURL: uploadResult.data.fileURL,
      fileName: uploadResult.data.originalName,
      fileSizeBytes: uploadResult.data.fileSizeBytes,
      description: description.trim() || undefined,
      isMasterPlan: false,
      ...(isAdmin && selectedTeamId !== '' ? { teamId: selectedTeamId as number } : {}),
    })

    handleClose()
  }

  const handleClose = () => {
    setSelectedFile(null)
    setDescription('')
    setSelectedTeamId('')
    setFileError(null)
    setIsDragging(false)
    reset()
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative z-10 w-full sm:max-w-md card-glass rounded-t-3xl sm:rounded-3xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">อัพโหลดไฟล์แผนงาน</h2>
            <p className="text-xs text-gray-500 mt-0.5">รองรับเฉพาะไฟล์ PDF</p>
          </div>
          <button onClick={handleClose} disabled={isSubmitting} className="p-2 icon-glass-gray hover-scale disabled:opacity-50">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Team info — user sees their team, admin sees selector */}
        {isAdmin ? (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-emerald-600" />
              อัพโหลดแทนทีม <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedTeamId}
              onChange={(e) => {
                setSelectedTeamId(e.target.value === '' ? '' : Number(e.target.value))
                setFileError(null)
              }}
              disabled={isSubmitting}
              className="input-glass w-full h-11 rounded-xl px-3 text-sm focus:outline-none disabled:opacity-50"
            >
              <option value="">— เลือกทีม —</option>
              {teams.length > 0 ? teams.map((t) => (
                <option key={t.teamId} value={t.teamId}>{t.teamName}</option>
              )) : <option disabled>กำลังโหลด...</option>}
            </select>
          </div>
        ) : userTeamId ? (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-emerald-600" />
              อัพโหลดสำหรับทีม
            </label>
            <div className="input-glass w-full h-11 rounded-xl px-3 text-sm flex items-center text-gray-800 bg-gray-50/50">
              {userTeamName || `ทีม #${userTeamId}`}
            </div>
          </div>
        ) : null}

        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200
            ${isDragging ? 'border-emerald-400 bg-emerald-50/60'
              : selectedFile ? 'border-emerald-400/60 bg-emerald-50/40'
              : 'border-gray-200/80 hover:border-emerald-300 hover:bg-emerald-50/30'}
          `}
        >
          <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleInputChange} className="hidden" />
          {selectedFile ? (
            <div className="flex items-center gap-3 justify-center">
              <div className="p-2 icon-glass-green"><FileText className="h-5 w-5 text-emerald-600" /></div>
              <div className="text-left min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-center">
                <div className="p-3 icon-glass-green"><Upload className="h-6 w-6 text-emerald-600" /></div>
              </div>
              <p className="text-sm font-semibold text-gray-700">วางไฟล์หรือกดเพื่อเลือก</p>
              <p className="text-xs text-gray-400">เฉพาะ PDF เท่านั้น</p>
            </div>
          )}
        </div>

        {fileError && (
          <div className="flex items-center gap-2 text-red-600 text-sm badge-glass-red rounded-xl px-3 py-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{fileError}</span>
          </div>
        )}

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            คำอธิบายไฟล์{isAdmin && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="เช่น แผนซ่อมบำรุงเขตเหนือ, รายการเบิกของ..."
            rows={3}
            disabled={isSubmitting}
            className="input-glass w-full rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none"
          />
        </div>

        {/* Progress bar */}
        {uploading && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>กำลังอัพโหลด...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {confirmUpload.isPending && (
          <p className="text-xs text-gray-500 text-center">กำลังบันทึกข้อมูล...</p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button onClick={handleClose} disabled={isSubmitting} className="flex-1 h-11 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50">
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedFile || isSubmitting || (!description.trim()) || (isAdmin && selectedTeamId === '')}
            className="flex-1 h-11 btn-gradient-green text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? <><Loader2 className="h-4 w-4 animate-spin" /><span>กำลังบันทึก...</span></>
              : <><Upload className="h-4 w-4" /><span>อัพโหลด</span></>}
          </button>
        </div>
      </div>
    </div>
  )
}
