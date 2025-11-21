import { Elysia, t } from 'elysia'
import { prisma } from '@/lib/prisma'

export const jobDetailsRoutes = new Elysia({ prefix: '/job-details' })
    .get('/', async () => {
        try {
            const jobDetails = await prisma.jobDetail.findMany({
                where: {
                    deletedAt: null,
                },
                include: {
                    _count: {
                        select: {
                            tasks: true,
                        }
                    }
                },
                orderBy: {
                    name: 'asc',
                },
            })
            const serialized = JSON.parse(JSON.stringify(jobDetails, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            ))
            return { success: true, data: serialized }
        } catch (error) {
            return { success: false, error: 'Failed to fetch job details' }
        }
    })
    .get('/:id', async ({ params, set }) => {
        try {
            const jobDetail = await prisma.jobDetail.findUnique({
                where: { id: BigInt(params.id) },
                include: {
                    tasks: true,
                },
            })

            if (!jobDetail || jobDetail.deletedAt) {
                set.status = 404
                return { success: false, error: 'Job detail not found' }
            }

            const serialized = JSON.parse(JSON.stringify(jobDetail, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            ))
            return { success: true, data: serialized }
        } catch (error) {
            return { success: false, error: 'Failed to fetch job detail' }
        }
    }, {
        params: t.Object({
            id: t.String()
        })
    })
    .post('/', async ({ body, set }) => {
        try {
            const { name } = body as { name: string }
            const jobDetail = await prisma.jobDetail.create({
                data: {
                    name,
                },
            })
            const serialized = JSON.parse(JSON.stringify(jobDetail, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            ))
            return { success: true, data: serialized }
        } catch (error) {
            set.status = 500
            return { success: false, error: 'Failed to create job detail' }
        }
    }, {
        body: t.Object({
            name: t.String()
        })
    })
    .put('/:id', async ({ params, body, set }) => {
        try {
            const { name } = body as { name: string }
            const jobDetail = await prisma.jobDetail.update({
                where: { id: BigInt(params.id) },
                data: {
                    name,
                },
            })
            const serialized = JSON.parse(JSON.stringify(jobDetail, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            ))
            return { success: true, data: serialized }
        } catch (error) {
            set.status = 500
            return { success: false, error: 'Failed to update job detail' }
        }
    }, {
        params: t.Object({
            id: t.String()
        }),
        body: t.Object({
            name: t.String()
        })
    })
    .delete('/:id', async ({ params, set }) => {
        try {
            // Soft delete
            await prisma.jobDetail.update({
                where: { id: BigInt(params.id) },
                data: {
                    deletedAt: new Date(),
                },
            })
            return { success: true }
        } catch (error) {
            set.status = 500
            return { success: false, error: 'Failed to delete job detail' }
        }
    }, {
        params: t.Object({
            id: t.String()
        })
    })
    .post('/:id/restore', async ({ params, set }) => {
        try {
            await prisma.jobDetail.update({
                where: { id: BigInt(params.id) },
                data: {
                    deletedAt: null,
                },
            })
            return { success: true }
        } catch (error) {
            set.status = 500
            return { success: false, error: 'Failed to restore job detail' }
        }
    }, {
        params: t.Object({
            id: t.String()
        })
    })
