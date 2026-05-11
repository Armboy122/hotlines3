'use client'

import { useState } from 'react'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useLargeWorkTasks } from '@/hooks/useQueries'
import { useAddLargeWorkTasks } from '@/hooks/mutations/useLargeWorkMutations'
import { emptyTaskRow, buildAssignmentPayload } from '@/lib/large-work-helpers'
import type { TaskRowState } from '@/lib/large-work-helpers'
import type { LargeWorkTaskResponse } from '@/types/large-work'
import type { Team } from '@/types/query-types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const TASK_STATUS_LABELS: Record<string, string> = {
  todo: 'รอดำเนินการ',
  in_progress: 'กำลังทำ',
  done: 'เสร็จสิ้น',
  blocked: 'ติดขัด',
  cancelled: 'ยกเลิก',
}

function taskStatusClass(status: string): string {
  switch (status) {
    case 'done': return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    case 'in_progress': return 'border-sky-200 bg-sky-50 text-sky-700'
    case 'blocked': return 'border-red-200 bg-red-50 text-red-600'
    case 'cancelled': return 'border-gray-200 bg-gray-100 text-gray-400'
    default: return 'border-amber-200 bg-amber-50 text-amber-700'
  }
}

function ExistingTaskRow({ task }: { task: LargeWorkTaskResponse }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white/80 p-3 space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-gray-800 truncate">
          {task.sequenceNo != null ? `#${task.sequenceNo} ` : ''}{task.pointLabel ?? 'ไม่ระบุชื่อจุด'}
        </span>
        <span className={cn('shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold', taskStatusClass(task.status))}>
          {TASK_STATUS_LABELS[task.status] ?? task.status}
        </span>
      </div>
      <p className="text-xs text-gray-500">{task.assignedTeamName}</p>
      {task.locationText && <p className="text-xs text-gray-500 truncate">{task.locationText}</p>}
      <div className="flex flex-wrap gap-2 text-[11px] text-gray-500">
        {task.workType && <span>{task.workType}</span>}
        {task.pointCount != null && <span>จุด: {task.pointCount}</span>}
        {task.treeCount != null && <span>ต้น: {task.treeCount}</span>}
        {task.itemCount != null && <span>รายการ: {task.itemCount}</span>}
      </div>
    </div>
  )
}

function RowField({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-600">
        {label}{required && <span className="text-red-500"> *</span>}
      </label>
      {children}
    </div>
  )
}

