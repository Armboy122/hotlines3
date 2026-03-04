'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jobDetailService } from '@/lib/services/job-detail.service'
import { feederService } from '@/lib/services/feeder.service'
import { peaService } from '@/lib/services/pea.service'
import { stationService } from '@/lib/services/station.service'
import { jobTypeService } from '@/lib/services/job-type.service'
import { operationCenterService } from '@/lib/services/operation-center.service'
import { teamService } from '@/lib/services/team.service'
import { taskDailyService } from '@/lib/services/task-daily.service'
import { dashboardService } from '@/lib/services/dashboard.service'
import { monthlyPlanService } from '@/lib/services/monthly-plan.service'
import type { CreateTaskDailyData, UpdateTaskDailyData, TeamTaskGroups } from '@/types/task-daily'
import type { MonthlyPlanPeriod, PlanFile, SubmissionStatusResponse, MonthlyPlanSettings } from '@/types/monthly-plan'
import type { DashboardSummary, FeederJobMatrix, TopFeeder, TopJobDetail } from '@/lib/services/dashboard.service'
import type { JobDetailWithCount, JobTypeWithCount, FeederWithStation, Team } from '@/types/query-types'
import type { Station, OperationCenter, Pea } from '@/types/api'

// Query Keys สำหรับการ cache
export const queryKeys = {
  jobDetails: ['jobDetails'] as const,
  feeders: ['feeders'] as const,
  peas: ['peas'] as const,
  stations: ['stations'] as const,
  jobTypes: ['jobTypes'] as const,
  operationCenters: ['operationCenters'] as const,
  teams: ['teams'] as const,

  // Task Daily Analytics
  topJobDetails: (year?: number, limit?: number, month?: number, teamId?: string, jobTypeId?: string) => ['topJobDetails', year, limit, month, teamId, jobTypeId] as const,
  topFeeders: (year?: number, limit?: number, month?: number, teamId?: string, jobTypeId?: string) => ['topFeeders', year, limit, month, teamId, jobTypeId] as const,
  feederJobMatrix: (feederId?: string, year?: number, month?: number, teamId?: string, jobTypeId?: string) => ['feederJobMatrix', feederId, year, month, teamId, jobTypeId] as const,
  dashboardSummary: (year?: number, month?: number, teamId?: string, jobTypeId?: string) => ['dashboardSummary', year, month, teamId, jobTypeId] as const,
  // Task Dailies
  taskDailies: (params?: { year: string; month: string; teamId?: string }) => ['taskDailies', params] as const,
  // Monthly Plan
  monthlyPlanPeriod: (year?: number, month?: number) => ['monthlyPlanPeriod', year, month] as const,
  monthlyPlanFiles: (year?: number, month?: number, search?: string, teamId?: number) => ['monthlyPlanFiles', year, month, search, teamId] as const,
  monthlyPlanStatus: (year?: number, month?: number) => ['monthlyPlanStatus', year, month] as const,
  monthlyPlanSettings: ['monthlyPlanSettings'] as const,
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
