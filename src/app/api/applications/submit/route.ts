import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

// In-memory storage for demo (replace with database in production)
const applications: any[] = []

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Extract form fields
    const applicationData = {
      serviceType: formData.get('serviceType') as string,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      dateOfBirth: formData.get('dateOfBirth') as string,
      nationality: formData.get('nationality') as string,
      address: formData.get('address') as string,
      preferredNotification: formData.get('preferredNotification') as string || 'email'
    }

    // Validate required fields
    if (!applicationData.serviceType || !applicationData.firstName || !applicationData.lastName || !applicationData.email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(applicationData.email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Generate unique application ID
    const applicationId = `ICS${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`

    // Calculate expected completion date (demo)
    const expectedCompletionDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    // Create application record (in-memory for demo)
    const application = {
      applicationId,
      serviceType: applicationData.serviceType,
      status: 'submitted',
      applicantInfo: {
        firstName: applicationData.firstName,
        lastName: applicationData.lastName,
        email: applicationData.email,
        phone: applicationData.phone,
        dateOfBirth: applicationData.dateOfBirth,
        nationality: applicationData.nationality,
        address: applicationData.address,
        preferredNotification: applicationData.preferredNotification
      },
      timeline: [{
        status: 'submitted',
        timestamp: new Date(),
        notes: 'Application submitted successfully'
      }],
      expectedCompletionDate,
      submittedAt: new Date(),
      lastUpdated: new Date()
    }

    // Store in memory (replace with database in production)
    applications.push(application)

    return NextResponse.json({
      success: true,
      applicationId,
      message: 'Application submitted successfully',
      expectedCompletion: expectedCompletionDate,
      status: 'submitted'
    })

  } catch (error) {
    console.error('Application submission error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET method for tracking applications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const applicationId = searchParams.get('id')

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 })
    }

    // Find application in memory storage
    const application = applications.find(app => app.applicationId === applicationId)

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      application
    })

  } catch (error) {
    console.error('Application tracking error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
