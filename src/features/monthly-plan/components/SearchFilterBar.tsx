'use client'

import { Search, Filter } from 'lucide-react'
interface TeamOption {
  teamId: number
  teamName: string
}

interface SearchFilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  selectedTeamId: number | null
  onTeamChange: (teamId: number | null) => void
  teams: TeamOption[]
}

export function SearchFilterBar({
  search,
  onSearchChange,
  selectedTeamId,
  onTeamChange,
  teams,
}: SearchFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ค้นหาชื่อไฟล์..."
          className="input-glass w-full h-11 rounded-xl pl-9 pr-3 text-sm focus:outline-none"
        />
      </div>

      <div className="relative sm:w-44">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <select
          value={selectedTeamId ?? ''}
          onChange={(e) => onTeamChange(e.target.value === '' ? null : Number(e.target.value))}
          className="input-glass w-full h-11 rounded-xl pl-9 pr-3 text-sm focus:outline-none appearance-none cursor-pointer"
        >
          <option value="">ทุกทีม</option>
          {teams.map((t) => (
            <option key={t.teamId} value={t.teamId}>
              {t.teamName}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
