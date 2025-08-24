'use client'

import { useQuery } from '@tanstack/react-query'
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
  getDashboardOverview
} from '@/lib/actions/index'

// Query Keys สำหรับการ cache
export const queryKeys = {
  jobDetails: ['jobDetails'] as const,
  feeders: ['feeders'] as const,
  peas: ['peas'] as const,
  stations: ['stations'] as const,
  jobTypes: ['jobTypes'] as const,
  operationCenters: ['operationCenters'] as const,
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
  dashboardOverview: (year?: number) => ['dashboardOverview', year] as const,
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

// Hook สำหรับ Dashboard Overview
export function useDashboardOverview(year?: number) {
  return useQuery({
    queryKey: queryKeys.dashboardOverview(year),
    queryFn: async () => {
      const result = await getDashboardOverview(year)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch dashboard overview')
      }
      return result.data
    },
    // Dashboard ควร refresh บ่อยกว่าหน้าอื่น
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh ทุก 5 นาที
  })
}
