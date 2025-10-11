// Types สำหรับข้อมูลที่ได้จาก queries

import type { Prisma } from '@prisma/client'

// JobType with count (ตาม getJobTypes query)
export type JobTypeWithCount = Prisma.JobTypeGetPayload<{
  include: {
    _count: {
      select: {
        tasks: true
      }
    }
  }
}>

// JobDetail with count (ตาม getJobDetails query)
// Schema มี jobTypeId และ active ที่ไม่มีใน main schema
export type JobDetailWithCount = Prisma.JobDetailGetPayload<{
  include: {
    _count: {
      select: {
        tasks: true
      }
    }
  }
}>

// Feeder with station and operation center (ตาม getFeeders query)
export type FeederWithStation = Prisma.FeederGetPayload<{
  include: {
    station: {
      include: {
        operationCenter: true
      }
    }
    _count: {
      select: {
        tasks: true
      }
    }
  }
}>

// Team basic type (ตาม getTeams query)
export type Team = Prisma.TeamGetPayload<object>
