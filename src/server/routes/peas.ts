import { prisma } from '@/lib/prisma'
import { Elysia, t } from 'elysia'

export const peasRoutes = new Elysia({ prefix: '/peas' })
  .get('/', async () => {
    try {
      const peas = await prisma.pea.findMany({
        include: {
          operationCenter: true,
        },
        orderBy: {
          shortname: 'asc',
        },
      })
      const serialized = JSON.parse(JSON.stringify(peas, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ))
      return { success: true, data: serialized }
    } catch {
      return { success: false, error: 'Failed to fetch peas' }
    }
  })
  .get('/:id', async ({ params, set }) => {
    try {
      const pea = await prisma.pea.findUnique({
        where: { id: BigInt(params.id) },
        include: {
          operationCenter: true,
        },
      })

      if (!pea) {
        set.status = 404
        return { success: false, error: 'Pea not found' }
      }

      const serialized = JSON.parse(JSON.stringify(pea, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ))
      return { success: true, data: serialized }
    } catch {
      return { success: false, error: 'Failed to fetch pea' }
    }
  }, {
    params: t.Object({
      id: t.String()
    })
  })
  .post('/', async ({ body, set }) => {
    try {
      const { shortname, fullname, operationId } = body as { shortname: string; fullname: string; operationId: string }
      const pea = await prisma.pea.create({
        data: {
          shortname,
          fullname,
          operationId: BigInt(operationId),
        },
      })
      const serialized = JSON.parse(JSON.stringify(pea, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ))
      return { success: true, data: serialized }
    } catch {
      set.status = 500
      return { success: false, error: 'Failed to create pea' }
    }
  }, {
    body: t.Object({
      shortname: t.String(),
      fullname: t.String(),
      operationId: t.String()
    })
  })
  .put('/:id', async ({ params, body, set }) => {
    try {
      const { shortname, fullname, operationId } = body as { shortname: string; fullname: string; operationId: string }
      const pea = await prisma.pea.update({
        where: { id: BigInt(params.id) },
        data: {
          shortname,
          fullname,
          operationId: BigInt(operationId),
        },
      })
      const serialized = JSON.parse(JSON.stringify(pea, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ))
      return { success: true, data: serialized }
    } catch {
      set.status = 500
      return { success: false, error: 'Failed to update pea' }
    }
  }, {
    params: t.Object({
      id: t.String()
    }),
    body: t.Object({
      shortname: t.String(),
      fullname: t.String(),
      operationId: t.String()
    })
  })
  .delete('/:id', async ({ params, set }) => {
    try {
      await prisma.pea.delete({
        where: { id: BigInt(params.id) },
      })
      return { success: true }
    } catch {
      set.status = 500
      return { success: false, error: 'Failed to delete pea' }
    }
  }, {
    params: t.Object({
      id: t.String()
    })
  })
  .post('/multiple', async ({ body, set }) => {
    try {
      const peasData = body as { shortname: string; fullname: string; operationId: string }[]

      // Check for duplicates logic (simplified for API)
      // In a real scenario, we might want to move the complex validation logic here or to a service.
      // For now, I'll just implement the basic creation.
      // But the original action had duplicate checking. I should probably include it.

      const existingPeas = await prisma.pea.findMany({
        select: { shortname: true }
      })
      const existingShortnameSet = new Set(existingPeas.map(p => p.shortname.toLowerCase()))

      const duplicates = peasData.filter(pea => existingShortnameSet.has(pea.shortname.toLowerCase()))

      if (duplicates.length > 0) {
        set.status = 400
        return { success: false, error: `Duplicate shortnames: ${duplicates.map(d => d.shortname).join(', ')}` }
      }

      const result = await prisma.$transaction(
        peasData.map(pea =>
          prisma.pea.create({
            data: {
              shortname: pea.shortname,
              fullname: pea.fullname,
              operationId: BigInt(pea.operationId),
            },
          })
        )
      )
      const serialized = JSON.parse(JSON.stringify(result, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ))
      return { success: true, data: serialized }

    } catch {
      set.status = 500
      return { success: false, error: 'Failed to create multiple peas' }
    }
  }, {
    body: t.Array(t.Object({
      shortname: t.String(),
      fullname: t.String(),
      operationId: t.String()
    }))
  })
