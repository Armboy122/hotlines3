import { prisma } from '@/lib/prisma'
import { Elysia, t } from 'elysia'

export const stationsRoutes = new Elysia({ prefix: '/stations' })
  .get('/', async () => {
    try {
      const stations = await prisma.station.findMany({
        include: {
          operationCenter: true,
          _count: {
            select: {
              feeders: true,
            }
          }
        },
        orderBy: {
          codeName: 'asc',
        },
      })
      const serialized = JSON.parse(JSON.stringify(stations, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ))
      return { success: true, data: serialized }
    } catch {
      return { success: false, error: 'Failed to fetch stations' }
    }
  })
  .get('/:id', async ({ params, set }) => {
    try {
      const station = await prisma.station.findUnique({
        where: { id: BigInt(params.id) },
        include: {
          operationCenter: true,
          feeders: true,
        },
      })

      if (!station) {
        set.status = 404
        return { success: false, error: 'Station not found' }
      }

      const serialized = JSON.parse(JSON.stringify(station, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ))
      return { success: true, data: serialized }
    } catch {
      return { success: false, error: 'Failed to fetch station' }
    }
  }, {
    params: t.Object({
      id: t.String()
    })
  })
  .post('/', async ({ body, set }) => {
    try {
      const { name, codeName, operationId } = body as { name: string; codeName: string; operationId: string }
      const station = await prisma.station.create({
        data: {
          name,
          codeName,
          operationId: BigInt(operationId),
        },
      })
      const serialized = JSON.parse(JSON.stringify(station, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ))
      return { success: true, data: serialized }
    } catch {
      set.status = 500
      return { success: false, error: 'Failed to create station' }
    }
  }, {
    body: t.Object({
      name: t.String(),
      codeName: t.String(),
      operationId: t.String()
    })
  })
  .put('/:id', async ({ params, body, set }) => {
    try {
      const { name, codeName, operationId } = body as { name: string; codeName: string; operationId: string }
      const station = await prisma.station.update({
        where: { id: BigInt(params.id) },
        data: {
          name,
          codeName,
          operationId: BigInt(operationId),
        },
      })
      const serialized = JSON.parse(JSON.stringify(station, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ))
      return { success: true, data: serialized }
    } catch {
      set.status = 500
      return { success: false, error: 'Failed to update station' }
    }
  }, {
    params: t.Object({
      id: t.String()
    }),
    body: t.Object({
      name: t.String(),
      codeName: t.String(),
      operationId: t.String()
    })
  })
  .delete('/:id', async ({ params, set }) => {
    try {
      await prisma.station.delete({
        where: { id: BigInt(params.id) },
      })
      return { success: true }
    } catch {
      set.status = 500
      return { success: false, error: 'Failed to delete station' }
    }
  }, {
    params: t.Object({
      id: t.String()
    })
  })
