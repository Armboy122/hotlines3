'use client'

import { useEffect, useMemo, useState, type CSSProperties, type ChangeEvent, type ReactNode } from 'react'
import {
  closestCorners,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Loader2, Plus, Save, Trash2 } from 'lucide-react'
import { useLargeWorkTasks } from '@/hooks/useQueries'
import { useAddLargeWorkTasks } from '@/hooks/mutations/useLargeWorkMutations'
import {
  UNASSIGNED_LANE_ID,
  applyPlanningBoardDraftDrop,
  applyPlanningBoardTeamDrop,
  buildPlanningBoardLanes,
  createEmptyPlanningBoardCard,
  serializePlanningBoardDrafts,
  validatePlanningBoardDrafts,
  type PlanningBoardDraftCard,
  type PlanningBoardLane,
  type PlanningBoardLaneId,
} from '@/features/large-work/planning-board-helpers'
import type { LargeWorkResponse, LargeWorkTaskResponse } from '@/types/large-work'
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

const NUMBER_FIELDS = new Set<keyof PlanningBoardDraftCard>([
  'latitude',
  'longitude',
  'pointCount',
  'treeCount',
  'itemCount',
])

const CARD_DND_PREFIX = 'draft-card:'
const LANE_DND_PREFIX = 'draft-lane:'
const TEAM_DND_PREFIX = 'draft-team:'

function cardDndId(clientId: string): string {
  return `${CARD_DND_PREFIX}${clientId}`
}

function laneDndId(laneId: PlanningBoardLane['id']): string {
  return `${LANE_DND_PREFIX}${laneId}`
}

function teamDndId(teamId: number): string {
  return `${TEAM_DND_PREFIX}${teamId}`
}

function parseTeamDndId(id: string): number {
  return Number(id.slice(TEAM_DND_PREFIX.length))
}

function parseLaneDndId(id: string): PlanningBoardLaneId {
  const raw = id.slice(LANE_DND_PREFIX.length)
  return raw === UNASSIGNED_LANE_ID ? UNASSIGNED_LANE_ID : Number(raw)
}

function parseCardDndId(id: string): string {
  return id.slice(CARD_DND_PREFIX.length)
}

function laneIdForCard(cards: PlanningBoardDraftCard[], clientId: string): PlanningBoardLaneId {
  const card = cards.find((item) => item.clientId === clientId)
  return card?.assignedTeamId ?? UNASSIGNED_LANE_ID
}

interface Props {
  item: LargeWorkResponse
  open: boolean
  onClose: () => void
}

function taskStatusClass(status: string): string {
  switch (status) {
    case 'done': return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    case 'in_progress': return 'border-amber-200 bg-amber-50 text-amber-700'
    case 'blocked': return 'border-red-200 bg-red-50 text-red-600'
    case 'cancelled': return 'border-gray-200 bg-gray-100 text-gray-400'
    default: return 'border-gray-200 bg-gray-50 text-gray-600'
  }
}

function makeClientId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function existingTasksForLane(tasks: LargeWorkTaskResponse[], laneId: PlanningBoardLane['id']): LargeWorkTaskResponse[] {
  if (laneId === UNASSIGNED_LANE_ID) return []
  return tasks.filter((task) => task.assignedTeamId === laneId)
}

function ExistingTaskCard({ task }: { task: LargeWorkTaskResponse }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-800">
            {task.sequenceNo != null ? `#${task.sequenceNo} ` : ''}{task.pointLabel ?? 'ไม่ระบุชื่อจุด'}
          </p>
          {task.locationText && <p className="mt-0.5 truncate text-xs text-gray-500">{task.locationText}</p>}
        </div>
        <span className={cn('shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold', taskStatusClass(task.status))}>
          {TASK_STATUS_LABELS[task.status] ?? task.status}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-gray-500">
        {task.workType && <span>{task.workType}</span>}
        {task.pointCount != null && <span>จุด: {task.pointCount}</span>}
        {task.treeCount != null && <span>ต้น: {task.treeCount}</span>}
        {task.itemCount != null && <span>รายการ: {task.itemCount}</span>}
      </div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="space-y-1 text-xs font-medium text-gray-600">
      <span>{label}{required && <span className="text-red-500"> *</span>}</span>
      {children}
    </label>
  )
}

