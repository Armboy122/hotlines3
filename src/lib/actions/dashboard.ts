'use server'

import { getPlanStationsOverview } from './plan-station'
import { getPlanLinesOverview } from './plan-line'
import { getPlanAbsOverview } from './plan-abs'
import { getPlanConductorsOverview } from './plan-conductor'
import { getPlanCableCarsOverview } from './plan-cable-car'

export interface DashboardOverview {
  planStations: {
    total: number
    completed: number
    pending: number
    completionRate: number
  }
  planLines: {
    total: number
    active: number
    cancelled: number
    totalDistance: number
    cancelRate: number
  }
  planAbs: {
    total: number
    completed: number
    pending: number
    cancelled: number
    completionRate: number
  }
  planConductors: {
    total: number
    completed: number
    pending: number
    cancelled: number
    completionRate: number
  }
  planCableCars: {
    total: number
    completed: number
    pending: number
    cancelled: number
    passed: number
    failed: number
    needsMaintenance: number
    completionRate: number
    passRate: number
  }
  summary: {
    totalPlans: number
    totalCompleted: number
    totalPending: number
    totalCancelled: number
    overallCompletionRate: number
  }
}

export async function getDashboardOverview(year?: number): Promise<{ success: boolean; data?: DashboardOverview; error?: string }> {
  try {
    const [
      stationsResult,
      linesResult,
      absResult,
      conductorsResult,
      cableCarsResult
    ] = await Promise.all([
      getPlanStationsOverview(year),
      getPlanLinesOverview(year),
      getPlanAbsOverview(year),
      getPlanConductorsOverview(year),
      getPlanCableCarsOverview(year)
    ])

    // Check if all requests succeeded
    if (!stationsResult.success || !linesResult.success || !absResult.success || 
        !conductorsResult.success || !cableCarsResult.success) {
      return { success: false, error: 'Failed to fetch some overview data' }
    }

    const planStations = stationsResult.data!
    const planLines = linesResult.data!
    const planAbs = absResult.data!
    const planConductors = conductorsResult.data!
    const planCableCars = cableCarsResult.data!

    // Calculate summary
    const totalPlans = planStations.total + planLines.total + planAbs.total + 
                      planConductors.total + planCableCars.total
    
    const totalCompleted = planStations.completed + planAbs.completed + 
                          planConductors.completed + planCableCars.completed
    
    const totalPending = planStations.pending + planAbs.pending + 
                        planConductors.pending + planCableCars.pending
    
    const totalCancelled = planLines.cancelled + planAbs.cancelled + 
                          planConductors.cancelled + planCableCars.cancelled

    const overallCompletionRate = totalPlans > 0 ? 
      Math.round(((totalCompleted) / (totalPlans - totalCancelled)) * 100) : 0

    const overview: DashboardOverview = {
      planStations,
      planLines,
      planAbs,
      planConductors,
      planCableCars,
      summary: {
        totalPlans,
        totalCompleted,
        totalPending,
        totalCancelled,
        overallCompletionRate
      }
    }

    return { success: true, data: overview }
  } catch (error) {
    console.error('Error fetching dashboard overview:', error)
    return { success: false, error: 'Failed to fetch dashboard overview' }
  }
}
