export interface CreateTaskDailyData {
  workDate: string
  teamId: string
  jobTypeId: string
  jobDetailId: string
  feederId?: string
  numPole?: string
  deviceCode?: string
  detail?: string
  urlsBefore: string[]
  urlsAfter: string[]
  latitude?: number | null
  longitude?: number | null
}

export interface UpdateTaskDailyData extends CreateTaskDailyData {
  id: string
}

export interface TaskDailyFiltered {
  id: string
  workDate: string
  teamId: string
  jobTypeId: string
  jobDetailId: string
  feederId: string | null
  numPole?: string | null
  deviceCode?: string | null
  detail?: string | null
  urlsBefore: string[]
  urlsAfter: string[]
  latitude?: number | null
  longitude?: number | null
  team: {
    id: string
    name: string
  }
  jobType: {
    id: string
    name: string
  }
  jobDetail: {
    id: string
    name: string
  }
  feeder?: {
    id: string
    code: string
    station: {
      name: string
      operationCenter: {
        name: string
      }
    }
  }
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export type TeamTaskGroups = Record<string, { tasks: TaskDailyFiltered[] }>

