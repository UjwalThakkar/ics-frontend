import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth-middleware'
import { getClientIp } from '@/lib/utils'

// Mock schedule data
const mockSchedules = [
  {
    scheduleId: 'schedule-001',
    date: '2025-01-20',
    dayOfWeek: 1, // Monday
    openingTime: '09:00',
    closingTime: '17:00',
    maxAppointments: 50,
    bookedAppointments: 23,
    availableSlots: [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ],
    bookedSlots: [
      '09:30', '10:00', '11:00', '14:00', '15:00'
    ],
    specialNotes: 'Regular working day',
    isHoliday: false,
    holidayReason: null,
    created: '2025-01-01T00:00:00Z',
    updated: '2025-01-17T10:00:00Z'
  },
  {
    scheduleId: 'schedule-002',
    date: '2025-01-26',
    dayOfWeek: 0, // Sunday
    openingTime: null,
    closingTime: null,
    maxAppointments: 0,
    bookedAppointments: 0,
    availableSlots: [],
    bookedSlots: [],
    specialNotes: 'Republic Day - National Holiday',
    isHoliday: true,
    holidayReason: 'Republic Day',
    created: '2025-01-01T00:00:00Z',
    updated: '2025-01-01T00:00:00Z'
  },
  {
    scheduleId: 'schedule-003',
    date: '2025-01-21',
    dayOfWeek: 2, // Tuesday
    openingTime: '09:00',
    closingTime: '17:00',
    maxAppointments: 50,
    bookedAppointments: 35,
    availableSlots: [
      '09:00', '09:30', '10:00', '14:30', '15:00'
    ],
    bookedSlots: [
      '10:30', '11:00', '11:30', '14:00', '15:30', '16:00', '16:30'
    ],
    specialNotes: 'High demand day - limited slots available',
    isHoliday: false,
    holidayReason: null,
    created: '2025-01-01T00:00:00Z',
    updated: '2025-01-17T10:00:00Z'
  }
]

// GET - Fetch schedule
export async function GET(request: NextRequest) {
  try {
    const adminAuth = await verifyAdminToken(request)
    if (!adminAuth.success) {
      return NextResponse.json({ error: adminAuth.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const month = searchParams.get('month')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let schedules = mockSchedules

    if (date) {
      schedules = schedules.filter(schedule => schedule.date === date)
    } else if (month) {
      schedules = schedules.filter(schedule => schedule.date.startsWith(month))
    } else if (startDate && endDate) {
      schedules = schedules.filter(schedule =>
        schedule.date >= startDate && schedule.date <= endDate
      )
    }

    return NextResponse.json({
      success: true,
      schedules
    })

  } catch (error) {
    console.error('Schedule fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create schedule
export async function POST(request: NextRequest) {
  try {
    const adminAuth = await verifyAdminToken(request)
    if (!adminAuth.success) {
      return NextResponse.json({ error: adminAuth.error }, { status: 401 })
    }

    const scheduleData = await request.json()

    const newSchedule = {
      ...scheduleData,
      scheduleId: `schedule-${Date.now()}`,
      bookedAppointments: 0,
      bookedSlots: [],
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    }

    console.log('Schedule created:', {
      action: 'SCHEDULE_CREATE',
      scheduleId: newSchedule.scheduleId,
      date: newSchedule.date,
      adminId: adminAuth.user?.userId,
      ipAddress: getClientIp(request),
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      schedule: newSchedule,
      message: 'Schedule created successfully'
    })

  } catch (error) {
    console.error('Schedule creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update schedule
export async function PUT(request: NextRequest) {
  try {
    const adminAuth = await verifyAdminToken(request)
    if (!adminAuth.success) {
      return NextResponse.json({ error: adminAuth.error }, { status: 401 })
    }

    const { scheduleId, ...updateData } = await request.json()

    if (!scheduleId) {
      return NextResponse.json({ error: 'Schedule ID is required' }, { status: 400 })
    }

    console.log('Schedule updated:', {
      action: 'SCHEDULE_UPDATE',
      scheduleId,
      adminId: adminAuth.user?.userId,
      ipAddress: getClientIp(request),
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Schedule updated successfully'
    })

  } catch (error) {
    console.error('Schedule update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete schedule
export async function DELETE(request: NextRequest) {
  try {
    const adminAuth = await verifyAdminToken(request)
    if (!adminAuth.success) {
      return NextResponse.json({ error: adminAuth.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const scheduleId = searchParams.get('scheduleId')

    if (!scheduleId) {
      return NextResponse.json({ error: 'Schedule ID is required' }, { status: 400 })
    }

    console.log('Schedule deleted:', {
      action: 'SCHEDULE_DELETE',
      scheduleId,
      adminId: adminAuth.user?.userId,
      ipAddress: getClientIp(request),
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Schedule deleted successfully'
    })

  } catch (error) {
    console.error('Schedule deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
