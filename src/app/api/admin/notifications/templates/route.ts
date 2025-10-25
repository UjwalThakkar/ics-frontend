import { NextRequest, NextResponse } from 'next/server'

// Mock notification templates for demo
const mockTemplates = [
  {
    id: 'template_1',
    name: 'Application Submitted',
    type: 'email',
    category: 'Application Status Updates',
    subject: 'Application Submitted Successfully',
    content: 'Dear {{applicantName}}, your application {{applicationId}} has been submitted successfully.',
    variables: ['applicantName', 'applicationId'],
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    usageCount: 45
  },
  {
    id: 'template_2',
    name: 'Application Approved',
    type: 'email',
    category: 'Application Status Updates',
    subject: 'Application Approved',
    content: 'Dear {{applicantName}}, your application {{applicationId}} has been approved and is ready for collection.',
    variables: ['applicantName', 'applicationId'],
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    usageCount: 32
  },
  {
    id: 'template_3',
    name: 'Appointment Reminder',
    type: 'sms',
    category: 'Appointment Reminders',
    subject: '',
    content: 'Reminder: You have an appointment on {{appointmentDate}} at {{appointmentTime}} for {{serviceType}}.',
    variables: ['appointmentDate', 'appointmentTime', 'serviceType'],
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    usageCount: 128
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
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const includeInactive = searchParams.get('includeInactive') === 'true'

    let filteredTemplates = [...mockTemplates]

    // Filter by type
    if (type && type !== 'all') {
      filteredTemplates = filteredTemplates.filter(template => template.type === type)
    }

    // Filter by category
    if (category && category !== 'all') {
      filteredTemplates = filteredTemplates.filter(template => template.category === category)
    }

    // Filter by active status
    if (!includeInactive) {
      filteredTemplates = filteredTemplates.filter(template => template.isActive)
    }

    return NextResponse.json({
      success: true,
      templates: filteredTemplates
    })

  } catch (error) {
    console.error('Templates fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Simulate authentication check
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, category, subject, content, variables, isActive } = body

    if (!name || !type || !content) {
      return NextResponse.json({ error: 'Name, type, and content are required' }, { status: 400 })
    }

    // Create new template (mock)
    const newTemplate = {
      id: `template_${Date.now()}`,
      name,
      type,
      category: category || 'General',
      subject: subject || '',
      content,
      variables: variables || [],
      isActive: isActive !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0
    }

    // Add to mock templates (in production, save to database)
    mockTemplates.push(newTemplate)

    return NextResponse.json({
      success: true,
      template: newTemplate,
      message: 'Template created successfully'
    })

  } catch (error) {
    console.error('Template creation error:', error)
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
    const { id, name, type, category, subject, content, variables, isActive } = body

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
    }

    // Find and update template (mock)
    const templateIndex = mockTemplates.findIndex(t => t.id === id)
    if (templateIndex === -1) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Update template
    const updatedTemplate = {
      ...mockTemplates[templateIndex],
      name: name || mockTemplates[templateIndex].name,
      type: type || mockTemplates[templateIndex].type,
      category: category || mockTemplates[templateIndex].category,
      subject: subject !== undefined ? subject : mockTemplates[templateIndex].subject,
      content: content || mockTemplates[templateIndex].content,
      variables: variables || mockTemplates[templateIndex].variables,
      isActive: isActive !== undefined ? isActive : mockTemplates[templateIndex].isActive,
      updatedAt: new Date().toISOString()
    }

    mockTemplates[templateIndex] = updatedTemplate

    return NextResponse.json({
      success: true,
      template: updatedTemplate,
      message: 'Template updated successfully'
    })

  } catch (error) {
    console.error('Template update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
