'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jobDetailService } from '@/lib/services/job-detail.service'
import { feederService } from '@/lib/services/feeder.service'
import { peaService } from '@/lib/services/pea.service'
import { stationService } from '@/lib/services/station.service'
import { jobTypeService } from '@/lib/services/job-type.service'
import { operationCenterService } from '@/lib/services/operation-center.service'
import { teamService } from '@/lib/services/team.service'
import { userService, type UserListParams, type UpdateUserData, type ResetUserPasswordData } from '@/lib/services/user.service'
import { taskDailyService } from '@/lib/services/task-daily.service'
import { dashboardService } from '@/lib/services/dashboard.service'
import { monthlyPlanService } from '@/lib/services/monthly-plan.service'
import { teamPlanService } from '@/lib/services/team-plan.service'
import { planningCalendarService } from '@/lib/services/planning-calendar.service'
import { contactDirectoryService } from '@/lib/services/contact-directory.service'
import { largeWorkService } from '@/lib/services/large-work.service'
import { dailyReportDraftService } from '@/lib/services/daily-report-draft.service'
import type { CreateTaskDailyData, UpdateTaskDailyData, TeamTaskGroups, TaskDailyFiltered } from '@/types/task-daily'
import type { CreateUserRequest, User } from '@/types/auth'
import type { MonthlyPlanPeriod, PlanFile, SubmissionStatusResponse, MonthlyPlanSettings, MonthlyPlanYearOverview } from '@/types/monthly-plan'
import type { DashboardSummary, FeederJobMatrix, TopFeeder, TopJobDetail } from '@/lib/services/dashboard.service'
import type { JobDetailWithCount, JobTypeWithCount, FeederWithStation, Team } from '@/types/query-types'
import type { Station, OperationCenter, Pea } from '@/types/api'
import type { TeamPlanResponse, TeamPlanListParams } from '@/types/team-plan'
import type { PlanningCalendarResponse, PlanningCalendarParams, PlanningCalendarItem } from '@/types/planning-calendar'
import type { ContactDirectoryEntry, ContactDirectoryListParams } from '@/types/contact-directory'
import type { LargeWorkResponse, LargeWorkListParams, LargeWorkOverviewResponse, LargeWorkTaskResponse } from '@/types/large-work'
import type { DailyReportDraftFromPlanResponse, DailyReportDraftParams, DailyReportDraftSourcesResponse, DailyReportDraftSourcesParams } from '@/types/daily-report-draft'

// Query Keys สำหรับการ cache
export const queryKeys = {
  jobDetails: ['jobDetails'] as const,
  feeders: ['feeders'] as const,
  peas: ['peas'] as const,
  stations: ['stations'] as const,
  jobTypes: ['jobTypes'] as const,
  operationCenters: ['operationCenters'] as const,
  teams: ['teams'] as const,
  users: (params?: UserListParams) => ['users', params] as const,

  // Task Daily Analytics
  topJobDetails: (year?: number, limit?: number, month?: number, teamId?: string, jobTypeId?: string) => ['topJobDetails', year, limit, month, teamId, jobTypeId] as const,
  topFeeders: (year?: number, limit?: number, month?: number, teamId?: string, jobTypeId?: string) => ['topFeeders', year, limit, month, teamId, jobTypeId] as const,
  feederJobMatrix: (feederId?: string, year?: number, month?: number, teamId?: string, jobTypeId?: string) => ['feederJobMatrix', feederId, year, month, teamId, jobTypeId] as const,
  dashboardSummary: (year?: number, month?: number, teamId?: string, jobTypeId?: string) => ['dashboardSummary', year, month, teamId, jobTypeId] as const,
  // Task Dailies
  taskDailies: (params?: { year: string; month: string; teamId?: string }) => ['taskDailies', params] as const,
  adminTaskDailies: (params?: { workDate?: string; teamId?: string; jobTypeId?: string; feederId?: string }) => ['adminTaskDailies', params] as const,
  // Monthly Plan
  monthlyPlanYearOverview: (year?: number) => ['monthlyPlanYearOverview', year] as const,
  monthlyPlanPeriod: (year?: number, month?: number) => ['monthlyPlanPeriod', year, month] as const,
  monthlyPlanFiles: (year?: number, month?: number, search?: string, teamId?: number) => ['monthlyPlanFiles', year, month, search, teamId] as const,
  monthlyPlanStatus: (year?: number, month?: number) => ['monthlyPlanStatus', year, month] as const,
  monthlyPlanSettings: ['monthlyPlanSettings'] as const,
  // Team Plan
  teamPlans: (params?: TeamPlanListParams) => ['teamPlans', params] as const,
  // Planning Calendar
  planningCalendar: (params?: PlanningCalendarParams) => ['planningCalendar', params] as const,
  // Contact Directory
  contactDirectory: (params?: ContactDirectoryListParams) => ['contactDirectory', params] as const,
  // Large Work
  largeWorks: (params?: LargeWorkListParams) => ['largeWorks', params] as const,
  largeWorkOverview: (id: number) => ['largeWorkOverview', id] as const,
  largeWorkTasks: (id: number) => ['largeWorkTasks', id] as const,
  largeWorkMyTodos: ['largeWorkMyTodos'] as const,
  // Daily Report Draft
  dailyReportDrafts: (params?: DailyReportDraftParams) => ['dailyReportDrafts', params] as const,
  dailyReportDraftSources: (params?: DailyReportDraftSourcesParams) => ['dailyReportDraftSources', params] as const,
}

