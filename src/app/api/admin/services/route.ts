import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth-middleware'
import { getClientIp } from '@/lib/utils'

// Mock services data for demo
const mockServices = [
  {
    serviceId: 'passport-renewal-expiry',
    title: 'Passport Renewal - Expiry',
    description: 'Renewal of passport due to expiry',
    category: 'passport',
    isActive: true,
    processingTime: '15-20 working days',
    fee: 'R2,500',
    requirements: ['Old passport', 'Passport application form', 'Photographs', 'Proof of residence'],
    created: '2025-01-01T00:00:00Z'
  },
  {
    serviceId: 'visa-application',
    title: 'Visa Application',
    description: 'Apply for various types of visas',
    category: 'visa',
    isActive: true,
    processingTime: '10-15 working days',
    fee: 'R1,800',
    requirements: ['Completed application form', 'Passport', 'Photographs', 'Supporting documents'],
    created: '2025-01-01T00:00:00Z'
  },
  {
    serviceId: 'oci-application',
    title: 'OCI Card Application',
    description: 'Overseas Citizen of India card application',
    category: 'oci',
    isActive: true,
    processingTime: '6-8 weeks',
    fee: 'R3,200',
    requirements: ['Application form', 'Indian passport copy', 'Current passport', 'Birth certificate'],
    created: '2025-01-01T00:00:00Z'
  }
]

// GET - Fetch all services
export async function GET(request: NextRequest) {
  try {
    const adminAuth = await verifyAdminToken(request)
    if (!adminAuth.success) {
      return NextResponse.json({ error: adminAuth.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    let services = mockServices
    if (!includeInactive) {
      services = services.filter(service => service.isActive)
    }

    return NextResponse.json({
      success: true,
      services
    })

  } catch (error) {
    console.error('Services fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new service
export async function POST(request: NextRequest) {
  try {
    const adminAuth = await verifyAdminToken(request)
    if (!adminAuth.success) {
      return NextResponse.json({ error: adminAuth.error }, { status: 401 })
    }

    const serviceData = await request.json()

    const newService = {
      ...serviceData,
      serviceId: `service-${Date.now()}`,
      created: new Date().toISOString(),
      isActive: true
    }

    // In a real implementation, this would save to database
    // For demo, we just return success
    console.log('Service created:', {
      action: 'SERVICE_CREATE',
      serviceId: newService.serviceId,
      adminId: adminAuth.user?.userId,
      ipAddress: getClientIp(request),
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      service: newService,
      message: 'Service created successfully'
    })

  } catch (error) {
    console.error('Service creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update service
export async function PUT(request: NextRequest) {
  try {
    const adminAuth = await verifyAdminToken(request)
    if (!adminAuth.success) {
      return NextResponse.json({ error: adminAuth.error }, { status: 401 })
    }

    const { serviceId, ...updateData } = await request.json()

    // In a real implementation, this would update in database
    console.log('Service updated:', {
      action: 'SERVICE_UPDATE',
      serviceId,
      adminId: adminAuth.user?.userId,
      ipAddress: getClientIp(request),
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Service updated successfully'
    })

  } catch (error) {
    console.error('Service update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete service
export async function DELETE(request: NextRequest) {
  try {
    const adminAuth = await verifyAdminToken(request)
    if (!adminAuth.success) {
      return NextResponse.json({ error: adminAuth.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')

    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 })
    }

    // In a real implementation, this would delete from database
    console.log('Service deleted:', {
      action: 'SERVICE_DELETE',
      serviceId,
      adminId: adminAuth.user?.userId,
      ipAddress: getClientIp(request),
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully'
    })

  } catch (error) {
    console.error('Service deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
