import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth-middleware'
import { getClientIp } from '@/lib/utils'

// Mock banners data
const mockBanners = [
  {
    bannerId: 'banner-001',
    title: 'Important Notice',
    subtitle: 'Updated Passport Application Process',
    content: 'New requirements for passport applications effective from January 2025. Please review the updated documentation.',
    type: 'warning',
    isActive: true,
    priority: 1,
    startDate: '2025-01-01T00:00:00Z',
    endDate: '2025-03-31T23:59:59Z',
    targetPages: ['home', 'apply'],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-15T10:30:00Z'
  },
  {
    bannerId: 'banner-002',
    title: 'Holiday Schedule',
    subtitle: 'Consulate Closure Dates',
    content: 'The consulate will be closed on Republic Day (26 Jan) and Holi (14 Mar). Plan your visits accordingly.',
    type: 'info',
    isActive: true,
    priority: 2,
    startDate: '2025-01-15T00:00:00Z',
    endDate: '2025-03-15T23:59:59Z',
    targetPages: ['home', 'appointment'],
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z'
  },
  {
    bannerId: 'banner-003',
    title: 'New Service Available',
    subtitle: 'Online Document Verification',
    content: 'We now offer online document verification services. Submit your documents digitally for faster processing.',
    type: 'success',
    isActive: true,
    priority: 3,
    startDate: '2025-01-10T00:00:00Z',
    endDate: '2025-06-30T23:59:59Z',
    targetPages: ['home', 'services'],
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z'
  }
]

// GET - Fetch all banners
export async function GET(request: NextRequest) {
  try {
    const adminAuth = await verifyAdminToken(request)
    if (!adminAuth.success) {
      return NextResponse.json({ error: adminAuth.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') === 'true'
    const page = searchParams.get('page') || 'all'

    let banners = mockBanners

    if (activeOnly) {
      banners = banners.filter(banner => banner.isActive)
    }

    if (page !== 'all') {
      banners = banners.filter(banner => banner.targetPages.includes(page))
    }

    // Sort by priority
    banners.sort((a, b) => a.priority - b.priority)

    return NextResponse.json({
      success: true,
      banners
    })

  } catch (error) {
    console.error('Banners fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new banner
export async function POST(request: NextRequest) {
  try {
    const adminAuth = await verifyAdminToken(request)
    if (!adminAuth.success) {
      return NextResponse.json({ error: adminAuth.error }, { status: 401 })
    }

    const bannerData = await request.json()

    const newBanner = {
      ...bannerData,
      bannerId: `banner-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    console.log('Banner created:', {
      action: 'BANNER_CREATE',
      bannerId: newBanner.bannerId,
      adminId: adminAuth.user?.userId,
      ipAddress: getClientIp(request),
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      banner: newBanner,
      message: 'Banner created successfully'
    })

  } catch (error) {
    console.error('Banner creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update banner
export async function PUT(request: NextRequest) {
  try {
    const adminAuth = await verifyAdminToken(request)
    if (!adminAuth.success) {
      return NextResponse.json({ error: adminAuth.error }, { status: 401 })
    }

    const { bannerId, ...updateData } = await request.json()

    if (!bannerId) {
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 })
    }

    console.log('Banner updated:', {
      action: 'BANNER_UPDATE',
      bannerId,
      adminId: adminAuth.user?.userId,
      ipAddress: getClientIp(request),
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Banner updated successfully'
    })

  } catch (error) {
    console.error('Banner update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete banner
export async function DELETE(request: NextRequest) {
  try {
    const adminAuth = await verifyAdminToken(request)
    if (!adminAuth.success) {
      return NextResponse.json({ error: adminAuth.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const bannerId = searchParams.get('bannerId')

    if (!bannerId) {
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 })
    }

    console.log('Banner deleted:', {
      action: 'BANNER_DELETE',
      bannerId,
      adminId: adminAuth.user?.userId,
      ipAddress: getClientIp(request),
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Banner deleted successfully'
    })

  } catch (error) {
    console.error('Banner deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
