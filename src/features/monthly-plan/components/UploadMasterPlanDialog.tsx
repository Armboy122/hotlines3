'use client'

import { useState, useRef, useCallback } from 'react'
import { X, Upload, FileText, Loader2, AlertCircle, Crown, CheckCircle2 } from 'lucide-react'
import { usePlanUpload } from '@/hooks/usePlanUpload'
import { useConfirmUpload } from '@/hooks/mutations/useMonthlyPlanMutations'
import { formatFileSize } from '@/features/monthly-plan/utils'
import { toast } from 'sonner'

interface UploadMasterPlanDialogProps {
  open: boolean
  year: number
  month: number
  onClose: () => void
}

interface QueuedFile {
  id: string
  file: File
  status: 'pending' | 'uploading' | 'confirming' | 'done' | 'error'
  progress: number
  error?: string
}

export function UploadMasterPlanDialog({ open, year, month, onClose }: UploadMasterPlanDialogProps) {
  const [queue, setQueue] = useState<QueuedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { uploadPlan } = usePlanUpload()
  const confirmUpload = useConfirmUpload(year, month)

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return
    const pdfFiles = Array.from(files).filter(f => f.type === 'application/pdf')
    if (pdfFiles.length === 0) {
      toast.error('รองรับเฉพาะไฟล์ PDF เท่านั้น')
      return
    }
    
    const newItems: QueuedFile[] = pdfFiles.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      status: 'pending',
      progress: 0,
    }))
    
    setQueue(prev => [...prev, ...newItems])
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files)
    e.target.value = '' // Reset for re-select
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const removeFile = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id))
  }

  const processQueue = async () => {
    if (queue.length === 0 || isProcessing) return
    setIsProcessing(true)

    for (const item of queue.filter(q => q.status === 'pending')) {
      // Update status to uploading
      setQueue(prev => prev.map(q => 
        q.id === item.id ? { ...q, status: 'uploading' } : q
      ))

      // Step 1: Upload to R2 with progress simulation
      const uploadResult = await uploadPlan(year, month, item.file)
      
      if (!uploadResult.success || !uploadResult.data) {
        setQueue(prev => prev.map(q => 
          q.id === item.id ? { ...q, status: 'error', error: uploadResult.error ?? 'อัพโหลดล้มเหลว' } : q
        ))
        continue
      }

      // Update status to confirming
      setQueue(prev => prev.map(q => 
        q.id === item.id ? { ...q, status: 'confirming', progress: 100 } : q
      ))

      // Step 2: Confirm upload
      try {
        await confirmUpload.mutateAsync({
          fileKey: uploadResult.data.fileKey,
          fileURL: uploadResult.data.fileURL,
          fileName: uploadResult.data.originalName,
          fileSizeBytes: uploadResult.data.fileSizeBytes,
          isMasterPlan: true,
        })

        setQueue(prev => prev.map(q => 
          q.id === item.id ? { ...q, status: 'done' } : q
        ))
      } catch {
        setQueue(prev => prev.map(q => 
          q.id === item.id ? { ...q, status: 'error', error: 'บันทึกข้อมูลล้มเหลว' } : q
        ))
      }
    }

    setIsProcessing(false)
    toast.success(`อัพโหลดเสร็จสิ้น: ${queue.filter(q => q.status === 'done').length} ไฟล์`)
    
    // Auto close if all done
    const allDone = queue.every(q => q.status === 'done' || q.status === 'error')
    if (allDone && queue.some(q => q.status === 'done')) {
      setTimeout(() => handleClose(), 800)
    }
  }

  const handleClose = () => {
    if (isProcessing) return // Prevent close while processing
    setQueue([])
    setIsDragging(false)
    onClose()
  }

  const pendingCount = queue.filter(q => q.status === 'pending').length
  const doneCount = queue.filter(q => q.status === 'done').length
  const errorCount = queue.filter(q => q.status === 'error').length

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={!isProcessing ? handleClose : undefined} />

      <div className="relative z-10 w-full sm:max-w-lg card-glass rounded-t-3xl sm:rounded-3xl p-6 space-y-5 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 icon-glass-green">
              <Crown className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">อัพโหลดแผนรวม</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {queue.length === 0 ? 'เลือกไฟล์ PDF ได้หลายไฟล์' : `รอดำเนินการ: ${pendingCount} | เสร็จ: ${doneCount} | ผิดพลาด: ${errorCount}`}
              </p>
            </div>
          </div>
          <button onClick={!isProcessing ? handleClose : undefined} disabled={isProcessing} className="p-2 icon-glass-gray hover-scale disabled:opacity-50">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Drop Zone — always available to add more */}
        {queue.length === 0 ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200
              ${isDragging ? 'border-emerald-400 bg-emerald-50/60' : 'border-gray-200/80 hover:border-emerald-300 hover:bg-emerald-50/30'}
            `}
          >
            <input ref={fileInputRef} type="file" accept="application/pdf" multiple onChange={handleInputChange} className="hidden" />
            <div className="space-y-3">
              <div className="flex justify-center">
                <div className="p-3 icon-glass-green"><Upload className="h-6 w-6 text-emerald-600" /></div>
              </div>
              <p className="text-sm font-semibold text-gray-700">วางไฟล์หรือกดเพื่อเลือก</p>
              <p className="text-xs text-gray-400">รองรับหลายไฟล์ PDF พร้อมกัน</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* File List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {queue.map((item) => (
                <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border ${
                  item.status === 'done' ? 'bg-emerald-50/50 border-emerald-200' :
                  item.status === 'error' ? 'bg-red-50/50 border-red-200' :
                  item.status === 'uploading' || item.status === 'confirming' ? 'bg-amber-50/50 border-amber-200' :
                  'bg-gray-50/50 border-gray-200'
                }`}>
                  <div className="p-2 rounded-lg bg-white shadow-sm">
                    {item.status === 'done' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : item.status === 'error' ? (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    ) : (
                      <FileText className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(item.file.size)}</p>
                    {item.status === 'uploading' && (
                      <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-2/3 animate-pulse" />
                      </div>
                    )}
                    {item.status === 'error' && item.error && (
                      <p className="text-xs text-red-500 mt-0.5">{item.error}</p>
                    )}
                  </div>
                  {item.status === 'pending' && !isProcessing && (
                    <button onClick={() => removeFile(item.id)} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  )}
                  {(item.status === 'uploading' || item.status === 'confirming') && (
                    <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />
                  )}
                </div>
              ))}
            </div>

            {/* Add more files button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50/30 transition-all disabled:opacity-50"
            >
              + เพิ่มไฟล์
            </button>
            <input ref={fileInputRef} type="file" accept="application/pdf" multiple onChange={handleInputChange} className="hidden" />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button 
            onClick={handleClose} 
            disabled={isProcessing} 
            className="flex-1 h-11 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {isProcessing ? 'กำลังอัพโหลด...' : 'ยกเลิก'}
          </button>
          <button
            onClick={processQueue}
            disabled={queue.length === 0 || isProcessing || pendingCount === 0}
            className="flex-1 h-11 btn-gradient-green text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <><Loader2 className="h-4 w-4 animate-spin" /><span>กำลังดำเนินการ...</span></>
            ) : (
              <><Upload className="h-4 w-4" /><span>อัพโหลด {pendingCount > 0 ? `(${pendingCount})` : ''}</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