function parseDraftFieldValue(field: keyof PlanningBoardDraftCard, value: string): PlanningBoardDraftCard[keyof PlanningBoardDraftCard] {
  if (field === 'assignedTeamId') return value === '' ? null : Number(value)
  if (NUMBER_FIELDS.has(field)) return value === '' ? null : Number(value)
  return value
}

function DraftCardForm({
  card,
  teams,
  errors,
  dragHandle,
  isDragging = false,
  onChange,
  onRemove,
}: {
  card: PlanningBoardDraftCard
  teams: LargeWorkResponse['teams']
  errors?: string[]
  dragHandle?: ReactNode
  isDragging?: boolean
  onChange: (clientId: string, field: keyof PlanningBoardDraftCard, value: string) => void
  onRemove: (clientId: string) => void
}) {
  const set = (field: keyof PlanningBoardDraftCard) => (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => onChange(card.clientId, field, event.target.value)

  return (
    <div className={cn(
      'space-y-3 rounded-2xl border border-amber-200 bg-amber-50/50 p-3 sm:p-4',
      isDragging && 'opacity-60 shadow-lg ring-2 ring-amber-300',
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          {dragHandle}
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-800">การ์ดงานใหม่</p>
            <p className="text-xs text-gray-500">กรอกข้อมูลให้ครบก่อนบันทึกเข้าระบบ</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onRemove(card.clientId)}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600"
          aria-label="ลบการ์ดงานนี้"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {errors && errors.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {errors.join(' · ')}
        </div>
      )}

      <Field label="ทีมที่มอบหมาย" required>
        <select
          value={card.assignedTeamId ?? ''}
          onChange={set('assignedTeamId')}
          className="h-11 w-full rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-amber-500"
        >
          <option value="">งานที่ยังไม่มอบหมาย</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="ชื่อจุด/ป้ายจุด" required>
          <Input value={card.pointLabel} onChange={set('pointLabel')} placeholder="เช่น P-001" className="h-11" />
        </Field>
        <Field label="สถานที่/ตำแหน่ง">
          <Input value={card.locationText} onChange={set('locationText')} placeholder="สถานี / ฟีดเดอร์" className="h-11" />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="ประเภทงาน" required>
          <Input value={card.workType} onChange={set('workType')} placeholder="เช่น tree_trim, line_check" className="h-11" />
        </Field>
        <Field label="รายละเอียดงาน" required>
          <Input value={card.workDetail} onChange={set('workDetail')} placeholder="รายละเอียดงาน" className="h-11" />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="ละติจูด">
          <Input type="number" value={card.latitude ?? ''} onChange={set('latitude')} placeholder="13.7563" className="h-11" step="any" />
        </Field>
        <Field label="ลองจิจูด">
          <Input type="number" value={card.longitude ?? ''} onChange={set('longitude')} placeholder="100.5018" className="h-11" step="any" />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field label="จำนวนจุด">
          <Input type="number" value={card.pointCount ?? ''} onChange={set('pointCount')} min="0" className="h-11" />
        </Field>
        <Field label="จำนวนต้น">
          <Input type="number" value={card.treeCount ?? ''} onChange={set('treeCount')} min="0" className="h-11" />
        </Field>
        <Field label="จำนวนรายการ">
          <Input type="number" value={card.itemCount ?? ''} onChange={set('itemCount')} min="0" className="h-11" />
        </Field>
      </div>

      <Field label="หมายเหตุ">
        <Textarea value={card.notes} onChange={set('notes')} placeholder="รายละเอียดหรือข้อกำหนดพิเศษ" rows={2} />
      </Field>
    </div>
  )
}

function TeamDragBadge({ team }: { team: LargeWorkResponse['teams'][number] }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ id: teamDndId(team.id) })
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
  }

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={style}
      className={cn(
        'mt-2 inline-flex min-h-[44px] touch-none cursor-grab items-center gap-1 rounded-full border border-amber-200 bg-white px-3 py-1 text-[11px] font-semibold text-amber-700 shadow-sm transition hover:bg-amber-50 active:cursor-grabbing',
        isDragging && 'opacity-60 ring-2 ring-amber-300',
      )}
      aria-label={`ลากทีม ${team.name} ไปวางบนการ์ดงาน`}
      title="ลากทีมนี้ไปวางบนการ์ดงานเพื่อมอบหมาย"
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-3.5 w-3.5" />
      ลากทีมนี้ใส่การ์ด
    </button>
  )
}

