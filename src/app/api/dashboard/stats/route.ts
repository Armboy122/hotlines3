import { NextRequest, NextResponse } from 'next/server'
import { dashboardService } from '@/server/services/dashboard.service'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const startDateParam = searchParams.get('startDate')
        const endDateParam = searchParams.get('endDate')
        const teamId = searchParams.get('teamId') || undefined
        const feederId = searchParams.get('feederId') || undefined

        const startDate = startDateParam ? new Date(startDateParam) : undefined
        const endDate = endDateParam ? new Date(endDateParam) : undefined

        const data = await dashboardService.getDashboardStats({
            startDate,
            endDate,
            teamId,
            feederId
        })

        return NextResponse.json({ success: true, data })
    } catch (error) {
        console.error('Error in dashboard stats API:', error)
        return NextResponse.json({ success: false, error: 'Failed to fetch dashboard stats' }, { status: 500 })
    }
}
