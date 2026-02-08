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
import type { CreateTaskDailyData, UpdateTaskDailyData, TeamTaskGroups } from '@/types/task-daily'
import type { DashboardSummary, FeederJobMatrix, TopFeeder, TopJobDetail } from '@/lib/services/dashboard.service'

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
}

// Hook สำหรับ Job Details
export function useJobDetails() {
  return useQuery({
    queryKey: queryKeys.jobDetails,
    queryFn: () => jobDetailService.getAll(),
  })
}

// Hook สำหรับ Feeders
export function useFeeders() {
  return useQuery({
    queryKey: queryKeys.feeders,
    queryFn: () => feederService.getAll(),
  })
}

// Hook สำหรับ PEAs
export function usePeas() {
  return useQuery({
    queryKey: queryKeys.peas,
    queryFn: () => peaService.getAll(),
  })
}

// Hook สำหรับ Stations
export function useStations() {
  return useQuery({
    queryKey: queryKeys.stations,
    queryFn: () => stationService.getAll(),
  })
}

// Hook สำหรับ Job Types
export function useJobTypes() {
  return useQuery({
    queryKey: queryKeys.jobTypes,
    queryFn: () => jobTypeService.getAll(),
  })
}

// Hook สำหรับ Operation Centers
export function useOperationCenters() {
  return useQuery({
    queryKey: queryKeys.operationCenters,
    queryFn: () => operationCenterService.getAll(),
  })
}

// Hook สำหรับ Teams
export function useTeams() {
  return useQuery({
    queryKey: queryKeys.teams,
    queryFn: () => teamService.getAll(),
  })
}

// Hook สำหรับ Top Job Details
export function useTopJobDetails(year?: number, limit = 10, month?: number, teamId?: string, jobTypeId?: string) {
  return useQuery({
    queryKey: queryKeys.topJobDetails(year, limit, month, teamId, jobTypeId),
    queryFn: () => dashboardService.getTopJobDetails({ year, limit, month, teamId, jobTypeId }),
    staleTime: 2 * 60 * 1000,
  })
}

// Hook สำหรับ Top Feeders
export function useTopFeeders(year?: number, limit = 10, month?: number, teamId?: string, jobTypeId?: string) {
  return useQuery({
    queryKey: queryKeys.topFeeders(year, limit, month, teamId, jobTypeId),
    queryFn: () => dashboardService.getTopFeeders({ year, limit, month, teamId, jobTypeId }),
    staleTime: 2 * 60 * 1000,
  })
}

// Hook สำหรับ Feeder Job Matrix
export function useFeederJobMatrix(feederId?: string, year?: number, month?: number, teamId?: string, jobTypeId?: string) {
  return useQuery({
    queryKey: queryKeys.feederJobMatrix(feederId, year, month, teamId, jobTypeId),
    queryFn: () => {
      if (!feederId) return null
      return dashboardService.getFeederJobMatrix({ feederId, year, month, teamId, jobTypeId })
    },
    enabled: !!feederId,
    staleTime: 2 * 60 * 1000,
  })
}

// Hook สำหรับ Dashboard Summary
export function useDashboardSummary(year?: number, month?: number, teamId?: string, jobTypeId?: string) {
  return useQuery({
    queryKey: queryKeys.dashboardSummary(year, month, teamId, jobTypeId),
    queryFn: () => dashboardService.getSummary({ year, month, teamId, jobTypeId }),
    staleTime: 2 * 60 * 1000,
  })
}

// Hook สำหรับ Task Dailies (filtered by year/month/team)
export function useTaskDailies(params?: { year: string; month: string; teamId?: string }) {
  return useQuery<TeamTaskGroups>({
    queryKey: queryKeys.taskDailies(params),
    queryFn: () => {
      if (!params?.year || !params?.month) return {} as TeamTaskGroups
      return taskDailyService.getByFilter(params)
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
