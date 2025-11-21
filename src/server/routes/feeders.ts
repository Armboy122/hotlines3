import { prisma } from '@/lib/prisma'
import { Elysia, t } from 'elysia'

export const feedersRoutes = new Elysia({ prefix: '/feeders' })
  .get('/', async () => {
    try {
      const feeders = await prisma.feeder.findMany({
        include: {
          station: {
            include: {
              operationCenter: true,
            }
          },
          _count: {
            select: {
              tasks: true,
            }
          }
        },
        orderBy: {
          code: 'asc',
        },
      })
      // Serialize BigInt
      const serialized = JSON.parse(JSON.stringify(feeders, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ))
      return { success: true, data: serialized }
    } catch {
      return { success: false, error: 'Failed to fetch feeders' }
    }
  })
  .get('/:id', async ({ params, set }) => {
    try {
      const feeder = await prisma.feeder.findUnique({
        where: { id: BigInt(params.id) },
        include: {
          station: {
            include: {
              operationCenter: true,
            }
          },
          tasks: true,
        },
      })

      if (!feeder) {
        set.status = 404
        return { success: false, error: 'Feeder not found' }
      }

      const serialized = JSON.parse(JSON.stringify(feeder, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ))
      return { success: true, data: serialized }
    } catch {
      return { success: false, error: 'Failed to fetch feeder' }
    }
  }, {
    params: t.Object({
      id: t.String()
    })
  })
  .post('/', async ({ body, set }) => {
    try {
      const { code, stationId } = body
      const feeder = await prisma.feeder.create({
        data: {
          code,
          stationId: BigInt(stationId),
        },
      })
      const serialized = JSON.parse(JSON.stringify(feeder, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ))
      return { success: true, data: serialized }
    } catch {
      set.status = 500
      return { success: false, error: 'Failed to create feeder' }
    }
  }, {
    body: t.Object({
      code: t.String(),
      stationId: t.String()
    })
  })
  .put('/:id', async ({ params, body, set }) => {
    try {
      const { code, stationId } = body
      const feeder = await prisma.feeder.update({
        where: { id: BigInt(params.id) },
        data: {
          code,
          stationId: BigInt(stationId),
        },
      })
      const serialized = JSON.parse(JSON.stringify(feeder, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ))
      return { success: true, data: serialized }
    } catch {
      set.status = 500
      return { success: false, error: 'Failed to update feeder' }
    }
  }, {
    params: t.Object({
      id: t.String()
    }),
    body: t.Object({
      code: t.String(),
      stationId: t.String()
    })
  })
  .delete('/:id', async ({ params, set }) => {
    try {
      await prisma.feeder.delete({
        where: { id: BigInt(params.id) },
      })
      return { success: true }
    } catch {
      set.status = 500
      return { success: false, error: 'Failed to delete feeder' }
    }
  }, {
    params: t.Object({
      id: t.String()
    })
  })
