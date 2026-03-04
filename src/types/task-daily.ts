// ============================================================
// Task (รายงานงานประจำวัน)
// ============================================================

// Nested types ที่อยู่ใน TaskResponse
export interface TeamNested {
  id: number
  name: string
}

export interface JobTypeNested {
  id: number
  name: string
}

export interface JobDetailNested {
  id: number
  name: string
}

export interface StationNestedSimple {
  name: string
  operationCenter?: {
    id: number
    name: string
  }
}

export interface FeederNestedForTask {
  id: number
  code: string
  station?: StationNestedSimple
}

// Task Response หลัก
export interface TaskResponse {
  id: number
  workDate: string           // "YYYY-MM-DD"
  teamId: number
  jobTypeId: number
  jobDetailId: number
  feederId: number | null
  numPole: string | null
  deviceCode: string | null
  detail: string | null
  urlsBefore: string[]
  urlsAfter: string[]
  latitude: number | null
  longitude: number | null
  team?: TeamNested
  jobType?: JobTypeNested
  jobDetail?: JobDetailNested
  feeder?: FeederNestedForTask
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface CreateTaskRequest {
  workDate: string           // required, "YYYY-MM-DD"
  teamId: number             // required
  jobTypeId: number          // required
  jobDetailId: number        // required
  feederId?: number | null
  numPole?: string | null
  deviceCode?: string | null
  detail?: string | null
  urlsBefore?: string[]
  urlsAfter?: string[]
  latitude?: number | null
  longitude?: number | null
}

export interface UpdateTaskRequest {
  workDate?: string
  teamId?: number
  jobTypeId?: number
  jobDetailId?: number
  feederId?: number | null
  numPole?: string | null
  deviceCode?: string | null
  detail?: string | null
  urlsBefore?: string[]
  urlsAfter?: string[]
  latitude?: number | null
  longitude?: number | null
}

// Response จาก GET /v1/tasks/by-team และ /v1/tasks/by-filter
// key คือชื่อทีม
export type TasksByTeamResponse = Record<string, {
  team: TeamNested
  tasks: TaskResponse[]
}>

// Query params สำหรับ GET /v1/tasks
export interface TaskListParams {
  page?: number
  limit?: number
  workDate?: string
  teamId?: number
  jobTypeId?: number
  feederId?: number
}

// Query params สำหรับ GET /v1/tasks/by-filter
export interface TaskByFilterParams {
  year: string               // required
  month: string              // required
  teamId?: number
}

// Aliases สำหรับ backward compatibility
export type CreateTaskDailyData = CreateTaskRequest
export type UpdateTaskDailyData = UpdateTaskRequest & { id: number }
export type TaskDailyFiltered = TaskResponse
export type TeamTaskGroups = TasksByTeamResponse
