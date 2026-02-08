// Types สำหรับ API responses และ data structures

export interface JobDetail {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  _count: {
    tasks: number
  }
}

export interface Feeder {
  id: string
  code: string
  stationId: string
  createdAt: string
  updatedAt: string
  station: {
    id: string
    name: string
    codeName: string
    operationId: string
    operationCenter: {
      id: string
      name: string
    }
  }
  _count: {
    tasks: number
  }
}

export interface Pea {
  id: string
  shortname: string
  fullname: string
  operationId: string
  createdAt: string
  updatedAt: string
  operationCenter: {
    id: string
    name: string
  }
  _count: {
    planConductors: number
    planCableCars: number
  }
}

export interface Station {
  id: string
  name: string
  codeName: string
  operationId: string
  createdAt: string
  updatedAt: string
  operationCenter: {
    id: string
    name: string
  }
  _count: {
    feeders: number
    planStations: number
  }
}

export interface JobType {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  _count: {
    tasks: number
  }
}

export interface OperationCenter {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  _count: {
    peas: number
    stations: number
  }
}

// Dashboard types
export interface TopJobDetail {
  id: string
  name: string
  count: number
  jobTypeName: string
}

export interface TopFeeder {
  id: string
  code: string
  stationName: string
  count: number
}

export interface FeederJobMatrix {
  feederId: string
  feederCode: string
  stationName: string
  totalCount: number
  jobDetails: {
    id: string
    name: string
    count: number
    jobTypeName: string
  }[]
}

export interface DashboardSummary {
  totalTasks: number
  totalJobTypes: number
  totalFeeders: number
  topTeam: {
    id: string
    name: string
    count: number
  } | null
}

// Form data types
export interface JobDetailFormData {
  id?: string
  name: string
}

export interface FeederFormData {
  id?: string
  code: string
  stationId: string
}

export interface PeaFormData {
  id?: string
  shortname: string
  fullname: string
  operationId: string
}

export interface StationFormData {
  id?: string
  name: string
  codeName: string
  operationId: string
}

export interface JobTypeFormData {
  id?: string
  name: string
}

export interface OperationCenterFormData {
  id?: string
  name: string
}