// Hook สำหรับ Job Details
export function useJobDetails(options?: { initialData?: any }) {
  return useQuery<JobDetailWithCount[]>({
    queryKey: queryKeys.jobDetails,
    queryFn: () => jobDetailService.getAll(),
    ...options,
  })
}

// Hook สำหรับ Feeders
export function useFeeders(options?: { initialData?: any }) {
  return useQuery<FeederWithStation[]>({
    queryKey: queryKeys.feeders,
    queryFn: () => feederService.getAll(),
    ...options,
  })
}

// Hook สำหรับ PEAs
export function usePeas(options?: { initialData?: any }) {
  return useQuery<Pea[]>({
    queryKey: queryKeys.peas,
    queryFn: () => peaService.getAll(),
    ...options,
  })
}

// Hook สำหรับ Stations
export function useStations(options?: { initialData?: any }) {
  return useQuery<Station[]>({
    queryKey: queryKeys.stations,
    queryFn: () => stationService.getAll(),
    ...options,
  })
}

// Hook สำหรับ Job Types
export function useJobTypes(options?: { initialData?: any }) {
  return useQuery<JobTypeWithCount[]>({
    queryKey: queryKeys.jobTypes,
    queryFn: () => jobTypeService.getAll(),
    ...options,
  })
}

// Hook สำหรับ Operation Centers
export function useOperationCenters(options?: { initialData?: any }) {
  return useQuery<OperationCenter[]>({
    queryKey: queryKeys.operationCenters,
    queryFn: () => operationCenterService.getAll(),
    ...options,
  })
}

// Hook สำหรับ Teams
export function useTeams(options?: { initialData?: any }) {
  return useQuery<Team[]>({
    queryKey: queryKeys.teams,
    queryFn: () => teamService.getAll(),
    ...options,
  })
}

// Hook สำหรับ Users (super_admin)
export function useUsers(params: UserListParams = { page: 1, limit: 100 }, options?: { initialData?: User[] }) {
  return useQuery<User[]>({
    queryKey: queryKeys.users(params),
    queryFn: () => userService.getAll(params),
    staleTime: 1 * 60 * 1000,
    ...options,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateUserRequest) => userService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateUserData) => userService.update(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: (data: ResetUserPasswordData) => userService.resetPassword(data),
  })
}

// Hook สำหรับ Top Job Details
export function useTopJobDetails(year?: number, limit = 10, month?: number, teamId?: string, jobTypeId?: string, options?: { initialData?: any }) {
  return useQuery<TopJobDetail[]>({
    queryKey: queryKeys.topJobDetails(year, limit, month, teamId, jobTypeId),
    queryFn: (): Promise<TopJobDetail[]> => dashboardService.getTopJobDetails({ year: year?.toString(), limit, month: month?.toString(), teamId, jobTypeId }),
    staleTime: 2 * 60 * 1000,
    ...options,
  })
}

// Hook สำหรับ Top Feeders
export function useTopFeeders(year?: number, limit = 10, month?: number, teamId?: string, jobTypeId?: string, options?: { initialData?: any }) {
  return useQuery<TopFeeder[]>({
    queryKey: queryKeys.topFeeders(year, limit, month, teamId, jobTypeId),
    queryFn: (): Promise<TopFeeder[]> => dashboardService.getTopFeeders({ year: year?.toString(), limit, month: month?.toString(), teamId, jobTypeId }),
    staleTime: 2 * 60 * 1000,
    ...options,
  })
}

