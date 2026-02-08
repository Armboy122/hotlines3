// Types สำหรับข้อมูลที่ได้จาก queries (API responses)

export interface JobTypeWithCount {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  _count: {
    tasks: number
  }
}

export interface JobDetailWithCount {
  id: string
  name: string
  jobTypeId: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  _count: {
    tasks: number
  }
}

export interface FeederWithStation {
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

export interface Team {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}
