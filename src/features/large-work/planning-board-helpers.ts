import type { LargeWorkAddTasksRequest, LargeWorkTaskRequest, LargeWorkTaskResponse } from '@/types/large-work'

export const UNASSIGNED_LANE_ID = 'unassigned' as const

export type PlanningBoardLaneId = number | typeof UNASSIGNED_LANE_ID | null

export interface PlanningBoardDraftCard {
  clientId: string
  assignedTeamId: number | null
  pointLabel: string
  workType: string
  workDetail: string
  locationText: string
  latitude: number | null
  longitude: number | null
  pointCount: number | null
  treeCount: number | null
  itemCount: number | null
  notes: string
  metadata: Record<string, unknown>
}

export interface PlanningBoardDraftValidationResult {
  valid: boolean
  errors: Record<string, string[]>
}

export interface PlanningBoardDraftDrop {
  activeClientId: string
  overLaneId: PlanningBoardLaneId
  overClientId?: string | null
}

export interface PlanningBoardTeamDrop {
  activeTeamId: number
  overClientId: string
}

export interface PlanningBoardTeamRef {
  id: number
  name: string
}

export interface PlanningBoardLane {
  id: Exclude<PlanningBoardLaneId, null>
  title: string
  cards: PlanningBoardDraftCard[]
}

export function createEmptyPlanningBoardCard(
  clientId: string,
  overrides: Partial<Omit<PlanningBoardDraftCard, 'clientId'>> = {},
): PlanningBoardDraftCard {
  return {
    clientId,
    assignedTeamId: null,
    pointLabel: '',
    workType: '',
    workDetail: '',
    locationText: '',
    latitude: null,
    longitude: null,
    pointCount: null,
    treeCount: null,
    itemCount: null,
    notes: '',
    metadata: {},
    ...overrides,
  }
}

export function planningBoardDraftsFromTasks(tasks: LargeWorkTaskResponse[]): PlanningBoardDraftCard[] {
  return [...tasks]
    .sort((a, b) => {
      if (a.assignedTeamId !== b.assignedTeamId) return a.assignedTeamId - b.assignedTeamId
      return (a.sequence ?? Number.MAX_SAFE_INTEGER) - (b.sequence ?? Number.MAX_SAFE_INTEGER)
    })
    .map((task) => createEmptyPlanningBoardCard(`task-${task.id}`, {
      assignedTeamId: task.assignedTeamId,
      pointLabel: task.pointLabel ?? '',
      workType: task.workType ?? '',
      workDetail: task.workDetail ?? '',
      latitude: task.latitude,
      longitude: task.longitude,
      pointCount: task.pointCount,
      treeCount: task.treeCount,
      itemCount: task.itemCount,
      notes: task.notes ?? '',
      metadata: task.metadata ? { ...task.metadata } : {},
    }))
}

export function assignDraftCardToTeam(
  card: PlanningBoardDraftCard,
  laneId: PlanningBoardLaneId,
): PlanningBoardDraftCard {
  return {
    ...card,
    assignedTeamId: laneId === null || laneId === UNASSIGNED_LANE_ID ? null : laneId,
  }
}

export function buildPlanningBoardLanes(
  teams: PlanningBoardTeamRef[],
  cards: PlanningBoardDraftCard[],
): PlanningBoardLane[] {
  const teamLanes = teams.map((team) => ({
    id: team.id,
    title: team.name,
    cards: cards.filter((card) => card.assignedTeamId === team.id),
  }))

  return [
    {
      id: UNASSIGNED_LANE_ID,
      title: 'งานที่ยังไม่มอบหมาย',
      cards: cards.filter((card) => card.assignedTeamId === null),
    },
    ...teamLanes,
  ]
}

export function moveDraftCardToLane(
  cards: PlanningBoardDraftCard[],
  clientId: string,
  targetLaneId: PlanningBoardLaneId,
  targetIndex: number,
): PlanningBoardDraftCard[] {
  if (targetIndex < 0) throw new Error('target index must not be negative')

  const sourceCard = cards.find((card) => card.clientId === clientId)
  if (!sourceCard) throw new Error(`missing draft card: ${clientId}`)

  const nextCards = cards
    .filter((card) => card.clientId !== clientId)
    .map((card) => ({ ...card }))
  const movedCard = assignDraftCardToTeam(sourceCard, targetLaneId)
  const insertionIndex = insertionIndexForLane(nextCards, movedCard.assignedTeamId, targetIndex)

  if (insertionIndex === null) throw new Error('target index is outside the lane')

  return [
    ...nextCards.slice(0, insertionIndex),
    movedCard,
    ...nextCards.slice(insertionIndex),
  ]
}

