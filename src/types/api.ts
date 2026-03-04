// Types สำหรับ API responses และ data structures

// ============================================================
// Standard Response Wrapper
// ============================================================

export interface StandardResponse<T> {
  success: boolean
  data?: T
  meta?: Meta
  error?: ErrorInfo
}

export interface Meta {
  page: number
  limit: number
  total: number
}

export interface ErrorInfo {
  code: string
  message: string
  details?: unknown
}

// ============================================================
// Team
// ============================================================

export interface TeamResponse {
  id: number
  name: string
  _count?: { tasks: number }
}

export interface Team {
  id: number
  name: string
}

export interface CreateTeamRequest {
  name: string
}

export interface UpdateTeamRequest {
  name: string
}

// ============================================================
// Job Type (ประเภทงาน)
// ============================================================

export interface JobType {
  id: number
  name: string
  _count?: { tasks: number }
}

export interface CreateJobTypeRequest {
  name: string
}

export interface UpdateJobTypeRequest {
  name: string
}

// ============================================================
// Job Detail (รายละเอียดงาน)
// ============================================================

export interface JobDetail {
  id: number
  name: string
  jobTypeId: number | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  _count?: { tasks: number }
}

export interface CreateJobDetailRequest {
  name: string
  jobTypeId?: number | null
}

export interface UpdateJobDetailRequest {
  name?: string
  jobTypeId?: number | null
}

// ============================================================
// Operation Center (ศูนย์ปฏิบัติการ)
// ============================================================

export interface OperationCenterNested {
  id: number
  name: string
}

export interface OperationCenter {
  id: number
  name: string
}

export interface CreateOperationCenterRequest {
  name: string
}

export interface UpdateOperationCenterRequest {
  name: string
}

// ============================================================
// PEA (การไฟฟ้า)
// ============================================================

export interface Pea {
  id: number
  shortname: string
  fullname: string
  operationId: number
  operationCenter?: OperationCenterNested
}

export interface CreatePEARequest {
  shortname: string
  fullname: string
  operationId: number
}

export type BulkCreatePEARequest = CreatePEARequest[]

export interface UpdatePEARequest {
  shortname?: string
  fullname?: string
  operationId?: number
}

// ============================================================
// Station (สถานี)
// ============================================================

export interface StationNested {
  id: number
  name: string
  codeName: string
  operationCenter?: OperationCenterNested
}

export interface Station {
  id: number
  name: string
  codeName: string
  operationId: number
  operationCenter?: OperationCenterNested
}

export interface CreateStationRequest {
  name: string
  codeName: string
  operationId: number
}

export interface UpdateStationRequest {
  name?: string
  codeName?: string
  operationId?: number
}

// ============================================================
// Feeder (ฟีดเดอร์)
// ============================================================

export interface Feeder {
  id: number
  code: string
  stationId: number
  station?: StationNested
  _count?: { tasks: number }
}

export interface CreateFeederRequest {
  code: string
  stationId: number
}

export interface UpdateFeederRequest {
  code?: string
  stationId?: number
}

// ============================================================
// Dashboard
// ============================================================

export interface DashboardSummary {
  totalTasks: number
  totalJobTypes: number
  totalFeeders: number
  topTeam: {
    id: number
    name: string
    count: number
  } | null
}

export interface TopJobDetail {
  id: number
  name: string
  count: number
  jobTypeName: string
}

export interface TopFeeder {
  id: number
  code: string
  stationName: string
  count: number
}

export interface FeederJobMatrix {
  feederId: number
  feederCode: string
  stationName: string
  totalCount: number
  jobDetails: {
    id: number
    name: string
    count: number
    jobTypeName: string
  }[]
}

export interface ChartItem {
  name: string
  value: number
}

export interface DateChartItem {
  date: string
  count: number
}

export interface DashboardStatsResponse {
  summary: {
    totalTasks: number
    activeTeams: number
    topJobType: string
    topFeeder: string
  }
  charts: {
    tasksByFeeder: ChartItem[]
    tasksByJobType: ChartItem[]
    tasksByTeam: ChartItem[]
    tasksByDate: DateChartItem[]
  }
}

export interface DashboardFilterParams {
  year?: string
  month?: string
  teamId?: string
  jobTypeId?: string
}

export interface DashboardStatsParams {
  startDate?: string
  endDate?: string
  teamId?: string
  feederId?: string
}

export interface FeederMatrixParams {
  feederId: number
  year?: string
  month?: string
}

// ============================================================
// Upload
// ============================================================

export interface UploadRequest {
  fileName: string
  fileType: 'image/jpeg' | 'image/jpg' | 'image/png' | 'image/webp' | 'image/gif'
}

export interface PresignedURLResponse {
  uploadUrl: string
  fileUrl: string
  fileKey: string
}

// ============================================================
// Form data types (ใช้ใน frontend forms)
// ============================================================

export interface JobDetailFormData {
  id?: number
  name: string
  jobTypeId?: number | null
}

export interface FeederFormData {
  id?: number
  code: string
  stationId: number
}

export interface PeaFormData {
  id?: number
  shortname: string
  fullname: string
  operationId: number
}

export interface StationFormData {
  id?: number
  name: string
  codeName: string
  operationId: number
}

export interface JobTypeFormData {
  id?: number
  name: string
}

export interface OperationCenterFormData {
  id?: number
  name: string
}
