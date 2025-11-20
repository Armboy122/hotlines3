import { NextRequest, NextResponse } from 'next/server'
import { dashboardService } from '@/server/services/dashboard.service'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined
        const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : undefined
        const teamId = searchParams.get('teamId') || undefined
        const jobTypeId = searchParams.get('jobTypeId') || undefined

        const data = await dashboardService.getDashboardSummary(year, month, teamId, jobTypeId)
        return NextResponse.json({ success: true, data })
    } catch (error) {
        console.error('Error in dashboard summary API:', error)
        return NextResponse.json({ success: false, error: 'Failed to fetch dashboard summary' }, { status: 500 })
    }
}
