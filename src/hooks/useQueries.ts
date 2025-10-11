'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getJobDetails,
  getFeeders,
  getPeas,
  getStations,
  getJobTypes,
  getOperationCenters,
  getPlanAbsItems,
  getPlanAbsOverview,
  getPlanCableCars,
  getPlanCableCarsOverview,
  getPlanStations,
  getPlanStationsOverview,
  getPlanLines,
  getPlanLinesOverview,
  getPlanConductors,
  getPlanConductorsOverview,
} from '@/lib/actions/index'
import { getTeams } from '@/lib/actions/team'
import {
  getTopJobDetails,
  getTopFeeders,
  getFeederJobMatrix,
  getDashboardSummary
} from '@/lib/actions/dashboard'
import {
  createTaskDaily,
  updateTaskDaily,
  deleteTaskDaily,
  getTaskDailiesByFilter,
  type CreateTaskDailyData,
  type UpdateTaskDailyData
} from '@/lib/actions/task-daily'

// Query Keys สำหรับการ cache
export const queryKeys = {
  jobDetails: ['jobDetails'] as const,
  feeders: ['feeders'] as const,
  peas: ['peas'] as const,
  stations: ['stations'] as const,
  jobTypes: ['jobTypes'] as const,
  operationCenters: ['operationCenters'] as const,
  teams: ['teams'] as const,
  planAbs: (year?: number) => ['planAbs', year] as const,
  planAbsOverview: (year?: number) => ['planAbsOverview', year] as const,
  planCableCars: (year?: number) => ['planCableCars', year] as const,
  planCableCarsOverview: (year?: number) => ['planCableCarsOverview', year] as const,
  planStations: (year?: number) => ['planStations', year] as const,
  planStationsOverview: (year?: number) => ['planStationsOverview', year] as const,
  planLines: (year?: number) => ['planLines', year] as const,
  planLinesOverview: (year?: number) => ['planLinesOverview', year] as const,
  planConductors: (year?: number) => ['planConductors', year] as const,
  planConductorsOverview: (year?: number) => ['planConductorsOverview', year] as const,
  // Task Daily Analytics
  topJobDetails: (year?: number, limit?: number) => ['topJobDetails', year, limit] as const,
  topFeeders: (year?: number, limit?: number) => ['topFeeders', year, limit] as const,
  feederJobMatrix: (feederId?: string, year?: number) => ['feederJobMatrix', feederId, year] as const,
  dashboardSummary: (year?: number) => ['dashboardSummary', year] as const,
  // Task Dailies
  taskDailies: (params?: { year: string; month: string; teamId?: string }) => ['taskDailies', params] as const,
}

// Hook สำหรับ Job Details
export function useJobDetails() {
  return useQuery({
    queryKey: queryKeys.jobDetails,
    queryFn: async () => {
      const result = await getJobDetails()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch job details')
      }
      return result.data
    },
  })
}

// Hook สำหรับ Feeders
export function useFeeders() {
  return useQuery({
    queryKey: queryKeys.feeders,
    queryFn: async () => {
      const result = await getFeeders()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch feeders')
      }
      return result.data
    },
  })
}

// Hook สำหรับ PEAs
export function usePeas() {
  return useQuery({
    queryKey: queryKeys.peas,
    queryFn: async () => {
      const result = await getPeas()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch peas')
      }
      return result.data
    },
  })
}

// Hook สำหรับ Stations
export function useStations() {
  return useQuery({
    queryKey: queryKeys.stations,
    queryFn: async () => {
      const result = await getStations()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch stations')
      }
      return result.data
    },
  })
}

// Hook สำหรับ Job Types
export function useJobTypes() {
  return useQuery({
    queryKey: queryKeys.jobTypes,
    queryFn: async () => {
      const result = await getJobTypes()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch job types')
      }
      return result.data
    },
  })
}

// Hook สำหรับ Operation Centers
export function useOperationCenters() {
  return useQuery({
    queryKey: queryKeys.operationCenters,
    queryFn: async () => {
      const result = await getOperationCenters()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch operation centers')
      }
      return result.data
    },
  })
}

// Hook สำหรับ Teams
export function useTeams() {
  return useQuery({
    queryKey: queryKeys.teams,
    queryFn: async () => {
      const result = await getTeams()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch teams')
      }
      return result.data
    },
  })
}

// Hook สำหรับ Plan ABS Items
export function usePlanAbsItems(year?: number) {
  return useQuery({
    queryKey: queryKeys.planAbs(year),
    queryFn: async () => {
      const result = await getPlanAbsItems(year)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch plan ABS items')
      }
      return result.data
    },
  })
}

// Hook สำหรับ Plan ABS Overview
export function usePlanAbsOverview(year?: number) {
  return useQuery({
    queryKey: queryKeys.planAbsOverview(year),
    queryFn: async () => {
      const result = await getPlanAbsOverview(year)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch plan ABS overview')
      }
      return result.data
    },
  })
}

// Hook สำหรับ Plan Cable Cars Items
export function usePlanCableCarsItems(year?: number) {
  return useQuery({
    queryKey: queryKeys.planCableCars(year),
    queryFn: async () => {
      const result = await getPlanCableCars(year)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch plan cable cars items')
      }
      return result.data
    },
  })
}