function DraftLaneDropZone({
  lane,
  children,
}: {
  lane: PlanningBoardLane
  children: ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id: laneDndId(lane.id) })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex-1 space-y-3 p-3 transition-colors',
        isOver && 'bg-amber-100/60',
      )}
    >
      {children}
    </div>
  )
}

function SortableDraftCard({
  card,
  teams,
  errors,
  onChange,
  onRemove,
}: {
  card: PlanningBoardDraftCard
  teams: LargeWorkResponse['teams']
  errors?: string[]
  onChange: (clientId: string, field: keyof PlanningBoardDraftCard, value: string) => void
  onRemove: (clientId: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cardDndId(card.clientId) })
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <DraftCardForm
        card={card}
        teams={teams}
        errors={errors}
        isDragging={isDragging}
        onChange={onChange}
        onRemove={onRemove}
        dragHandle={(
          <button
            type="button"
            className="flex min-h-[44px] min-w-[44px] cursor-grab touch-none items-center justify-center rounded-xl border border-amber-200 bg-white text-amber-600 active:cursor-grabbing"
            aria-label="ลากเพื่อย้ายการ์ดงาน"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}
      />
    </div>
  )
}

export function LargeWorkPlanningBoard({ item, open, onClose }: Props) {
  const { data: existingTasks, isLoading: tasksLoading } = useLargeWorkTasks(open ? item.id : undefined)
  const addTasks = useAddLargeWorkTasks()
  const [draftCards, setDraftCards] = useState<PlanningBoardDraftCard[]>([])
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})

  const participatingTeams = item.teams
  const lanes = useMemo(
    () => buildPlanningBoardLanes(participatingTeams, draftCards),
    [participatingTeams, draftCards],
  )
  const draftValidation = validatePlanningBoardDrafts(draftCards)
  const canSubmit = draftCards.length > 0 && !addTasks.isPending
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  useEffect(() => {
    if (!open) {
      setDraftCards([])
      setValidationErrors({})
    }
  }, [open])

  const handleClose = () => {
    setDraftCards([])
    setValidationErrors({})
    onClose()
  }

  const handleAddCard = (assignedTeamId: number | null) => {
    setDraftCards((prev) => [
      ...prev,
      createEmptyPlanningBoardCard(makeClientId(), { assignedTeamId }),
    ])
  }

  const handleChangeCard = (clientId: string, field: keyof PlanningBoardDraftCard, value: string) => {
    setDraftCards((prev) => prev.map((card) => (
      card.clientId === clientId
        ? { ...card, [field]: parseDraftFieldValue(field, value) }
        : card
    )))
    setValidationErrors((prev) => {
      if (!prev[clientId]) return prev
      const next = { ...prev }
      delete next[clientId]
      return next
    })
  }

  const handleRemoveCard = (clientId: string) => {
    setDraftCards((prev) => prev.filter((card) => card.clientId !== clientId))
    setValidationErrors((prev) => {
      const next = { ...prev }
      delete next[clientId]
      return next
    })
  }

  const handleDraftDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return

    const activeId = String(active.id)
    const overId = String(over.id)

    if (activeId.startsWith(TEAM_DND_PREFIX) && overId.startsWith(CARD_DND_PREFIX)) {
      const activeTeamId = parseTeamDndId(activeId)
      const overClientId = parseCardDndId(overId)

      setDraftCards((prev) => applyPlanningBoardTeamDrop(prev, { activeTeamId, overClientId }))
      setValidationErrors((prev) => {
        if (!prev[overClientId]) return prev
        const next = { ...prev }
        delete next[overClientId]
        return next
      })
      return
    }

    if (!activeId.startsWith(CARD_DND_PREFIX)) return
    if (!overId.startsWith(CARD_DND_PREFIX) && !overId.startsWith(LANE_DND_PREFIX)) return

    const activeClientId = parseCardDndId(activeId)
    const overIsCard = overId.startsWith(CARD_DND_PREFIX)
    const overClientId = overIsCard ? parseCardDndId(overId) : null

    setDraftCards((prev) => {
      const overLaneId = overIsCard
        ? laneIdForCard(prev, overClientId!)
        : parseLaneDndId(overId)

      return applyPlanningBoardDraftDrop(prev, {
        activeClientId,
        overLaneId,
        overClientId,
      })
    })
    setValidationErrors((prev) => {
      if (!prev[activeClientId]) return prev
      const next = { ...prev }
      delete next[activeClientId]
      return next
    })
  }

  const handleSubmit = () => {
    const validation = validatePlanningBoardDrafts(draftCards)
    if (!validation.valid) {
      setValidationErrors(validation.errors)
      return
    }

    addTasks.mutate(
      { id: item.id, data: serializePlanningBoardDrafts(draftCards) },
      {
        onSuccess: () => {
          setDraftCards([])
          setValidationErrors({})
          onClose()
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-[96vw] lg:max-w-6xl">
        <DialogHeader className="border-b border-gray-100 px-4 py-4 sm:px-6">
          <DialogTitle>กระดานวางแผนงานระดมทีม</DialogTitle>
          <DialogDescription>
            {item.title} · แยกเลนตามทีมที่ร่วมงาน และเพิ่มการ์ดงานแบบฟอร์มก่อนบันทึก
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 rounded-2xl border border-amber-100 bg-amber-50/50 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-gray-800">ลาก/วางการ์ดหรือทีมเพื่อจัดงาน</p>
              <p className="text-xs text-gray-500">ลากการ์ดเพื่อย้ายเลน/เรียงลำดับ หรือลากป้ายทีมไปวางบนการ์ดเพื่อมอบหมาย ฟอร์มเลือกทีมยังใช้งานได้ตามเดิม</p>
            </div>
            <Button
              type="button"
              onClick={() => handleAddCard(null)}
              className="min-h-[44px] bg-amber-600 text-white hover:bg-amber-700"
            >
              <Plus className="h-4 w-4" /> สร้างการ์ดงาน
            </Button>
          </div>

          {Object.keys(validationErrors).length > 0 && !draftValidation.valid && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              โปรดกรอกข้อมูลการ์ดงานให้ครบก่อนบันทึก ระบบจะล้างข้อความเตือนของการ์ดเมื่อแก้ไขข้อมูล
            </div>
          )}

          {tasksLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragEnd={handleDraftDragEnd}
            >
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                {lanes.map((lane) => {
                  const laneExistingTasks = existingTasksForLane(existingTasks ?? [], lane.id)
                  return (
                    <section key={lane.id} className="flex min-h-[280px] flex-col rounded-2xl border border-gray-200 bg-gray-50/70">
                      <div className="border-b border-gray-200 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-bold text-gray-900">{lane.title}</h3>
                            <p className="text-xs text-gray-500">
                              มีอยู่ {laneExistingTasks.length} งาน · ร่าง {lane.cards.length} งาน
                            </p>
                          </div>
                          {typeof lane.id === 'number' && (
                            <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
                              <TeamDragBadge team={participatingTeams.find((team) => team.id === lane.id)!} />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddCard(Number(lane.id))}
                                className="min-h-[44px] shrink-0 border-dashed border-amber-300 text-amber-700 hover:bg-amber-50"
                              >
                                <Plus className="h-4 w-4" /> เพิ่มงานทีมนี้
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      <SortableContext items={lane.cards.map((card) => cardDndId(card.clientId))} strategy={verticalListSortingStrategy}>
                        <DraftLaneDropZone lane={lane}>
                          {laneExistingTasks.map((task) => (
                            <ExistingTaskCard key={task.id} task={task} />
                          ))}
                          {lane.cards.map((card) => (
                            <SortableDraftCard
                              key={card.clientId}
                              card={card}
                              teams={participatingTeams}
                              errors={validationErrors[card.clientId]}
                              onChange={handleChangeCard}
                              onRemove={handleRemoveCard}
                            />
                          ))}
                          {laneExistingTasks.length === 0 && lane.cards.length === 0 && (
                            <div className="rounded-xl border border-dashed border-gray-200 bg-white/80 p-4 text-center text-xs text-gray-500">
                              ยังไม่มีงานในเลนนี้
                            </div>
                          )}
                        </DraftLaneDropZone>
                      </SortableContext>
                    </section>
                  )
                })}
              </div>
            </DndContext>
          )}
        </div>

        <DialogFooter className="gap-2 border-t border-gray-100 px-4 py-4 sm:px-6">
          <Button variant="outline" onClick={handleClose} disabled={addTasks.isPending}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="min-h-[44px] bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {addTasks.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            บันทึกการ์ดงาน ({draftCards.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