// Hook สำหรับ Feeder Job Matrix
export function useFeederJobMatrix(feederId?: string, year?: number, month?: number, teamId?: string, jobTypeId?: string) {
  return useQuery<FeederJobMatrix | null>({
    queryKey: queryKeys.feederJobMatrix(feederId, year, month, teamId, jobTypeId),
    queryFn: () => {
      if (!feederId) return null
      return dashboardService.getFeederJobMatrix({ feederId: parseInt(feederId), year: year?.toString(), month: month?.toString() })
    },
    enabled: !!feederId,
    staleTime: 2 * 60 * 1000,
  })
}

// Hook สำหรับ Dashboard Summary
export function useDashboardSummary(year?: number, month?: number, teamId?: string, jobTypeId?: string, options?: { initialData?: any }) {
  return useQuery<DashboardSummary>({
    queryKey: queryKeys.dashboardSummary(year, month, teamId, jobTypeId),
    queryFn: () => dashboardService.getSummary({ year: year?.toString(), month: month?.toString(), teamId, jobTypeId }),
    staleTime: 2 * 60 * 1000,
    ...options,
  })
}

// Hook สำหรับ Task Dailies (filtered by year/month/team)
export function useTaskDailies(params?: { year: string; month: string; teamId?: string }) {
  return useQuery<TeamTaskGroups>({
    queryKey: queryKeys.taskDailies(params),
    queryFn: async () => {
      if (!params?.year || !params?.month) return {} as TeamTaskGroups
      const result = await taskDailyService.getByFilter(params)
      return result ?? ({} as TeamTaskGroups)
    },
    enabled: !!params?.year && !!params?.month,
    staleTime: 1 * 60 * 1000,
  })
}

// Hook สำหรับหน้าจัดการระบบ > งานทั้งหมด (flat task list, not dashboard analytics)
export function useAdminTaskDailies(params?: { workDate?: string; teamId?: string; jobTypeId?: string; feederId?: string }) {
  return useQuery<TaskDailyFiltered[]>({
    queryKey: queryKeys.adminTaskDailies(params),
    queryFn: async () => taskDailyService.getAll(params),
    staleTime: 1 * 60 * 1000,
  })
}

// Mutation Hook สำหรับสร้าง Task Daily
export function useCreateTaskDaily() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTaskDailyData) => taskDailyService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['taskDailies'],
        refetchType: 'none'
      })
      queryClient.invalidateQueries({
        queryKey: ['taskDaily'],
        refetchType: 'none'
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboardSummary(),
        refetchType: 'none'
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.topJobDetails(),
        refetchType: 'none'
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.topFeeders(),
        refetchType: 'none'
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.feederJobMatrix(),
        refetchType: 'none'
      })
    },
  })
}

// Mutation Hook สำหรับอัพเดต Task Daily
export function useUpdateTaskDaily() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateTaskDailyData) => taskDailyService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskDailies'] })
      queryClient.invalidateQueries({ queryKey: ['taskDaily'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary() })
      queryClient.invalidateQueries({ queryKey: queryKeys.topJobDetails() })
      queryClient.invalidateQueries({ queryKey: queryKeys.topFeeders() })
      queryClient.invalidateQueries({ queryKey: queryKeys.feederJobMatrix() })
    },
  })
}

// Mutation Hook สำหรับลบ Task Daily
export function useDeleteTaskDaily() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => taskDailyService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskDailies'] })
      queryClient.invalidateQueries({ queryKey: ['taskDaily'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary() })
      queryClient.invalidateQueries({ queryKey: queryKeys.topJobDetails() })
      queryClient.invalidateQueries({ queryKey: queryKeys.topFeeders() })
      queryClient.invalidateQueries({ queryKey: queryKeys.feederJobMatrix() })
    },
  })
}

// ============================================================
// Monthly Plan Hooks
// ============================================================

export function useMonthlyPlanYearOverview(year?: number) {
  return useQuery<MonthlyPlanYearOverview>({
    queryKey: queryKeys.monthlyPlanYearOverview(year),
    queryFn: () => monthlyPlanService.getYearOverview(year!),
    enabled: !!year,
    staleTime: 1 * 60 * 1000,
  })
}

