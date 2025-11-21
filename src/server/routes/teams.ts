import { Elysia, t } from 'elysia'
import { prisma } from '@/lib/prisma'

export const teamsRoutes = new Elysia({ prefix: '/teams' })
    .get('/', async () => {
        try {
            const teams = await prisma.team.findMany({
                orderBy: { name: 'asc' },
            })
            const serialized = JSON.parse(JSON.stringify(teams, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            ))
            return { success: true, data: serialized }
        } catch (error) {
            return { success: false, error: 'Failed to fetch teams' }
        }
    })
    .get('/:id', async ({ params, set }) => {
        try {
            const team = await prisma.team.findUnique({
                where: { id: BigInt(params.id) },
            })

            if (!team) {
                set.status = 404
                return { success: false, error: 'Team not found' }
            }

            const serialized = JSON.parse(JSON.stringify(team, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            ))
            return { success: true, data: serialized }
        } catch (error) {
            return { success: false, error: 'Failed to fetch team' }
        }
    }, {
        params: t.Object({
            id: t.String()
        })
    })
    .post('/', async ({ body, set }) => {
        try {
            const { name } = body as { name: string }
            const team = await prisma.team.create({
                data: {
                    name,
                },
            })
            const serialized = JSON.parse(JSON.stringify(team, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            ))
            return { success: true, data: serialized }
        } catch (error) {
            set.status = 500
            return { success: false, error: 'Failed to create team' }
        }
    }, {
        body: t.Object({
            name: t.String()
        })
    })
    .put('/:id', async ({ params, body, set }) => {
        try {
            const { name } = body as { name: string }
            const team = await prisma.team.update({
                where: { id: BigInt(params.id) },
                data: {
                    name,
                },
            })
            const serialized = JSON.parse(JSON.stringify(team, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            ))
            return { success: true, data: serialized }
        } catch (error) {
            set.status = 500
            return { success: false, error: 'Failed to update team' }
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
            await prisma.team.delete({
                where: { id: BigInt(params.id) },
            })
            return { success: true }
        } catch (error) {
            set.status = 500
            return { success: false, error: 'Failed to delete team' }
        }
    }, {
        params: t.Object({
            id: t.String()
        })
    })
