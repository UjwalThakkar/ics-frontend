import { NextRequest, NextResponse } from 'next/server'
import connectDB, { Application, User } from '@/lib/database'
import { verifyAdminToken } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    const adminAuth = await verifyAdminToken(request)
    if (!adminAuth.success) {
      return NextResponse.json({ error: adminAuth.error }, { status: 401 })
    }

    await connectDB()

    // Generate system alerts based on various conditions
    const alerts = []

    // Check for pending applications older than 7 days
    const oldPendingApps = await Application.countDocuments({
      status: 'submitted',
      submittedAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    })

    if (oldPendingApps > 0) {
      alerts.push({
        id: 'old-pending-apps',
        type: 'warning',
        message: `${oldPendingApps} applications have been pending for more than 7 days`,
        timestamp: new Date().toISOString()
      })
    }

    // Check for high volume of applications today
    const todayApps = await Application.countDocuments({
      submittedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    })

    if (todayApps > 50) {
      alerts.push({
        id: 'high-volume',
        type: 'info',
        message: `High application volume today: ${todayApps} applications submitted`,
        timestamp: new Date().toISOString()
      })
    }

    // Check for inactive admin users
    const inactiveAdmins = await User.countDocuments({
      role: { $in: ['admin', 'super-admin'] },
      lastLogin: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    })

    if (inactiveAdmins > 0) {
      alerts.push({
        id: 'inactive-admins',
        type: 'warning',
        message: `${inactiveAdmins} admin users haven't logged in for 30+ days`,
        timestamp: new Date().toISOString()
      })
    }

    // System maintenance reminder (example)
    const lastMaintenanceDate = new Date('2024-01-01') // This would come from system config
    const daysSinceLastMaintenance = Math.floor(
      (Date.now() - lastMaintenanceDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSinceLastMaintenance > 30) {
      alerts.push({
        id: 'maintenance-due',
        type: 'info',
        message: `System maintenance is due (${daysSinceLastMaintenance} days since last maintenance)`,
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json({
      success: true,
      alerts
    })

  } catch (error) {
    console.error('System alerts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