// Hook สำหรับ Plan Cable Cars Overview
export function usePlanCableCarsOverview(year?: number) {
  return useQuery({
    queryKey: queryKeys.planCableCarsOverview(year),
    queryFn: async () => {
      const result = await getPlanCableCarsOverview(year)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch plan cable cars overview')
      }
      return result.data
    },
  })
}

// Hook สำหรับ Plan Stations Items
export function usePlanStationsItems(year?: number) {
  return useQuery({
    queryKey: queryKeys.planStations(year),
    queryFn: async () => {
      const result = await getPlanStations(year)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch plan stations items')
      }
      return result.data
    },
  })
}

// Hook สำหรับ Plan Stations Overview
export function usePlanStationsOverview(year?: number) {
  return useQuery({
    queryKey: queryKeys.planStationsOverview(year),
    queryFn: async () => {
      const result = await getPlanStationsOverview(year)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch plan stations overview')
      }
      return result.data
    },
  })
}

// Hook สำหรับ Plan Lines Items
export function usePlanLinesItems(year?: number) {
  return useQuery({
    queryKey: queryKeys.planLines(year),
    queryFn: async () => {
      const result = await getPlanLines(year)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch plan lines items')
      }
      return result.data
    },
  })
}

// Hook สำหรับ Plan Lines Overview
export function usePlanLinesOverview(year?: number) {
  return useQuery({
    queryKey: queryKeys.planLinesOverview(year),
    queryFn: async () => {
      const result = await getPlanLinesOverview(year)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch plan lines overview')
      }
      return result.data
    },
  })
}

// Hook สำหรับ Plan Conductors Items
export function usePlanConductorsItems(year?: number) {
  return useQuery({
    queryKey: queryKeys.planConductors(year),
    queryFn: async () => {
      const result = await getPlanConductors(year)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch plan conductors items')
      }
      return result.data
    },
  })
}

// Hook สำหรับ Plan Conductors Overview
export function usePlanConductorsOverview(year?: number) {
  return useQuery({
    queryKey: queryKeys.planConductorsOverview(year),
    queryFn: async () => {
      const result = await getPlanConductorsOverview(year)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch plan conductors overview')
      }
      return result.data
    },
  })
}

// Hook สำหรับ Top Job Details
export function useTopJobDetails(year?: number, limit = 10) {
  return useQuery({
    queryKey: queryKeys.topJobDetails(year, limit),
    queryFn: async () => {
      const result = await getTopJobDetails(year, limit)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch top job details')
      }
      return result.data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Hook สำหรับ Top Feeders
export function useTopFeeders(year?: number, limit = 10) {
  return useQuery({
    queryKey: queryKeys.topFeeders(year, limit),
    queryFn: async () => {
      const result = await getTopFeeders(year, limit)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch top feeders')
      }
      return result.data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Hook สำหรับ Feeder Job Matrix
export function useFeederJobMatrix(feederId?: string, year?: number) {
  return useQuery({
    queryKey: queryKeys.feederJobMatrix(feederId, year),
    queryFn: async () => {
      if (!feederId) return null
      const result = await getFeederJobMatrix(feederId, year)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch feeder job matrix')
      }
      return result.data
    },
    enabled: !!feederId, // จะ fetch เมื่อมี feederId เท่านั้น
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Hook สำหรับ Dashboard Summary
export function useDashboardSummary(year?: number) {
  return useQuery({
    queryKey: queryKeys.dashboardSummary(year),
    queryFn: async () => {
      const result = await getDashboardSummary(year)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch dashboard summary')
      }
      return result.data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Hook สำหรับ Task Dailies (filtered by year/month/team)
export function useTaskDailies(params?: { year: string; month: string; teamId?: string }) {
  return useQuery({
    queryKey: queryKeys.taskDailies(params),
    queryFn: async () => {
      if (!params?.year || !params?.month) return {}
      const result = await getTaskDailiesByFilter(params)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch task dailies')
      }
      return result.data
    },
    enabled: !!params?.year && !!params?.month,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Mutation Hook สำหรับสร้าง Task Daily
export function useCreateTaskDaily() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateTaskDailyData) => {
      const result = await createTaskDaily(data)
      if (!result.success) {
        throw new Error(result.error || 'Failed to create task daily')
      }
      return result.data
    },
    onSuccess: () => {
      // Invalidate และ refetch queries ที่เกี่ยวข้อง (แทนที่ revalidatePath)
      queryClient.invalidateQueries({ queryKey: ['taskDailies'] })
      queryClient.invalidateQueries({ queryKey: ['taskDaily'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary() })
      queryClient.invalidateQueries({ queryKey: queryKeys.topJobDetails() })
      queryClient.invalidateQueries({ queryKey: queryKeys.topFeeders() })
      queryClient.invalidateQueries({ queryKey: queryKeys.feederJobMatrix() })
    },
  })
}

// Mutation Hook สำหรับอัพเดต Task Daily
export function useUpdateTaskDaily() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateTaskDailyData) => {
      const result = await updateTaskDaily(data)
      if (!result.success) {
        throw new Error(result.error || 'Failed to update task daily')
      }
      return result.data
    },
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
    mutationFn: async (id: string) => {
      const result = await deleteTaskDaily(id)
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete task daily')
      }
      return result
    },
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
