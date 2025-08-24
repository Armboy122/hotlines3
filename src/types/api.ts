// Types สำหรับ API responses และ data structures

export interface JobDetail {
  id: bigint
  jobTypeId: bigint
  name: string
  active: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
  jobType: {
    id: bigint
    name: string
  }
  _count: {
    tasks: number
  }
}

export interface Feeder {
  id: bigint
  code: string
  stationId: bigint
  createdAt: Date
  updatedAt: Date
  station: {
    id: bigint
    name: string
    codeName: string
    operationId: bigint
    operationCenter: {
      id: bigint
      name: string
    }
  }
  _count: {
    tasks: number
  }
}

export interface Pea {
  id: bigint
  shortname: string
  fullname: string
  operationId: bigint
  createdAt: Date
  updatedAt: Date
  operationCenter: {
    id: bigint
    name: string
  }
  _count: {
    planConductors: number
    planCableCars: number
  }
}

export interface Station {
  id: bigint
  name: string
  codeName: string
  operationId: bigint
  createdAt: Date
  updatedAt: Date
  operationCenter: {
    id: bigint
    name: string
  }
  _count: {
    feeders: number
    planStations: number
  }
}

export interface JobType {
  id: bigint
  name: string
  createdAt: Date
  updatedAt: Date
  _count: {
    details: number
    tasks: number
  }
}

export interface OperationCenter {
  id: bigint
  name: string
  createdAt: Date
  updatedAt: Date
  _count: {
    peas: number
    stations: number
  }
}

// Form data types
export interface JobDetailFormData {
  id?: string
  jobTypeId: string
  name: string
  active: boolean
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
