"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"

import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardFilters } from "@/components/dashboard/DashboardFilters"
import { OverviewCards } from "@/components/dashboard/OverviewCards"
import { FeederChart } from "@/components/dashboard/charts/FeederChart"
import { JobTypeChart } from "@/components/dashboard/charts/JobTypeChart"
import { TeamPerformanceChart } from "@/components/dashboard/charts/TeamPerformanceChart"
import { TrendChart } from "@/components/dashboard/charts/TrendChart"
import { Separator } from "@/components/ui/separator"

interface DashboardClientProps {
  teams: { id: string; name: string }[]
  feeders: { id: string; code: string }[]
}

export default function DashboardClient({ teams, feeders }: DashboardClientProps) {
  const [date, setDate] = useState<DateRange | undefined>(undefined)
  const [selectedTeam, setSelectedTeam] = useState<string | undefined>(undefined)
  const [selectedFeeder, setSelectedFeeder] = useState<string | undefined>(undefined)

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardStats', date, selectedTeam, selectedFeeder],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (date?.from) params.append('startDate', date.from.toISOString())
      if (date?.to) params.append('endDate', date.to.toISOString())
      if (selectedTeam) params.append('teamId', selectedTeam)
      if (selectedFeeder) params.append('feederId', selectedFeeder)

      const res = await fetch(`/api/dashboard/stats?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch dashboard stats')
      return res.json()
    }
  })

  const stats = data?.data

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <DashboardHeader />
      <Separator />
      
      <DashboardFilters
        date={date}
        setDate={setDate}
        teams={teams}
        feeders={feeders}
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
        selectedFeeder={selectedFeeder}
        setSelectedFeeder={setSelectedFeeder}
      />

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-red-500">Error loading dashboard data</div>
      ) : stats ? (
        <div className="space-y-4">
          <OverviewCards summary={stats.summary} />
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4">
              <TrendChart data={stats.charts.tasksByDate} />
            </div>
            <div className="col-span-3">
               <JobTypeChart data={stats.charts.tasksByJobType} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
             <div className="col-span-4">
                <FeederChart data={stats.charts.tasksByFeeder} />
             </div>
             <div className="col-span-3">
                <TeamPerformanceChart data={stats.charts.tasksByTeam} />
             </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
