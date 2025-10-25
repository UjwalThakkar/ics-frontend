import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Simulate authentication check
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, recipients, subject, content, templateId, data } = body

    if (!type || !recipients || !content) {
      return NextResponse.json({ error: 'Type, recipients, and content are required' }, { status: 400 })
    }

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: 'Recipients must be a non-empty array' }, { status: 400 })
    }

    // Validate notification type
    const validTypes = ['email', 'sms', 'whatsapp', 'push']
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 })
    }

    // Mock sending process
    const notificationId = `NOT${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`

    // Simulate successful sending
    const results = recipients.map(recipient => ({
      recipient,
      status: 'sent',
      sentAt: new Date().toISOString(),
      notificationId: `${notificationId}_${recipient.replace(/[^a-zA-Z0-9]/g, '')}`
    }))

    return NextResponse.json({
      success: true,
      notificationId,
      message: `${type.toUpperCase()} notification sent successfully`,
      recipientCount: recipients.length,
      results,
      summary: {
        total: recipients.length,
        sent: recipients.length,
        failed: 0
      }
    })

  } catch (error) {
    console.error('Notification send error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