export function useMonthlyPlanPeriod(year?: number, month?: number) {
  return useQuery<MonthlyPlanPeriod>({
    queryKey: queryKeys.monthlyPlanPeriod(year, month),
    queryFn: () => monthlyPlanService.getPeriod(year!, month!),
    enabled: !!year && !!month,
    staleTime: 5 * 60 * 1000,
  })
}

export function useMonthlyPlanFiles(
  year?: number,
  month?: number,
  filters?: { search?: string; teamId?: number }
) {
  return useQuery<PlanFile[]>({
    queryKey: queryKeys.monthlyPlanFiles(year, month, filters?.search, filters?.teamId),
    queryFn: () => monthlyPlanService.getFiles(year!, month!, filters),
    enabled: !!year && !!month,
    staleTime: 1 * 60 * 1000,
  })
}

export function useMonthlyPlanStatus(year?: number, month?: number) {
  return useQuery<SubmissionStatusResponse>({
    queryKey: queryKeys.monthlyPlanStatus(year, month),
    queryFn: () => monthlyPlanService.getSubmissionStatus(year!, month!),
    enabled: !!year && !!month,
    staleTime: 1 * 60 * 1000,
  })
}

export function useMonthlyPlanSettings() {
  return useQuery<MonthlyPlanSettings>({
    queryKey: queryKeys.monthlyPlanSettings,
    queryFn: () => monthlyPlanService.getSettings(),
    staleTime: 10 * 60 * 1000,
  })
}

// ============================================================
// Team Plan Hooks
// ============================================================

export function useTeamPlans(params: TeamPlanListParams) {
  return useQuery<TeamPlanResponse[]>({
    queryKey: queryKeys.teamPlans(params),
    queryFn: () => teamPlanService.list(params),
    staleTime: 1 * 60 * 1000,
  })
}

// ============================================================
// Planning Calendar Hooks
// ============================================================

export function usePlanningCalendar(params?: PlanningCalendarParams) {
  return useQuery<PlanningCalendarResponse>({
    queryKey: queryKeys.planningCalendar(params),
    queryFn: () => planningCalendarService.getRange(params!),
    enabled: !!(params?.from && params?.to),
    staleTime: 2 * 60 * 1000,
  })
}

// ============================================================
// Contact Directory Hooks
// ============================================================

export function useContactDirectory(params?: ContactDirectoryListParams) {
  return useQuery<ContactDirectoryEntry[]>({
    queryKey: queryKeys.contactDirectory(params),
    queryFn: () => contactDirectoryService.list(params),
    staleTime: 5 * 60 * 1000,
  })
}

// ============================================================
// Large Work Hooks
// ============================================================

export function useLargeWorks(params?: LargeWorkListParams) {
  return useQuery<LargeWorkResponse[]>({
    queryKey: queryKeys.largeWorks(params),
    queryFn: () => largeWorkService.list(params),
    enabled: !!(params?.from && params?.to),
    staleTime: 2 * 60 * 1000,
  })
}

export function useLargeWorkOverview(id: number | undefined) {
  return useQuery<LargeWorkOverviewResponse>({
    queryKey: queryKeys.largeWorkOverview(id!),
    queryFn: () => largeWorkService.getOverview(id!),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
  })
}

export function useLargeWorkTasks(id: number | undefined) {
  return useQuery<LargeWorkTaskResponse[]>({
    queryKey: queryKeys.largeWorkTasks(id!),
    queryFn: () => largeWorkService.listTasks(id!),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
  })
}

export function useLargeWorkMyTodos() {
  return useQuery<LargeWorkTaskResponse[]>({
    queryKey: queryKeys.largeWorkMyTodos,
    queryFn: () => largeWorkService.getMyTodos(),
    staleTime: 30 * 1000,
  })
}

// ============================================================
// Daily Report Draft Hooks
// ============================================================

export function useDailyReportDraftSources(params?: DailyReportDraftSourcesParams) {
  return useQuery<DailyReportDraftSourcesResponse>({
    queryKey: queryKeys.dailyReportDraftSources(params),
    queryFn: () => dailyReportDraftService.listSources(params!),
    enabled: !!params?.workDate,
    staleTime: 1 * 60 * 1000,
  })
}

export function useDailyReportDrafts(params?: DailyReportDraftParams) {
  return useQuery<DailyReportDraftFromPlanResponse>({
    queryKey: queryKeys.dailyReportDrafts(params),
    queryFn: () => dailyReportDraftService.fromPlan(params!),
    enabled: !!(params?.sourceType && params?.sourceId),
    staleTime: 1 * 60 * 1000,
  })
}