export function reorderDraftCardsWithinLane(
  cards: PlanningBoardDraftCard[],
  laneId: PlanningBoardLaneId,
  sourceIndex: number,
  targetIndex: number,
): PlanningBoardDraftCard[] {
  if (sourceIndex < 0 || targetIndex < 0) throw new Error('source index and target index must not be negative')

  const assignedTeamId = laneToAssignedTeamId(laneId)
  const laneCards = cards.filter((card) => card.assignedTeamId === assignedTeamId)

  if (sourceIndex >= laneCards.length) throw new Error('source index is outside the lane')
  if (targetIndex >= laneCards.length) throw new Error('target index is outside the lane')
  if (sourceIndex === targetIndex) return cards.map((card) => ({ ...card }))

  const reorderedLane = [...laneCards]
  const [movedCard] = reorderedLane.splice(sourceIndex, 1)
  reorderedLane.splice(targetIndex, 0, movedCard)

  const laneQueue = [...reorderedLane]
  return cards.map((card) => (card.assignedTeamId === assignedTeamId ? laneQueue.shift()! : { ...card }))
}

export function applyPlanningBoardDraftDrop(
  cards: PlanningBoardDraftCard[],
  drop: PlanningBoardDraftDrop,
): PlanningBoardDraftCard[] {
  const activeCard = cards.find((card) => card.clientId === drop.activeClientId)
  if (!activeCard) throw new Error(`missing draft card: ${drop.activeClientId}`)

  if (drop.overClientId === drop.activeClientId) return cards.map((card) => ({ ...card }))

  const targetAssignedTeamId = laneToAssignedTeamId(drop.overLaneId)
  const targetIndex = drop.overClientId
    ? cards.filter((card) => card.assignedTeamId === targetAssignedTeamId).findIndex((card) => card.clientId === drop.overClientId)
    : cards.filter((card) => card.assignedTeamId === targetAssignedTeamId).length

  if (targetIndex < 0) throw new Error(`missing target draft card: ${drop.overClientId}`)

  return moveDraftCardToLane(cards, drop.activeClientId, drop.overLaneId, targetIndex)
}

export function applyPlanningBoardTeamDrop(
  cards: PlanningBoardDraftCard[],
  drop: PlanningBoardTeamDrop,
): PlanningBoardDraftCard[] {
  const targetCard = cards.find((card) => card.clientId === drop.overClientId)
  if (!targetCard) throw new Error(`missing target draft card: ${drop.overClientId}`)

  return cards.map((card) => (
    card.clientId === drop.overClientId
      ? assignDraftCardToTeam(card, drop.activeTeamId)
      : { ...card }
  ))
}

export function validatePlanningBoardDrafts(cards: PlanningBoardDraftCard[]): PlanningBoardDraftValidationResult {
  const errors: Record<string, string[]> = {}

  for (const card of cards) {
    const cardErrors: string[] = []

    if (card.assignedTeamId === null) cardErrors.push('เลือกทีมรับผิดชอบ')
    if (card.pointLabel.trim() === '') cardErrors.push('ระบุชื่อจุดงาน')
    if (card.workType.trim() === '') cardErrors.push('ระบุประเภทงาน')
    if (card.workDetail.trim() === '') cardErrors.push('ระบุรายละเอียดงาน')
    if (isNegative(card.pointCount)) cardErrors.push('จำนวนจุดต้องไม่ติดลบ')
    if (isNegative(card.treeCount)) cardErrors.push('จำนวนต้นไม้ต้องไม่ติดลบ')
    if (isNegative(card.itemCount)) cardErrors.push('จำนวนรายการต้องไม่ติดลบ')

    if (cardErrors.length > 0) errors[card.clientId] = cardErrors
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

export function serializePlanningBoardDrafts(cards: PlanningBoardDraftCard[]): LargeWorkAddTasksRequest {
  const validation = validatePlanningBoardDrafts(cards)
  if (!validation.valid) throw new Error('Cannot serialize invalid planning-board drafts')

  const laneSequences = new Map<number, number>()
  const tasks: LargeWorkTaskRequest[] = cards.map((card) => {
    const assignedTeamId = card.assignedTeamId!
    const sequence = (laneSequences.get(assignedTeamId) ?? 0) + 1
    laneSequences.set(assignedTeamId, sequence)

    return {
      assignedTeamId,
      sequence,
      pointLabel: nullableString(card.pointLabel),
      latitude: card.latitude,
      longitude: card.longitude,
      workType: nullableString(card.workType),
      workDetail: nullableString(card.workDetail),
      pointCount: card.pointCount,
      treeCount: card.treeCount,
      itemCount: card.itemCount,
      notes: nullableString(card.notes),
      metadata: Object.keys(card.metadata).length > 0 ? { ...card.metadata } : null,
    }
  })

  return { tasks }
}

function laneToAssignedTeamId(laneId: PlanningBoardLaneId): number | null {
  return laneId === null || laneId === UNASSIGNED_LANE_ID ? null : laneId
}

function insertionIndexForLane(
  cards: PlanningBoardDraftCard[],
  assignedTeamId: number | null,
  targetIndex: number,
): number | null {
  const laneIndices = cards.reduce<number[]>((indices, card, index) => {
    if (card.assignedTeamId === assignedTeamId) indices.push(index)
    return indices
  }, [])

  if (targetIndex > laneIndices.length) return null
  if (laneIndices.length === 0) return targetIndex === 0 ? cards.length : null
  if (targetIndex === laneIndices.length) return laneIndices[laneIndices.length - 1] + 1
  return laneIndices[targetIndex]
}

function nullableString(value: string): string | null {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function isNegative(value: number | null): boolean {
  return value !== null && value < 0
}
