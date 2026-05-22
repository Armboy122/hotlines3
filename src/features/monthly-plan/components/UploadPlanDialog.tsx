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
  const [workStartDate, setWorkStartDate] = useState('')
  const [workEndDate, setWorkEndDate] = useState('')
  const [destination, setDestination] = useState('')
  const [remarks, setRemarks] = useState('')
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

    if (!workStartDate || !workEndDate) {
      setFileError('กรุณาระบุวันที่เริ่มและสิ้นสุดแผนงาน')
      return
    }

    if (new Date(workEndDate) < new Date(workStartDate)) {
      setFileError('วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่ม')
      return
    }

    if (!destination.trim()) {
      setFileError('กรุณาระบุสถานที่หรือภารกิจ')
      return
    }

    const targetTeamId = isAdmin && selectedTeamId !== '' ? selectedTeamId as number : undefined
    const uploadResult = await uploadPlan(year, month, selectedFile, targetTeamId ? { teamId: targetTeamId } : undefined)
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
      workStartDate,
      workEndDate,
      destination: destination.trim(),
      remarks: remarks.trim() || undefined,
      isMasterPlan: false,
      ...(targetTeamId ? { teamId: targetTeamId } : {}),
    })

    handleClose()
  }

  const handleClose = () => {
    setSelectedFile(null)
    setDescription('')
    setWorkStartDate('')
    setWorkEndDate('')
    setDestination('')
    setRemarks('')
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

      <div className="smart-home-card relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-3xl p-6 sm:max-w-md sm:rounded-3xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">ส่งแผนงานประจำเดือน</h2>
            <p className="mt-0.5 text-xs text-slate-500">ระบุข้อมูลแผนและแนบไฟล์ PDF</p>
          </div>
          <button onClick={handleClose} disabled={isSubmitting} className="smart-home-control smart-home-focus flex h-11 w-11 items-center justify-center disabled:opacity-50">
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        {/* Team info — user sees their team, admin sees selector */}
        {isAdmin ? (
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <Users className="h-3.5 w-3.5 text-blue-600" />
              อัพโหลดแทนทีม <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedTeamId}
              onChange={(e) => {
                setSelectedTeamId(e.target.value === '' ? '' : Number(e.target.value))
                setFileError(null)
              }}
              disabled={isSubmitting}
              className="smart-home-control smart-home-focus h-11 w-full px-3 text-sm disabled:opacity-50"
            >
              <option value="">— เลือกทีม —</option>
              {teams.length > 0 ? teams.map((t) => (
                <option key={t.teamId} value={t.teamId}>{t.teamName}</option>
              )) : <option disabled>กำลังโหลด...</option>}
            </select>
          </div>
        ) : userTeamId ? (
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <Users className="h-3.5 w-3.5 text-blue-600" />
              อัพโหลดสำหรับทีม
            </label>
            <div className="smart-home-control flex h-11 w-full items-center px-3 text-sm text-slate-800">
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
            smart-home-panel relative cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200
            ${isDragging ? 'border-sky-400 bg-sky-50/70'
              : selectedFile ? 'border-sky-400/70 bg-sky-50/60'
              : 'border-slate-200/80 hover:border-sky-300 hover:bg-sky-50/50'}
          `}
        >
          <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleInputChange} className="hidden" />
          {selectedFile ? (
            <div className="flex items-center justify-center gap-3">
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-2"><FileText className="h-5 w-5 text-blue-600" /></div>
              <div className="min-w-0 text-left">
                <p className="truncate text-sm font-semibold text-slate-800">{selectedFile.name}</p>
                <p className="text-xs text-slate-500">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-center">
                <div className="rounded-2xl border border-sky-200 bg-sky-50 p-3"><Upload className="h-6 w-6 text-blue-600" /></div>
              </div>
              <p className="text-sm font-semibold text-slate-700">วางไฟล์หรือกดเพื่อเลือก</p>
              <p className="text-xs text-slate-500">เฉพาะ PDF เท่านั้น</p>
            </div>
          )}
        </div>

        {fileError && (
          <div className="badge-error flex items-center gap-2 rounded-xl px-3 py-2 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{fileError}</span>
          </div>
        )}

        {/* Plan metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              วันที่เริ่ม <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={workStartDate}
              onChange={(e) => { setWorkStartDate(e.target.value); setFileError(null) }}
              disabled={isSubmitting}
              className="smart-home-control smart-home-focus h-11 w-full px-3 text-sm disabled:opacity-50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              วันที่สิ้นสุด <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={workEndDate}
              onChange={(e) => { setWorkEndDate(e.target.value); setFileError(null) }}
              disabled={isSubmitting}
              className="smart-home-control smart-home-focus h-11 w-full px-3 text-sm disabled:opacity-50"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            สถานที่/ภารกิจ <span className="text-red-500">*</span>
          </label>
          <input
            value={destination}
            onChange={(e) => { setDestination(e.target.value); setFileError(null) }}
            placeholder="เช่น สถานี A, สำรวจสายป้อน..."
            disabled={isSubmitting}
            className="smart-home-control smart-home-focus h-11 w-full px-3 text-sm disabled:opacity-50"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            รายละเอียดไฟล์
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="เช่น รายการเบิกของ เอกสารประกอบงาน..."
            rows={3}
            disabled={isSubmitting}
            className="smart-home-control smart-home-focus w-full resize-none px-3 py-2.5 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            หมายเหตุ
          </label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="หมายเหตุเพิ่มเติม"
            rows={2}
            disabled={isSubmitting}
            className="smart-home-control smart-home-focus w-full resize-none px-3 py-2.5 text-sm"
          />
        </div>

        {/* Progress bar */}
        {uploading && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-500">
              <span>กำลังอัพโหลด...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {confirmUpload.isPending && (
          <p className="text-center text-xs text-slate-500">กำลังบันทึกข้อมูล...</p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button onClick={handleClose} disabled={isSubmitting} className="smart-home-control smart-home-focus h-11 flex-1 text-sm font-semibold text-slate-600 disabled:opacity-50">
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedFile || isSubmitting || !workStartDate || !workEndDate || !destination.trim() || (isAdmin && selectedTeamId === '')}
            className="smart-home-focus flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)] transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
