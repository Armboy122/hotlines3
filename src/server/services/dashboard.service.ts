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

export const dashboardService = {
    getTopJobDetails: async (year?: number, limit = 10): Promise<TopJobDetail[]> => {
        const whereClause: { workDate?: { gte: Date; lte: Date } } = {}

        if (year) {
            whereClause.workDate = {
                gte: new Date(`${year}-01-01`),
                lte: new Date(`${year}-12-31`)
            }
        }

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

    getTopFeeders: async (year?: number, limit = 10): Promise<TopFeeder[]> => {
        const whereClause: { workDate?: { gte: Date; lte: Date }; feederId?: { not: null } } = {
            feederId: { not: null }
        }

        if (year) {
            whereClause.workDate = {
                gte: new Date(`${year}-01-01`),
                lte: new Date(`${year}-12-31`)
            }
        }

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

    getFeederJobMatrix: async (feederId: string, year?: number): Promise<FeederJobMatrix> => {
        const feeder = await prisma.feeder.findUnique({
            where: { id: BigInt(feederId) },
            include: { station: true }
        })

        if (!feeder) {
            throw new Error('Feeder not found')
        }

        const whereClause: { feederId: bigint; workDate?: { gte: Date; lte: Date } } = {
            feederId: BigInt(feederId)
        }

        if (year) {
            whereClause.workDate = {
                gte: new Date(`${year}-01-01`),
                lte: new Date(`${year}-12-31`)
            }
        }

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

    getDashboardSummary: async (year?: number): Promise<DashboardSummary> => {
        const whereClause: { workDate?: { gte: Date; lte: Date } } = {}

        if (year) {
            whereClause.workDate = {
                gte: new Date(`${year}-01-01`),
                lte: new Date(`${year}-12-31`)
            }
        }

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
    }
}
