import { Elysia, t } from 'elysia'
import { taskDailyService } from '@/server/services/task-daily.service'
import type { Prisma } from '@prisma/client'

// Helper types and functions for serialization
type TaskDailyWithRelations = Prisma.TaskDailyGetPayload<{
    include: {
        team: true
        jobType: true
        jobDetail: true
        feeder: {
            include: {
                station: {
                    include: {
                        operationCenter: true
                    }
                }
            }
        }
    }
}>

const decimalToNumber = (value: Prisma.Decimal | null | undefined) =>
    value === null || value === undefined ? null : value.toNumber()

const serializeTaskDaily = (task: TaskDailyWithRelations) => {
    const feeder = task.feeder
        ? {
            id: task.feeder.id.toString(),
            code: task.feeder.code,
            station: {
                name: task.feeder.station.name,
                operationCenter: {
                    name: task.feeder.station.operationCenter?.name ?? 'ไม่ระบุ',
                },
            },
        }
        : undefined

    return {
        id: task.id.toString(),
        workDate: task.workDate.toISOString(),
        teamId: task.teamId.toString(),
        jobTypeId: task.jobTypeId.toString(),
        jobDetailId: task.jobDetailId.toString(),
        feederId: task.feederId ? task.feederId.toString() : null,
        numPole: task.numPole ?? null,
        deviceCode: task.deviceCode ?? null,
        detail: task.detail ?? null,
        urlsBefore: [...task.urlsBefore],
        urlsAfter: [...task.urlsAfter],
        latitude: decimalToNumber(task.latitude),
        longitude: decimalToNumber(task.longitude),
        team: {
            id: task.team.id.toString(),
            name: task.team.name,
        },
        jobType: {
            id: task.jobType.id.toString(),
            name: task.jobType.name,
        },
        jobDetail: {
            id: task.jobDetail.id.toString(),
            name: task.jobDetail.name,
        },
        feeder,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
        deletedAt: task.deletedAt?.toISOString() ?? null,
    }
}

const groupTasksByTeam = (tasks: ReturnType<typeof serializeTaskDaily>[]) =>
    tasks.reduce((acc, task) => {
        const teamName = task.team.name
        if (!acc[teamName]) {
            acc[teamName] = {
                team: { ...task.team },
                tasks: [],
            }
        }
        acc[teamName].tasks.push(task)
        return acc
    }, {} as Record<string, { team: any; tasks: any[] }>)

export const tasksRoutes = new Elysia({ prefix: '/tasks' })
    .get('/', async ({ query }) => {
        const workDate = query.workDate
        const teamId = query.teamId
        const jobTypeId = query.jobTypeId
        const feederId = query.feederId

        const data = await taskDailyService.findMany({
            workDate,
            teamId,
            jobTypeId,
            feederId
        })
        // @ts-ignore - Prisma types are complex, but we know the shape matches
        return { success: true, data: data.map(serializeTaskDaily) }
    }, {
        query: t.Object({
            workDate: t.Optional(t.String()),
            teamId: t.Optional(t.String()),
            jobTypeId: t.Optional(t.String()),
            feederId: t.Optional(t.String())
        })
    })
    .get('/filter', async ({ query }) => {
        const year = query.year
        const month = query.month
        const teamId = query.teamId

        if (!year || !month) {
            return { success: false, error: 'Year and month are required' }
        }

        const data = await taskDailyService.findManyByFilter({
            year,
            month,
            teamId
        })
        // @ts-ignore
        const serialized = data.map(serializeTaskDaily)
        return { success: true, data: groupTasksByTeam(serialized) }
    }, {
        query: t.Object({
            year: t.String(),
            month: t.String(),
            teamId: t.Optional(t.String())
        })
    })
    .get('/by-team', async () => {
        const data = await taskDailyService.findAllByTeam()
        // @ts-ignore
        const serialized = data.map(serializeTaskDaily)
        return { success: true, data: groupTasksByTeam(serialized) }
    })
    .get('/:id', async ({ params, set }) => {
        const task = await taskDailyService.findById(params.id)
        if (!task) {
            set.status = 404
            return { success: false, error: 'Task not found' }
        }
        // @ts-ignore
        return { success: true, data: serializeTaskDaily(task) }
    }, {
        params: t.Object({
            id: t.String()
        })
    })
    .post('/', async ({ body, set }) => {
        try {
            const task = await taskDailyService.create(body as any)
            // @ts-ignore
            return { success: true, data: serializeTaskDaily(task) }
        } catch (error) {
            set.status = 500
            return { success: false, error: 'Failed to create task' }
        }
    })
    .put('/:id', async ({ params, body, set }) => {
        try {
            const task = await taskDailyService.update({ ...(body as any), id: params.id })
            // @ts-ignore
            return { success: true, data: serializeTaskDaily(task) }
        } catch (error) {
            set.status = 500
            return { success: false, error: 'Failed to update task' }
        }
    }, {
        params: t.Object({
            id: t.String()
        })
    })
    .delete('/:id', async ({ params, set }) => {
        try {
            await taskDailyService.delete(params.id)
            return { success: true }
        } catch (error) {
            set.status = 500
            return { success: false, error: 'Failed to delete task' }
        }
    }, {
        params: t.Object({
            id: t.String()
        })
    })
