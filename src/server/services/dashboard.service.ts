import { prisma } from '@/lib/prisma'

// Types
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

interface WhereClause {
  workDate?: {
    gte: Date
    lte: Date
  }
  teamId?: bigint
  jobTypeId?: bigint
  feederId?: {
    not: null
  } | bigint
}

const buildWhereClause = (year?: number, month?: number, teamId?: string, jobTypeId?: string): WhereClause => {
  const whereClause: WhereClause = {}

  if (year) {
    let startDate = new Date(`${year}-01-01`)
    let endDate = new Date(`${year}-12-31`)
    endDate.setHours(23, 59, 59, 999)

    if (month) {
      // month is 1-12
      startDate = new Date(year, month - 1, 1)
      endDate = new Date(year, month, 0) // Last day of the month
      endDate.setHours(23, 59, 59, 999)
    }

    whereClause.workDate = {
      gte: startDate,
      lte: endDate
    }
  }

  if (teamId && teamId !== 'all') {
    whereClause.teamId = BigInt(teamId)
  }

  if (jobTypeId && jobTypeId !== 'all') {
    whereClause.jobTypeId = BigInt(jobTypeId)
  }

  return whereClause
}

export const dashboardService = {
  getTopJobDetails: async (year?: number, limit = 10, month?: number, teamId?: string, jobTypeId?: string): Promise<TopJobDetail[]> => {
    const whereClause = buildWhereClause(year, month, teamId, jobTypeId)

    const result = await prisma.taskDaily.groupBy({
      by: ['jobDetailId'],
      where: whereClause,
      _count: {
        jobDetailId: true
      },
      orderBy: {
        _count: {
          jobDetailId: 'desc'
        }
      },
      take: limit
    })

    const topJobDetails = await Promise.all(
      result.map(async (item) => {
        const jobDetail = await prisma.jobDetail.findUnique({
          where: { id: item.jobDetailId },
          include: { jobType: true }
        })
        return {
          id: item.jobDetailId.toString(),
          name: jobDetail?.name || 'Unknown',
          count: item._count.jobDetailId,
          jobTypeName: jobDetail?.jobType?.name || 'Unknown'
        }
      })
    )

    return topJobDetails
  },

  getTopFeeders: async (year?: number, limit = 10, month?: number, teamId?: string, jobTypeId?: string): Promise<TopFeeder[]> => {
    const whereClause = buildWhereClause(year, month, teamId, jobTypeId)
    whereClause.feederId = { not: null }

    const result = await prisma.taskDaily.groupBy({
      by: ['feederId'],
      where: whereClause,
      _count: {
        feederId: true
      },
      orderBy: {
        _count: {
          feederId: 'desc'
        }
      },
      take: limit
    })

    const topFeeders = await Promise.all(
      result.map(async (item) => {
        if (!item.feederId) return null
        const feeder = await prisma.feeder.findUnique({
          where: { id: item.feederId },
          include: { station: true }
        })
        return {
          id: item.feederId.toString(),
          code: feeder?.code || 'Unknown',
          stationName: feeder?.station?.name || 'Unknown',
          count: item._count.feederId
        }
      })
    )

    return topFeeders.filter(Boolean) as TopFeeder[]
  },

  getFeederJobMatrix: async (feederId: string, year?: number, month?: number, teamId?: string, jobTypeId?: string): Promise<FeederJobMatrix> => {
    const feeder = await prisma.feeder.findUnique({
      where: { id: BigInt(feederId) },
      include: { station: true }
    })

    if (!feeder) {
      throw new Error('Feeder not found')
    }

    const whereClause = buildWhereClause(year, month, teamId, jobTypeId)
    whereClause.feederId = BigInt(feederId)

    const result = await prisma.taskDaily.groupBy({
      by: ['jobDetailId'],
      where: whereClause,
      _count: {
        jobDetailId: true
      },
      orderBy: {
        _count: {
          jobDetailId: 'desc'
        }
      }
    })

    const jobDetails = await Promise.all(
      result.map(async (item) => {
        const jobDetail = await prisma.jobDetail.findUnique({
          where: { id: item.jobDetailId },
          include: { jobType: true }
        })
        return {
          id: item.jobDetailId.toString(),
          name: jobDetail?.name || 'Unknown',
          count: item._count.jobDetailId,
          jobTypeName: jobDetail?.jobType?.name || 'Unknown'
        }
      })
    )

    const totalCount = jobDetails.reduce((sum, item) => sum + item.count, 0)

    return {
      feederId: feederId,
      feederCode: feeder.code,
      stationName: feeder.station.name,
      totalCount,
      jobDetails
    }
  },

  getDashboardSummary: async (year?: number, month?: number, teamId?: string, jobTypeId?: string): Promise<DashboardSummary> => {
    const whereClause = buildWhereClause(year, month, teamId, jobTypeId)

    // จำนวนงานทั้งหมด
    const totalTasks = await prisma.taskDaily.count({ where: whereClause })

    // จำนวน Job Types ที่ใช้งาน
    const jobTypesUsed = await prisma.taskDaily.groupBy({
      by: ['jobTypeId'],
      where: whereClause
    })
    const totalJobTypes = jobTypesUsed.length

    // จำนวน Feeders ที่มีงาน
    const feedersUsed = await prisma.taskDaily.groupBy({
      by: ['feederId'],
      where: { ...whereClause, feederId: { not: null } }
    })
    const totalFeeders = feedersUsed.length

    // ทีมที่ทำงานมากสุด
    const topTeamResult = await prisma.taskDaily.groupBy({
      by: ['teamId'],
      where: whereClause,
      _count: {
        teamId: true
      },
      orderBy: {
        _count: {
          teamId: 'desc'
        }
      },
      take: 1
    })

    let topTeam = null
    if (topTeamResult.length > 0) {
      const team = await prisma.team.findUnique({
        where: { id: topTeamResult[0].teamId }
      })
      if (team) {
        topTeam = {
          id: team.id.toString(),
          name: team.name,
          count: topTeamResult[0]._count.teamId
        }
      }
    }

    return {
      totalTasks,
      totalJobTypes,
      totalFeeders,
      topTeam
    }
  },

  getDashboardStats: async (filters: {
    startDate?: Date
    endDate?: Date
    teamId?: string
    feederId?: string
  }) => {
    const whereClause: WhereClause = {}

    if (filters.startDate && filters.endDate) {
      whereClause.workDate = {
        gte: filters.startDate,
        lte: filters.endDate
      }
    }

    if (filters.teamId) {
      whereClause.teamId = BigInt(filters.teamId)
    }

    if (filters.feederId) {
      whereClause.feederId = BigInt(filters.feederId)
    }

    // 1. Summary Cards
    const totalTasks = await prisma.taskDaily.count({ where: whereClause })

    const activeTeamsCount = (await prisma.taskDaily.groupBy({
      by: ['teamId'],
      where: whereClause
    })).length

    // Top Job Type
    const topJobTypeResult = await prisma.taskDaily.groupBy({
      by: ['jobTypeId'],
      where: whereClause,
      _count: { jobTypeId: true },
      orderBy: { _count: { jobTypeId: 'desc' } },
      take: 1
    })
    let topJobType = 'N/A'
    if (topJobTypeResult.length > 0) {
      const jobType = await prisma.jobType.findUnique({
        where: { id: topJobTypeResult[0].jobTypeId }
      })
      if (jobType) topJobType = jobType.name
    }

    // Top Problem Feeder
    const topFeederResult = await prisma.taskDaily.groupBy({
      by: ['feederId'],
      where: { ...whereClause, feederId: { not: null } },
      _count: { feederId: true },
      orderBy: { _count: { feederId: 'desc' } },
      take: 1
    })
    let topFeeder = 'N/A'
    if (topFeederResult.length > 0 && topFeederResult[0].feederId) {
      const feeder = await prisma.feeder.findUnique({
        where: { id: topFeederResult[0].feederId }
      })
      if (feeder) topFeeder = feeder.code
    }

    // 2. Charts Data

    // A. Work Distribution by Feeder (Top 10)
    const tasksByFeederRaw = await prisma.taskDaily.groupBy({
      by: ['feederId'],
      where: { ...whereClause, feederId: { not: null } },
      _count: { feederId: true },
      orderBy: { _count: { feederId: 'desc' } },
      take: 10
    })

    const tasksByFeeder = await Promise.all(tasksByFeederRaw.map(async (item) => {
      if (!item.feederId) return null
      const feeder = await prisma.feeder.findUnique({ where: { id: item.feederId } })
      return {
        name: feeder?.code || 'Unknown',
        value: item._count.feederId
      }
    }))

    // B. Work Type Analysis
    const tasksByJobTypeRaw = await prisma.taskDaily.groupBy({
      by: ['jobTypeId'],
      where: whereClause,
      _count: { jobTypeId: true },
      orderBy: { _count: { jobTypeId: 'desc' } }
    })

    const tasksByJobType = await Promise.all(tasksByJobTypeRaw.map(async (item) => {
      const jobType = await prisma.jobType.findUnique({ where: { id: item.jobTypeId } })
      return {
        name: jobType?.name || 'Unknown',
        value: item._count.jobTypeId
      }
    }))

    // C. Team Performance
    const tasksByTeamRaw = await prisma.taskDaily.groupBy({
      by: ['teamId'],
      where: whereClause,
      _count: { teamId: true },
      orderBy: { _count: { teamId: 'desc' } }
    })

    const tasksByTeam = await Promise.all(tasksByTeamRaw.map(async (item) => {
      const team = await prisma.team.findUnique({ where: { id: item.teamId } })
      return {
        name: team?.name || 'Unknown',
        value: item._count.teamId
      }
    }))

    // D. Work Trends (Daily)
    // Note: Prisma doesn't support date truncation directly in groupBy easily without raw query.
    // For simplicity, we'll fetch dates and aggregate in JS, or use raw query if performance is needed.
    // Given the likely scale, JS aggregation is fine for now.
    // Actually, let's just group by workDate.
    const tasksByDateRaw = await prisma.taskDaily.groupBy({
      by: ['workDate'],
      where: whereClause,
      _count: { id: true },
      orderBy: { workDate: 'asc' }
    })

    const tasksByDate = tasksByDateRaw.map(item => ({
      date: item.workDate.toISOString().split('T')[0],
      count: item._count.id
    }))

    return {
      summary: {
        totalTasks,
        activeTeams: activeTeamsCount,
        topJobType,
        topFeeder
      },
      charts: {
        tasksByFeeder: tasksByFeeder.filter(Boolean),
        tasksByJobType,
        tasksByTeam,
        tasksByDate
      }
    }
  }
}
