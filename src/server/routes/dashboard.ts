import { Elysia, t } from 'elysia'
import { dashboardService } from '@/server/services/dashboard.service'

export const dashboardRoutes = new Elysia({ prefix: '/dashboard' })
    .get('/summary', async ({ query }) => {
        const year = query.year ? parseInt(query.year) : undefined
        const month = query.month ? parseInt(query.month) : undefined
        const teamId = query.teamId || undefined
        const jobTypeId = query.jobTypeId || undefined

        const data = await dashboardService.getDashboardSummary(year, month, teamId, jobTypeId)
        return { success: true, data }
    }, {
        query: t.Object({
            year: t.Optional(t.String()),
            month: t.Optional(t.String()),
            teamId: t.Optional(t.String()),
            jobTypeId: t.Optional(t.String())
        })
    })
    .get('/stats', async ({ query }) => {
        const startDateParam = query.startDate
        const endDateParam = query.endDate
        const teamId = query.teamId || undefined
        const feederId = query.feederId || undefined

        const startDate = startDateParam ? new Date(startDateParam) : undefined
        const endDate = endDateParam ? new Date(endDateParam) : undefined

        const data = await dashboardService.getDashboardStats({
            startDate,
            endDate,
            teamId,
            feederId
        })

        return { success: true, data }
    }, {
        query: t.Object({
            startDate: t.Optional(t.String()),
            endDate: t.Optional(t.String()),
            teamId: t.Optional(t.String()),
            feederId: t.Optional(t.String())
        })
    })
    .get('/top-feeders', async ({ query }) => {
        const year = query.year ? parseInt(query.year) : undefined
        const limit = query.limit ? parseInt(query.limit) : 10
        const month = query.month ? parseInt(query.month) : undefined
        const teamId = query.teamId || undefined
        const jobTypeId = query.jobTypeId || undefined

        const data = await dashboardService.getTopFeeders(year, limit, month, teamId, jobTypeId)
        return { success: true, data }
    }, {
        query: t.Object({
            year: t.Optional(t.String()),
            limit: t.Optional(t.String()),
            month: t.Optional(t.String()),
            teamId: t.Optional(t.String()),
            jobTypeId: t.Optional(t.String())
        })
    })
    .get('/top-jobs', async ({ query }) => {
        const year = query.year ? parseInt(query.year) : undefined
        const limit = query.limit ? parseInt(query.limit) : 10
        const month = query.month ? parseInt(query.month) : undefined
        const teamId = query.teamId || undefined
        const jobTypeId = query.jobTypeId || undefined

        const data = await dashboardService.getTopJobDetails(year, limit, month, teamId, jobTypeId)
        return { success: true, data }
    }, {
        query: t.Object({
            year: t.Optional(t.String()),
            limit: t.Optional(t.String()),
            month: t.Optional(t.String()),
            teamId: t.Optional(t.String()),
            jobTypeId: t.Optional(t.String())
        })
    })
    .get('/feeder-matrix', async ({ query, set }) => {
        const feederId = query.feederId
        const year = query.year ? parseInt(query.year) : undefined
        const month = query.month ? parseInt(query.month) : undefined
        const teamId = query.teamId || undefined
        const jobTypeId = query.jobTypeId || undefined

        if (!feederId) {
            set.status = 400
            return { success: false, error: 'Feeder ID is required' }
        }

        const data = await dashboardService.getFeederJobMatrix(feederId, year, month, teamId, jobTypeId)
        return { success: true, data }
    }, {
        query: t.Object({
            feederId: t.Optional(t.String()),
            year: t.Optional(t.String()),
            month: t.Optional(t.String()),
            teamId: t.Optional(t.String()),
            jobTypeId: t.Optional(t.String())
        })
    })
