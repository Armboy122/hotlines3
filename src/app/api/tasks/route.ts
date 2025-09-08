import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/tasks - ดึงข้อมูลงานทั้งหมดจัดกลุ่มตามทีม
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('teamId')
    const workDate = searchParams.get('workDate')

    const where: Record<string, unknown> = {}

    if (teamId) {
      where.teamId = BigInt(teamId)
    }
    if (workDate) {
      where.workDate = new Date(workDate)
    }

    const taskDailies = await prisma.taskDaily.findMany({
      where,
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
      orderBy: [
        { team: { name: 'asc' } },
        { workDate: 'desc' },
      ],
    })

    // จัดกลุ่มตามทีม
    const groupedByTeam = taskDailies.reduce((acc, task) => {
      const teamName = task.team.name
      if (!acc[teamName]) {
        acc[teamName] = {
          team: {
            id: task.team.id.toString(),
            name: task.team.name,
          },
          tasks: [],
        }
      }
      acc[teamName].tasks.push({
        id: task.id.toString(),
        workDate: task.workDate.toISOString(),
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
          createdAt: task.jobDetail.createdAt.toISOString(),
          updatedAt: task.jobDetail.updatedAt.toISOString(),
          deletedAt: task.jobDetail.deletedAt?.toISOString() || null,
        },
        feeder: task.feeder ? {
          id: task.feeder.id.toString(),
          code: task.feeder.code,
          station: {
            name: task.feeder.station.name,
            operationCenter: {
              name: task.feeder.station.operationCenter.name,
            },
          },
        } : undefined,
        numPole: task.numPole || undefined,
        deviceCode: task.deviceCode || undefined,
        detail: task.detail || undefined,
        urlsBefore: task.urlsBefore || [],
        urlsAfter: task.urlsAfter || [],
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
        deletedAt: task.deletedAt?.toISOString() || null,
      })
      return acc
    }, {} as Record<string, { team: { id: string; name: string }; tasks: unknown[] }>)

    return NextResponse.json({ success: true, data: groupedByTeam })
  } catch (error) {
    console.error('Error fetching task dailies:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch task dailies' },
      { status: 500 }
    )
  }
}
