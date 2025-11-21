import { Elysia, t } from 'elysia'
import { prisma } from '@/lib/prisma'

export const operationCentersRoutes = new Elysia({ prefix: '/operation-centers' })
    .get('/', async () => {
        try {
            const operationCenters = await prisma.operationCenter.findMany({
                include: {
                    _count: {
                        select: {
                            peas: true,
                            stations: true,
                        }
                    }
                },
                orderBy: {
                    name: 'asc',
                },
            })
            const serialized = JSON.parse(JSON.stringify(operationCenters, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            ))
            return { success: true, data: serialized }
        } catch (error) {
            return { success: false, error: 'Failed to fetch operation centers' }
        }
    })
    .get('/:id', async ({ params, set }) => {
        try {
            const operationCenter = await prisma.operationCenter.findUnique({
                where: { id: BigInt(params.id) },
                include: {
                    peas: true,
                    stations: true,
                },
            })

            if (!operationCenter) {
                set.status = 404
                return { success: false, error: 'Operation center not found' }
            }

            const serialized = JSON.parse(JSON.stringify(operationCenter, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            ))
            return { success: true, data: serialized }
        } catch (error) {
            return { success: false, error: 'Failed to fetch operation center' }
        }
    }, {
        params: t.Object({
            id: t.String()
        })
    })
    .post('/', async ({ body, set }) => {
        try {
            const { name } = body as { name: string }
            const operationCenter = await prisma.operationCenter.create({
                data: {
                    name,
                },
            })
            const serialized = JSON.parse(JSON.stringify(operationCenter, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            ))
            return { success: true, data: serialized }
        } catch (error) {
            set.status = 500
            return { success: false, error: 'Failed to create operation center' }
        }
    }, {
        body: t.Object({
            name: t.String()
        })
    })
    .put('/:id', async ({ params, body, set }) => {
        try {
            const { name } = body as { name: string }
            const operationCenter = await prisma.operationCenter.update({
                where: { id: BigInt(params.id) },
                data: {
                    name,
                },
            })
            const serialized = JSON.parse(JSON.stringify(operationCenter, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            ))
            return { success: true, data: serialized }
        } catch (error) {
            set.status = 500
            return { success: false, error: 'Failed to update operation center' }
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
            await prisma.operationCenter.delete({
                where: { id: BigInt(params.id) },
            })
            return { success: true }
        } catch (error) {
            set.status = 500
            return { success: false, error: 'Failed to delete operation center' }
        }
    }, {
        params: t.Object({
            id: t.String()
        })
    })
