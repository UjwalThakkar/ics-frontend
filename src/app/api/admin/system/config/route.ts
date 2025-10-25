import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken, verifySuperAdminToken } from '@/lib/auth-middleware'
import { getClientIp } from '@/lib/utils'

// Mock system configuration
const mockSystemConfig = {
  configId: 'system-config-2025',
  general: {
    siteName: 'Indian Consular Services',
    siteDescription: 'Official Consular Services for Indian Citizens',
    contactEmail: 'support@indianconsulate.com',
    contactPhone: '+27 11 895 0460',
    address: 'Johannesburg, South Africa',
    timezone: 'Africa/Johannesburg',
    language: 'en',
    currency: 'ZAR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h'
  },
  appearance: {
    theme: 'default',
    primaryColor: '#1e40af',
    secondaryColor: '#f97316',
    logo: '/images/logo.png',
    favicon: '/favicon.ico',
    backgroundImages: ['/images/bg1.jpg', '/images/bg2.jpg'],
    customCSS: ''
  },
  features: {
    onlineApplications: true,
    appointmentBooking: true,
    documentUpload: true,
    paymentGateway: true,
    notifications: true,
    multiLanguage: true,
    whatsappIntegration: true,
    analytics: true
  },
  security: {
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true
    },
    twoFactorAuth: false,
    ipWhitelist: [],
    rateLimiting: {
      enabled: true,
      maxRequests: 100,
      windowMinutes: 15
    }
  },
  integrations: {
    email: {
      provider: 'smtp',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      username: 'noreply@indianconsulate.com'
    },
    sms: {
      provider: 'twilio',
      enabled: false
    },
    payment: {
      provider: 'payfast',
      enabled: true,
      testMode: false
    },
    storage: {
      provider: 'local',
      maxFileSize: 10485760,
      allowedTypes: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx']
    }
  },
  lastUpdated: '2025-01-17T10:00:00Z',
  updatedBy: 'admin@consulate.gov.in'
}

// GET - Fetch system configuration
export async function GET(request: NextRequest) {
  try {
    const adminAuth = await verifyAdminToken(request)
    if (!adminAuth.success) {
      return NextResponse.json({ error: adminAuth.error }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      config: mockSystemConfig
    })

  } catch (error) {
    console.error('System config fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update system configuration
export async function PUT(request: NextRequest) {
  try {
    const superAdminAuth = await verifySuperAdminToken(request)
    if (!superAdminAuth.success) {
      return NextResponse.json({ error: superAdminAuth.error }, { status: 401 })
    }

    const configData = await request.json()

    console.log('System config updated:', {
      action: 'SYSTEM_CONFIG_UPDATE',
      adminId: superAdminAuth.user?.userId,
      ipAddress: getClientIp(request),
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'System configuration updated successfully'
    })

  } catch (error) {
    console.error('System config update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Reset configuration to defaults
export async function POST(request: NextRequest) {
  try {
    const superAdminAuth = await verifySuperAdminToken(request)
    if (!superAdminAuth.success) {
      return NextResponse.json({ error: superAdminAuth.error }, { status: 401 })
    }

    console.log('System config reset:', {
      action: 'SYSTEM_CONFIG_RESET',
      adminId: superAdminAuth.user?.userId,
      ipAddress: getClientIp(request),
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      config: mockSystemConfig,
      message: 'System configuration reset to defaults'
    })

  } catch (error) {
    console.error('System config reset error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
