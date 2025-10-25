import { NextRequest, NextResponse } from 'next/server'
import connectDB, { Application, User, Notification, AdminLog } from '@/lib/database'
import { verifyAdminToken } from '@/lib/auth-middleware'
import { getClientIp } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const adminAuth = await verifyAdminToken(request)
    if (!adminAuth.success) {
      return NextResponse.json({ error: adminAuth.error }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const dateRange = searchParams.get('dateRange') || 'last7days'
    const serviceType = searchParams.get('serviceType') || 'all'

    // Calculate date range
    const now = new Date()
    let startDate: Date
    let endDate = now

    switch (dateRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'yesterday':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'last7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'last30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'last90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // Build filters
    const dateFilter = {
      submittedAt: { $gte: startDate, $lte: endDate }
    }

    const serviceFilter = serviceType !== 'all' ? { serviceType } : {}

    // Fetch visitor analytics
    const [
      totalApplications,
      processedApplications,
      completedApplications,
      rejectedApplications,
      previousPeriodApplications
    ] = await Promise.all([
      Application.countDocuments({ ...dateFilter, ...serviceFilter }),
      Application.countDocuments({ ...dateFilter, ...serviceFilter, status: { $in: ['in-progress', 'ready-for-collection'] } }),
      Application.countDocuments({ ...dateFilter, ...serviceFilter, status: 'completed' }),
      Application.countDocuments({ ...dateFilter, ...serviceFilter, status: 'rejected' }),
      Application.countDocuments({
        submittedAt: {
          $gte: new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime())),
          $lt: startDate
        },
        ...serviceFilter
      })
    ])

    // Calculate trends
    const applicationsTrend = previousPeriodApplications > 0
      ? ((totalApplications - previousPeriodApplications) / previousPeriodApplications) * 100
      : 0

    // Service distribution
    const serviceDistribution = await Application.aggregate([
      { $match: { ...dateFilter, ...serviceFilter } },
      {
        $group: {
          _id: '$serviceType',
          count: { $sum: 1 },
          revenue: { $sum: '$fees.amount' }
        }
      },
      { $sort: { count: -1 } }
    ])

    const services: { [key: string]: any } = {}
    serviceDistribution.forEach(service => {
      services[service._id] = {
        name: service._id.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        count: service.count,
        revenue: service.revenue || 0,
        trend: Math.random() * 20 - 10 // Mock trend data
      }
    })

    // Hourly traffic distribution
    const hourlyTraffic = await Application.aggregate([
      { $match: { ...dateFilter, ...serviceFilter } },
      {
        $group: {
          _id: { $hour: '$submittedAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ])

    const timeSlots: { [key: string]: number } = {}
    for (let hour = 9; hour <= 17; hour++) {
      timeSlots[hour.toString()] = 0
    }
    hourlyTraffic.forEach(slot => {
      if (slot._id >= 9 && slot._id <= 17) {
        timeSlots[slot._id.toString()] = slot.count
      }
    })

    // Performance metrics
    const performanceData = await Application.aggregate([
      { $match: { ...dateFilter, ...serviceFilter, status: 'completed' } },
      {
        $project: {
          processingTime: {
            $divide: [
              { $subtract: ['$lastUpdated', '$submittedAt'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgProcessingTime: { $avg: '$processingTime' },
          count: { $sum: 1 }
        }
      }
    ])

    // Notification analytics
    const notificationStats = await Promise.all([
      Notification.countDocuments({ createdAt: dateFilter.submittedAt, method: 'email' }),
      Notification.countDocuments({ createdAt: dateFilter.submittedAt, method: 'sms' }),
      Notification.countDocuments({ createdAt: dateFilter.submittedAt, method: 'whatsapp' }),
      Notification.countDocuments({ createdAt: dateFilter.submittedAt, method: 'email', status: 'sent' }),
      Notification.countDocuments({ createdAt: dateFilter.submittedAt, method: 'sms', status: 'sent' }),
      Notification.countDocuments({ createdAt: dateFilter.submittedAt, method: 'whatsapp', status: 'sent' })
    ])

    // Mock data for some metrics that would come from other systems
    const analytics = {
      visitors: {
        total: Math.floor(totalApplications * 1.3), // Estimate visitors from applications
        appointment: Math.floor(totalApplications * 0.8),
        walkIn: Math.floor(totalApplications * 0.5),
        returning: Math.floor(totalApplications * 0.3),
        trend: applicationsTrend
      },
      applications: {
        submitted: totalApplications,
        processed: processedApplications,
        completed: completedApplications,
        rejected: rejectedApplications,
        trend: applicationsTrend
      },
      performance: {
        avgWaitTime: Math.floor(Math.random() * 30) + 10, // Mock wait time 10-40 mins
        avgProcessingTime: performanceData[0]?.avgProcessingTime || 0,
        satisfactionScore: 4.2 + (Math.random() * 0.6), // Mock satisfaction 4.2-4.8
        efficiency: Math.floor(85 + Math.random() * 10) // Mock efficiency 85-95%
      },
      devices: {
        desktop: Math.floor(totalApplications * 0.6),
        mobile: Math.floor(totalApplications * 0.35),
        tablet: Math.floor(totalApplications * 0.05)
      },
      services,
      timeSlots,
      notifications: {
        email: {
          sent: notificationStats[0],
          delivered: notificationStats[3],
          opened: Math.floor(notificationStats[3] * 0.7) // Mock open rate
        },
        sms: {
          sent: notificationStats[1],
          delivered: notificationStats[4]
        },
        whatsapp: {
          sent: notificationStats[2],
          delivered: notificationStats[5],
          read: Math.floor(notificationStats[5] * 0.9) // Mock read rate
        }
      },
      geography: {
        'Johannesburg': Math.floor(totalApplications * 0.4),
        'Cape Town': Math.floor(totalApplications * 0.25),
        'Durban': Math.floor(totalApplications * 0.15),
        'Pretoria': Math.floor(totalApplications * 0.1),
        'Other': Math.floor(totalApplications * 0.1)
      }
    }

    // Log admin activity
    await AdminLog.create({
      adminId: adminAuth.user.userId,
      action: 'VIEW_ANALYTICS',
      details: { dateRange, serviceType },
      ipAddress: getClientIp(request),
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({
      success: true,
      analytics
    })

  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
