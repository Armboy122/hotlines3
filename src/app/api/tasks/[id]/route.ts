import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/tasks/[id] - ดึงข้อมูลงานเฉพาะ
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const taskDaily = await prisma.taskDaily.findUnique({
      where: { id: BigInt(id) },
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

    if (!taskDaily) {
      return NextResponse.json(
        { success: false, error: 'Task daily not found' },
        { status: 404 }
      )
    }

    // แปลงข้อมูลให้ตรงกับ interface
    const convertedData = {
      id: taskDaily.id.toString(),
      workDate: taskDaily.workDate.toISOString(),
      team: {
        id: taskDaily.team.id.toString(),
        name: taskDaily.team.name,
      },
      jobType: {
        id: taskDaily.jobType.id.toString(),
        name: taskDaily.jobType.name,
      },
      jobDetail: {
        id: taskDaily.jobDetail.id.toString(),
        name: taskDaily.jobDetail.name,
        createdAt: taskDaily.jobDetail.createdAt.toISOString(),
        updatedAt: taskDaily.jobDetail.updatedAt.toISOString(),
        deletedAt: taskDaily.jobDetail.deletedAt?.toISOString() || null,
      },
      feeder: taskDaily.feeder ? {
        id: taskDaily.feeder.id.toString(),
        code: taskDaily.feeder.code,
        station: {
          name: taskDaily.feeder.station.name,
          operationCenter: {
            name: taskDaily.feeder.station.operationCenter.name,
          },
        },
      } : undefined,
      numPole: taskDaily.numPole || undefined,
      deviceCode: taskDaily.deviceCode || undefined,
      detail: taskDaily.detail || undefined,
      urlsBefore: taskDaily.urlsBefore || [],
      urlsAfter: taskDaily.urlsAfter || [],
      createdAt: taskDaily.createdAt.toISOString(),
      updatedAt: taskDaily.updatedAt.toISOString(),
      deletedAt: taskDaily.deletedAt?.toISOString() || null,
    }

    return NextResponse.json({ success: true, data: convertedData })
  } catch (error) {
    console.error('Error fetching task daily:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch task daily' },
      { status: 500 }
    )
  }
}

// PUT /api/tasks/[id] - อัปเดตงาน
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      workDate,
      teamId,
      jobTypeId,
      jobDetailId,
      feederId,
      numPole,
      deviceCode,
      detail,
      urlsBefore,
      urlsAfter,
    } = body

    const taskDaily = await prisma.taskDaily.update({
      where: { id: BigInt(id) },
      data: {
        workDate: new Date(workDate),
        teamId: BigInt(teamId),
        jobTypeId: BigInt(jobTypeId),
        jobDetailId: BigInt(jobDetailId),
        feederId: feederId ? BigInt(feederId) : null,
        numPole: numPole || null,
        deviceCode: deviceCode || null,
        detail: detail || null,
        urlsBefore: urlsBefore || [],
        urlsAfter: urlsAfter || [],
      },
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

    // แปลงข้อมูลให้ตรงกับ interface
    const convertedData = {
      id: taskDaily.id.toString(),
      workDate: taskDaily.workDate.toISOString(),
      team: {
        id: taskDaily.team.id.toString(),
        name: taskDaily.team.name,
      },
      jobType: {
        id: taskDaily.jobType.id.toString(),
        name: taskDaily.jobType.name,
      },
      jobDetail: {
        id: taskDaily.jobDetail.id.toString(),
        name: taskDaily.jobDetail.name,
        createdAt: taskDaily.jobDetail.createdAt.toISOString(),
        updatedAt: taskDaily.jobDetail.updatedAt.toISOString(),
        deletedAt: taskDaily.jobDetail.deletedAt?.toISOString() || null,
      },
      feeder: taskDaily.feeder ? {
        id: taskDaily.feeder.id.toString(),
        code: taskDaily.feeder.code,
        station: {
          name: taskDaily.feeder.station.name,
          operationCenter: {
            name: taskDaily.feeder.station.operationCenter.name,
          },
        },
      } : undefined,
      numPole: taskDaily.numPole || undefined,
      deviceCode: taskDaily.deviceCode || undefined,
      detail: taskDaily.detail || undefined,
      urlsBefore: taskDaily.urlsBefore || [],
      urlsAfter: taskDaily.urlsAfter || [],
      createdAt: taskDaily.createdAt.toISOString(),
      updatedAt: taskDaily.updatedAt.toISOString(),
      deletedAt: taskDaily.deletedAt?.toISOString() || null,
    }

    return NextResponse.json({ success: true, data: convertedData })
  } catch (error) {
    console.error('Error updating task daily:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update task daily' },
      { status: 500 }
    )
  }
}

// DELETE /api/tasks/[id] - ลบงาน
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.taskDaily.delete({ where: { id: BigInt(id) } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task daily:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete task daily' },
      { status: 500 }
    )
  }
}
