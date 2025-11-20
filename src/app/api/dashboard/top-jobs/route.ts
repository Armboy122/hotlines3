import { NextRequest, NextResponse } from 'next/server'
import { dashboardService } from '@/server/services/dashboard.service'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10

        const data = await dashboardService.getTopJobDetails(year, limit)
        return NextResponse.json({ success: true, data })
    } catch (error) {
        console.error('Error in top job details API:', error)
        return NextResponse.json({ success: false, error: 'Failed to fetch top job details' }, { status: 500 })
    }
}
