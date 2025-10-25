import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { verifyAdminToken } from '@/lib/auth-middleware'
import mongoose from 'mongoose'

export async function GET(request: NextRequest) {
  try {
    const adminAuth = await verifyAdminToken(request)
    if (!adminAuth.success) {
      return NextResponse.json({ error: adminAuth.error }, { status: 401 })
    }

    await connectDB()

    // Get system uptime
    const uptime = process.uptime()
    const uptimeHours = Math.floor(uptime / 3600)
    const uptimeMinutes = Math.floor((uptime % 3600) / 60)
    const uptimeString = `${uptimeHours}h ${uptimeMinutes}m`

    // Get memory usage
    const memoryUsage = process.memoryUsage()
    const memoryUsagePercent = Math.floor((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)

    // Mock CPU and disk usage (in a real app, you'd get this from system monitoring)
    const cpuUsage = Math.floor(Math.random() * 30) + 10 // 10-40%
    const diskUsage = Math.floor(Math.random() * 20) + 60 // 60-80%

    // Test database connection
    let databaseStatus = 'healthy'
    let databaseConnections = 0
    let databaseResponseTime = 0

    try {
      const startTime = Date.now()
      await mongoose.connection.db.admin().ping()
      databaseResponseTime = Date.now() - startTime

      // Get connection count (simplified)
      databaseConnections = mongoose.connections.length

      if (databaseResponseTime > 1000) {
        databaseStatus = 'warning'
      }
    } catch (error) {
      databaseStatus = 'error'
    }

    // Test external services
    const services = {
      email: 'active', // Would test SMTP connection
      sms: 'active',   // Would test SMS API
      storage: 'active', // Would test file storage
      backup: 'active'   // Would check backup status
    }

    // Check if any critical issues
    let serverStatus = 'healthy'
    if (cpuUsage > 80 || memoryUsagePercent > 90 || diskUsage > 90) {
      serverStatus = 'warning'
    }
    if (databaseStatus === 'error') {
      serverStatus = 'error'
    }

    const systemStatus = {
      server: {
        status: serverStatus,
        uptime: uptimeString,
        cpu: cpuUsage,
        memory: memoryUsagePercent,
        disk: diskUsage
      },
      database: {
        status: databaseStatus,
        connections: databaseConnections,
        responseTime: databaseResponseTime
      },
      services
    }

    return NextResponse.json({
      success: true,
      status: systemStatus
    })

  } catch (error) {
    console.error('System status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