function NewTaskRowCard({
  index,
  row,
  teams,
  onChange,
  onRemove,
}: {
  index: number
  row: TaskRowState
  teams?: Team[]
  onChange: (index: number, field: keyof TaskRowState, value: string) => void
  onRemove: (index: number) => void
}) {
  const set = (field: keyof TaskRowState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => onChange(index, field, e.target.value)

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-gray-700">จุดที่ {index + 1}</span>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"
          aria-label="ลบจุดงานนี้"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Team assignment — required */}
      <RowField label="ทีมที่มอบหมาย" required>
        <select
          value={row.assignedTeamId}
          onChange={set('assignedTeamId')}
          className="h-11 w-full rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-amber-500"
        >
          <option value="">เลือกทีม</option>
          {teams?.map((team) => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
        </select>
      </RowField>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <RowField label="ชื่อจุด/ป้ายจุด">
          <Input
            value={row.pointLabel}
            onChange={set('pointLabel')}
            placeholder="เช่น P-001"
            className="h-11"
          />
        </RowField>
        <RowField label="สถานที่/ตำแหน่ง">
          <Input
            value={row.locationText}
            onChange={set('locationText')}
            placeholder="สถานี / ฟีดเดอร์"
            className="h-11"
          />
        </RowField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <RowField label="ละติจูด">
          <Input
            type="number"
            value={row.latitude}
            onChange={set('latitude')}
            placeholder="13.7563"
            className="h-11"
            step="any"
          />
        </RowField>
        <RowField label="ลองจิจูด">
          <Input
            type="number"
            value={row.longitude}
            onChange={set('longitude')}
            placeholder="100.5018"
            className="h-11"
            step="any"
          />
        </RowField>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <RowField label="ประเภทงาน">
          <Input
            value={row.workType}
            onChange={set('workType')}
            placeholder="เช่น tree_trim, line_check"
            className="h-11"
          />
        </RowField>
        <RowField label="รายละเอียดงาน">
          <Input
            value={row.workDetail}
            onChange={set('workDetail')}
            placeholder="รายละเอียดเพิ่มเติม"
            className="h-11"
          />
        </RowField>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <RowField label="จำนวนจุด">
          <Input
            type="number"
            value={row.pointCount}
            onChange={set('pointCount')}
            placeholder="0"
            className="h-11"
            min="0"
          />
        </RowField>
        <RowField label="จำนวนต้น">
          <Input
            type="number"
            value={row.treeCount}
            onChange={set('treeCount')}
            placeholder="0"
            className="h-11"
            min="0"
          />
        </RowField>
        <RowField label="จำนวนรายการ">
          <Input
            type="number"
            value={row.itemCount}
            onChange={set('itemCount')}
            placeholder="0"
            className="h-11"
            min="0"
          />
        </RowField>
      </div>

      <RowField label="หมายเหตุ">
        <Textarea
          value={row.notes}
          onChange={set('notes')}
          placeholder="รายละเอียดหรือข้อกำหนดพิเศษ"
          rows={2}
        />
      </RowField>
    </div>
  )
}

interface Props {
  id: number
  teams?: Team[]
  open: boolean
  onClose: () => void
}

export function LargeWorkTasksDialog({ id, teams, open, onClose }: Props) {
  const { data: existingTasks, isLoading: tasksLoading } = useLargeWorkTasks(open ? id : undefined)
  const addTasks = useAddLargeWorkTasks()
  const [newRows, setNewRows] = useState<TaskRowState[]>([])

  const handleAddRow = () => setNewRows((prev) => [...prev, emptyTaskRow()])

  const handleChangeRow = (index: number, field: keyof TaskRowState, value: string) => {
    setNewRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    )
  }

  const handleRemoveRow = (index: number) => {
    setNewRows((prev) => prev.filter((_, i) => i !== index))
  }

  const handleClose = () => {
    setNewRows([])
    onClose()
  }

  const validPayload = buildAssignmentPayload(newRows)
  const canSubmit = validPayload.length > 0 && !addTasks.isPending

  const handleSubmit = () => {
    if (!canSubmit) return
    addTasks.mutate(
      { id, data: { tasks: validPayload } },
      {
        onSuccess: () => {
          setNewRows([])
          onClose()
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>จัดการจุดงาน</DialogTitle>
          <DialogDescription>
            เพิ่มจุดงานใหม่ให้กับงานระดมทีมนี้ โดยมอบหมายให้แต่ละทีม
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Existing tasks */}
          {tasksLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
            </div>
          ) : existingTasks && existingTasks.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">จุดงานที่มีอยู่ ({existingTasks.length})</p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {existingTasks.map((task) => (
                  <ExistingTaskRow key={task.id} task={task} />
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">ยังไม่มีจุดงาน</p>
          )}

          {/* New task rows */}
          {newRows.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">จุดงานใหม่ ({newRows.length})</p>
              {newRows.map((row, i) => (
                <NewTaskRowCard
                  key={i}
                  index={i}
                  row={row}
                  teams={teams}
                  onChange={handleChangeRow}
                  onRemove={handleRemoveRow}
                />
              ))}
            </div>
          )}

          {/* Add row button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleAddRow}
            className="min-h-[44px] w-full border-dashed border-amber-300 text-amber-700 hover:bg-amber-50"
          >
            <Plus className="h-4 w-4" /> เพิ่มจุดงาน
          </Button>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={addTasks.isPending}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="min-h-[44px] bg-amber-600 text-white hover:bg-amber-700"
          >
            {addTasks.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            บันทึกจุดงาน ({validPayload.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
