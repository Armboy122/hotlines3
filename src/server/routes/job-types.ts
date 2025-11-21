import { prisma } from '@/lib/prisma'
import { Elysia, t } from 'elysia'

export const jobTypesRoutes = new Elysia({ prefix: '/job-types' })
  .get('/', async () => {
    try {
      const jobTypes = await prisma.jobType.findMany({
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
      const serialized = JSON.parse(JSON.stringify(jobTypes, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ))
      return { success: true, data: serialized }
    } catch {
      return { success: false, error: 'Failed to fetch job types' }
    }
  })
  .get('/:id', async ({ params, set }) => {
    try {
      const jobType = await prisma.jobType.findUnique({
        where: { id: BigInt(params.id) },
        include: {
          tasks: true,
        },
      })

      if (!jobType) {
        set.status = 404
        return { success: false, error: 'Job type not found' }
      }

      const serialized = JSON.parse(JSON.stringify(jobType, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ))
      return { success: true, data: serialized }
    } catch {
      return { success: false, error: 'Failed to fetch job type' }
    }
  }, {
    params: t.Object({
      id: t.String()
    })
  })
  .post('/', async ({ body, set }) => {
    try {
      const { name } = body as { name: string }
      const jobType = await prisma.jobType.create({
        data: {
          name,
        },
      })
      const serialized = JSON.parse(JSON.stringify(jobType, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ))
      return { success: true, data: serialized }
    } catch {
      set.status = 500
      return { success: false, error: 'Failed to create job type' }
    }
  }, {
    body: t.Object({
      name: t.String()
    })
  })
  .put('/:id', async ({ params, body, set }) => {
    try {
      const { name } = body as { name: string }
      const jobType = await prisma.jobType.update({
        where: { id: BigInt(params.id) },
        data: {
          name,
        },
      })
      const serialized = JSON.parse(JSON.stringify(jobType, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ))
      return { success: true, data: serialized }
    } catch {
      set.status = 500
      return { success: false, error: 'Failed to update job type' }
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
      await prisma.jobType.delete({
        where: { id: BigInt(params.id) },
      })
      return { success: true }
    } catch {
      set.status = 500
      return { success: false, error: 'Failed to delete job type' }
    }
  }, {
    params: t.Object({
      id: t.String()
    })
  })
