"use client"

import * as React from "react"
import { DateRange } from "react-day-picker"
import { CalendarDateRangePicker } from "./DateRangePicker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface DashboardFiltersProps {
  date: DateRange | undefined
  setDate: (date: DateRange | undefined) => void
  teams: { id: string; name: string }[]
  feeders: { id: string; code: string }[]
  selectedTeam: string | undefined
  setSelectedTeam: (teamId: string | undefined) => void
  selectedFeeder: string | undefined
  setSelectedFeeder: (feederId: string | undefined) => void
}

export function DashboardFilters({
  date,
  setDate,
  teams,
  feeders,
  selectedTeam,
  setSelectedTeam,
  selectedFeeder,
  setSelectedFeeder,
}: DashboardFiltersProps) {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 items-end md:items-center">
      <CalendarDateRangePicker date={date} setDate={setDate} />
      
      <div className="flex items-center space-x-2">
        <Select
          value={selectedTeam || "all"}
          onValueChange={(value) => setSelectedTeam(value === "all" ? undefined : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Team" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teams</SelectItem>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedTeam && (
            <Button variant="ghost" size="icon" onClick={() => setSelectedTeam(undefined)}>
                <X className="h-4 w-4" />
            </Button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Select
          value={selectedFeeder || "all"}
          onValueChange={(value) => setSelectedFeeder(value === "all" ? undefined : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Feeder" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Feeders</SelectItem>
            {feeders.map((feeder) => (
              <SelectItem key={feeder.id} value={feeder.id}>
                {feeder.code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedFeeder && (
            <Button variant="ghost" size="icon" onClick={() => setSelectedFeeder(undefined)}>
                <X className="h-4 w-4" />
            </Button>
        )}
      </div>
    </div>
  )
}
