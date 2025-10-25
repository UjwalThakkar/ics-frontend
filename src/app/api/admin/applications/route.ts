import { NextRequest, NextResponse } from 'next/server'

// Mock applications data for demo
const mockApplications = [
  {
    applicationId: 'ICS2025001234',
    applicantInfo: {
      firstName: 'Rajesh',
      lastName: 'Kumar',
      email: 'rajesh.kumar@email.com',
      phone: '+27 123 456 789'
    },
    serviceType: 'passport-renewal-expiry',
    status: 'in-progress',
    submittedAt: '2025-01-15T10:30:00Z',
    lastUpdated: '2025-01-16T14:20:00Z',
    processingNotes: 'Documents verified, processing in progress',
    timeline: [
      {
        status: 'submitted',
        timestamp: '2025-01-15T10:30:00Z',
        notes: 'Application submitted successfully',
        updatedBy: 'SYSTEM'
      },
      {
        status: 'in-progress',
        timestamp: '2025-01-16T14:20:00Z',
        notes: 'Documents verified, processing started',
        updatedBy: 'ADMIN001'
      }
    ]
  },
  {
    applicationId: 'ICS2025001235',
    applicantInfo: {
      firstName: 'Priya',
      lastName: 'Sharma',
      email: 'priya.sharma@email.com',
      phone: '+27 987 654 321'
    },
    serviceType: 'visa-application',
    status: 'ready-for-collection',
    submittedAt: '2025-01-10T09:15:00Z',
    lastUpdated: '2025-01-17T11:45:00Z',
    processingNotes: 'Visa approved, ready for collection',
    timeline: [
      {
        status: 'submitted',
        timestamp: '2025-01-10T09:15:00Z',
        notes: 'Application submitted successfully',
        updatedBy: 'SYSTEM'
      },
      {
        status: 'in-progress',
        timestamp: '2025-01-12T10:00:00Z',
        notes: 'Documents under review',
        updatedBy: 'ADMIN002'
      },
      {
        status: 'ready-for-collection',
        timestamp: '2025-01-17T11:45:00Z',
        notes: 'Visa approved and ready for collection',
        updatedBy: 'ADMIN001'
      }
    ]
  },
  {
    applicationId: 'ICS2025001236',
    applicantInfo: {
      firstName: 'Anil',
      lastName: 'Patel',
      email: 'anil.patel@email.com',
      phone: '+27 555 123 456'
    },
    serviceType: 'oci-services',
    status: 'submitted',
    submittedAt: '2025-01-17T15:22:00Z',
    lastUpdated: '2025-01-17T15:22:00Z',
    processingNotes: 'Application received, pending initial review',
    timeline: [
      {
        status: 'submitted',
        timestamp: '2025-01-17T15:22:00Z',
        notes: 'Application submitted successfully',
        updatedBy: 'SYSTEM'
      }
    ]
  }
]

export async function GET(request: NextRequest) {
  try {
    // Simulate authentication check
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // Filter applications
    let filteredApplications = [...mockApplications]

    if (status && status !== 'all') {
      filteredApplications = filteredApplications.filter(app => app.status === status)
    }

    if (search) {
      filteredApplications = filteredApplications.filter(app =>
        app.applicationId.toLowerCase().includes(search.toLowerCase()) ||
        app.applicantInfo.firstName.toLowerCase().includes(search.toLowerCase()) ||
        app.applicantInfo.lastName.toLowerCase().includes(search.toLowerCase()) ||
        app.applicantInfo.email.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Pagination
    const total = filteredApplications.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const applications = filteredApplications.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    })

  } catch (error) {
    console.error('Applications fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Simulate authentication check
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { applicationId, status, notes } = body

    if (!applicationId || !status) {
      return NextResponse.json({ error: 'Application ID and status are required' }, { status: 400 })
    }

    // Find and update application (mock update)
    const appIndex = mockApplications.findIndex(app => app.applicationId === applicationId)

    if (appIndex === -1) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Update the application
    mockApplications[appIndex].status = status
    mockApplications[appIndex].lastUpdated = new Date().toISOString()
    mockApplications[appIndex].processingNotes = notes || mockApplications[appIndex].processingNotes

    // Add timeline entry
    mockApplications[appIndex].timeline.push({
      status,
      timestamp: new Date().toISOString(),
      notes: notes || `Status updated to ${status}`,
      updatedBy: 'ADMIN001'
    })

    return NextResponse.json({
      success: true,
      message: 'Application updated successfully'
    })

  } catch (error) {
    console.error('Application update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
