'use client'

// TODO: [API-PHASE2] แก้ไข query hooks ทั้งหมดให้เรียก API แทน server actions
// TODO: [REFACTOR] แยก mutation hooks (useCreateTaskDaily, useUpdateTaskDaily, useDeleteTaskDaily) ไปไฟล์ useTaskDailyMutations.ts
// TODO: [API] Query hooks - เปลี่ยนจากเรียก server action (useJobDetails, useFeeders, usePeas, useStations, useJobTypes, useOperationCenters, useTeams, useTaskDailies) เป็น fetch(`/api/...`)

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getJobDetails,
  getFeeders,
  getPeas,
  getStations,
  getJobTypes,
  getOperationCenters,

} from '@/lib/actions/index'
import { getTeams } from '@/lib/actions/team'
// Removed imports from '@/lib/actions/dashboard'
import {
  createTaskDaily,
  updateTaskDaily,
  deleteTaskDaily,
  getTaskDailiesByFilter,
} from '@/lib/actions/task-daily'
import type { CreateTaskDailyData, UpdateTaskDailyData, TaskDailyFiltered } from '@/types/task-daily'

type TeamGroup = { team: TaskDailyFiltered['team']; tasks: TaskDailyFiltered[] }
type TeamGroups = Record<string, TeamGroup>
import type { DashboardSummary, FeederJobMatrix, TopFeeder, TopJobDetail } from '@/server/services/dashboard.service'

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



// Hook สำหรับ Top Job Details
export function useTopJobDetails(year?: number, limit = 10, month?: number, teamId?: string, jobTypeId?: string) {
  return useQuery({
    queryKey: queryKeys.topJobDetails(year, limit, month, teamId, jobTypeId),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (year) params.append('year', year.toString())
      if (limit) params.append('limit', limit.toString())
      if (month) params.append('month', month.toString())
      if (teamId) params.append('teamId', teamId)
      if (jobTypeId) params.append('jobTypeId', jobTypeId)

      const res = await fetch(`/api/dashboard/top-jobs?${params.toString()}`)
      const result = await res.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch top job details')
      }
      return result.data as TopJobDetail[]
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Hook สำหรับ Top Feeders
export function useTopFeeders(year?: number, limit = 10, month?: number, teamId?: string, jobTypeId?: string) {
  return useQuery({
    queryKey: queryKeys.topFeeders(year, limit, month, teamId, jobTypeId),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (year) params.append('year', year.toString())
      if (limit) params.append('limit', limit.toString())
      if (month) params.append('month', month.toString())
      if (teamId) params.append('teamId', teamId)
      if (jobTypeId) params.append('jobTypeId', jobTypeId)

      const res = await fetch(`/api/dashboard/top-feeders?${params.toString()}`)
      const result = await res.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch top feeders')
      }
      return result.data as TopFeeder[]
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Hook สำหรับ Feeder Job Matrix
export function useFeederJobMatrix(feederId?: string, year?: number, month?: number, teamId?: string, jobTypeId?: string) {
  return useQuery({
    queryKey: queryKeys.feederJobMatrix(feederId, year, month, teamId, jobTypeId),
    queryFn: async () => {
      if (!feederId) return null

      const params = new URLSearchParams()
      params.append('feederId', feederId)
      if (year) params.append('year', year.toString())
      if (month) params.append('month', month.toString())
      if (teamId) params.append('teamId', teamId)
      if (jobTypeId) params.append('jobTypeId', jobTypeId)

      const res = await fetch(`/api/dashboard/feeder-matrix?${params.toString()}`)
      const result = await res.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch feeder job matrix')
      }
      return result.data as FeederJobMatrix
    },
    enabled: !!feederId, // จะ fetch เมื่อมี feederId เท่านั้น
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Hook สำหรับ Dashboard Summary
export function useDashboardSummary(year?: number, month?: number, teamId?: string, jobTypeId?: string) {
  return useQuery({
    queryKey: queryKeys.dashboardSummary(year, month, teamId, jobTypeId),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (year) params.append('year', year.toString())
      if (month) params.append('month', month.toString())
      if (teamId) params.append('teamId', teamId)
      if (jobTypeId) params.append('jobTypeId', jobTypeId)

      const res = await fetch(`/api/dashboard/summary?${params.toString()}`)
      const result = await res.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch dashboard summary')
      }
      return result.data as DashboardSummary
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Hook สำหรับ Task Dailies (filtered by year/month/team)
export function useTaskDailies(params?: { year: string; month: string; teamId?: string }) {
  return useQuery<TeamGroups>({
    queryKey: queryKeys.taskDailies(params),
    queryFn: async () => {
      if (!params?.year || !params?.month) return {}
      const result = await getTaskDailiesByFilter(params)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch task dailies')
      }
      return result.data as TeamGroups
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
      // Invalidate queries ที่เกี่ยวข้อง แต่ไม่ refetch ทันที (refetch เมื่อหน้านั้นถูกเปิด)
      // ช่วยลดเวลารอหลังจากบันทึกข้อมูล
      queryClient.invalidateQueries({
        queryKey: ['taskDailies'],
        refetchType: 'none' // ไม่ refetch ทันที ให้ refetch เมื่อ component ที่ใช้ query นี้ mount
      })
      queryClient.invalidateQueries({
        queryKey: ['taskDaily'],
        refetchType: 'none'
      })

      // Dashboard queries - invalidate แต่ไม่ refetch ทันที
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
