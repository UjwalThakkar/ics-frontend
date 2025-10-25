import { NextRequest, NextResponse } from 'next/server'

// Mock data for demo (replace with real database queries in production)
export async function GET(request: NextRequest) {
  try {
    // Simulate authentication check
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mock statistics data
    const stats = {
      totalApplications: 1247,
      pendingApplications: 156,
      inProgressApplications: 89,
      readyForCollection: 45,
      completedApplications: 957,
      rejectedApplications: 23,
      todaySubmissions: 12,
      visitorCount: 2145,
      appointmentsToday: 18,
      averageProcessingTime: '2.3 weeks',
      totalRevenue: 245670,
      systemHealth: 'Healthy',
      activeNotifications: 3
    }

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
