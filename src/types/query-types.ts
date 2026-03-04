// Types สำหรับข้อมูลที่ได้จาก queries (API responses)

export interface JobTypeWithCount {
  id: number
  name: string
  _count: {
    tasks: number
  }
}

export interface JobDetailWithCount {
  id: number
  name: string
  jobTypeId: number | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  _count: {
    tasks: number
  }
}

export interface FeederWithStation {
  id: number
  code: string
  stationId: number
  station: {
    id: number
    name: string
    codeName: string
    operationId: number
    operationCenter: {
      id: number
      name: string
    }
  }
  _count: {
    tasks: number
  }
}

export interface Team {
  id: number
  name: string
}
