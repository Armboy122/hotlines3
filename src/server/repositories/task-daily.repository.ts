import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export const taskDailyRepository = {
  create: async (data: Prisma.TaskDailyUncheckedCreateInput) => {
    return prisma.taskDaily.create({
      data,
      include: {
        team: true,
        jobType: true,
        jobDetail: true,
        feeder: {
          include: {
            station: true,
          },
        },
      },
    })
  },

  findMany: async (args?: Prisma.TaskDailyFindManyArgs) => {
    return prisma.taskDaily.findMany({
      ...args,
      include: {
        team: true,
        jobType: true,
        jobDetail: true,
        feeder: {
          include: {
            station: true,
          },
        },
      },
    })
  },

  findById: async (id: string) => {
    return prisma.taskDaily.findUnique({
      where: { id: BigInt(id) },
      include: {
        team: true,
        jobType: true,
        jobDetail: true,
        feeder: {
          include: {
            station: true,
          },
        },
      },
    })
  },

  update: async (id: string, data: Prisma.TaskDailyUncheckedUpdateInput) => {
    return prisma.taskDaily.update({
      where: { id: BigInt(id) },
      data,
      include: {
        team: true,
        jobType: true,
        jobDetail: true,
        feeder: {
          include: {
            station: true,
          },
        },
      },
    })
  },

  delete: async (id: string) => {
    return prisma.taskDaily.delete({
      where: { id: BigInt(id) },
    })
  },
  
  // Specialized query for filter
  findManyWithNestedRelations: async (args: Prisma.TaskDailyFindManyArgs) => {
    return prisma.taskDaily.findMany({
        ...args,
        include: {
          team: true,
          jobType: true,
          jobDetail: true,
          feeder: {
            include: {
              station: {
                include: {
                  operationCenter: true,
                },
              },
            },
          },
        },
    })
  }
}

