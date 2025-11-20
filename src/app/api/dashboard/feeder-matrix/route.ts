import { NextRequest, NextResponse } from 'next/server'
import { dashboardService } from '@/server/services/dashboard.service'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const feederId = searchParams.get('feederId')
        const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined

        if (!feederId) {
            return NextResponse.json({ success: false, error: 'Feeder ID is required' }, { status: 400 })
        }

        const data = await dashboardService.getFeederJobMatrix(feederId, year)
        return NextResponse.json({ success: true, data })
    } catch (error) {
        console.error('Error in feeder job matrix API:', error)
        return NextResponse.json({ success: false, error: 'Failed to fetch feeder job matrix' }, { status: 500 })
    }
}
