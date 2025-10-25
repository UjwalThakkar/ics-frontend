import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth-middleware'
import { getClientIp } from '@/lib/utils'

// Mock users data
const mockUsers = [
  {
    userId: 'user-001',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    email: 'rajesh.kumar@email.com',
    phone: '+27 123 456 789',
    role: 'user',
    status: 'active',
    isVerified: true,
    lastLogin: '2025-01-17T08:30:00Z',
    registeredAt: '2024-12-01T00:00:00Z',
    applications: [
      { applicationId: 'ICS2025001234', serviceType: 'passport-renewal-expiry', status: 'in-progress' },
      { applicationId: 'ICS2024000892', serviceType: 'visa-application', status: 'completed' }
    ],
    profile: {
      passportNumber: 'Z1234567',
      nationality: 'Indian',
      dateOfBirth: '1985-03-15',
      address: 'Johannesburg, South Africa'
    }
  },
  {
    userId: 'user-002',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@email.com',
    phone: '+27 987 654 321',
    role: 'user',
    status: 'active',
    isVerified: true,
    lastLogin: '2025-01-16T14:20:00Z',
    registeredAt: '2024-11-15T00:00:00Z',
    applications: [
      { applicationId: 'ICS2025001235', serviceType: 'oci-application', status: 'pending-review' }
    ],
    profile: {
      passportNumber: 'Z7654321',
      nationality: 'Indian',
      dateOfBirth: '1990-07-22',
      address: 'Cape Town, South Africa'
    }
  },
  {
    userId: 'user-003',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@consulate.gov.in',
    phone: '+27 11 895 0460',
    role: 'admin',
    status: 'active',
    isVerified: true,
    lastLogin: '2025-01-17T10:00:00Z',
    registeredAt: '2024-01-01T00:00:00Z',
    applications: [],
    profile: {
      department: 'Administration',
      position: 'System Administrator',
      permissions: ['users.read', 'users.write', 'applications.read', 'applications.write']
    }
  }
]

// GET - Fetch all users
export async function GET(request: NextRequest) {
  try {
    const adminAuth = await verifyAdminToken(request)
    if (!adminAuth.success) {
      return NextResponse.json({ error: adminAuth.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    let users = mockUsers

    // Filter by role
    if (role) {
      users = users.filter(user => user.role === role)
    }

    // Filter by status
    if (status) {
      users = users.filter(user => user.status === status)
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      users = users.filter(user =>
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      )
    }

    // Pagination
    const startIndex = (page - 1) * limit
    const paginatedUsers = users.slice(startIndex, startIndex + limit)

    return NextResponse.json({
      success: true,
      users: paginatedUsers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(users.length / limit),
        totalUsers: users.length,
        limit
      }
    })

  } catch (error) {
    console.error('Users fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const adminAuth = await verifyAdminToken(request)
    if (!adminAuth.success) {
      return NextResponse.json({ error: adminAuth.error }, { status: 401 })
    }

    const userData = await request.json()

    const newUser = {
      ...userData,
      userId: `user-${Date.now()}`,
      status: 'active',
      isVerified: false,
      registeredAt: new Date().toISOString(),
      applications: []
    }

    console.log('User created:', {
      action: 'USER_CREATE',
      userId: newUser.userId,
      email: newUser.email,
      role: newUser.role,
      adminId: adminAuth.user?.userId,
      ipAddress: getClientIp(request),
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      user: newUser,
      message: 'User created successfully'
    })

  } catch (error) {
    console.error('User creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update user
export async function PUT(request: NextRequest) {
  try {
    const adminAuth = await verifyAdminToken(request)
    if (!adminAuth.success) {
      return NextResponse.json({ error: adminAuth.error }, { status: 401 })
    }

    const { userId, ...updateData } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    console.log('User updated:', {
      action: 'USER_UPDATE',
      userId,
      adminId: adminAuth.user?.userId,
      ipAddress: getClientIp(request),
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'User updated successfully'
    })

  } catch (error) {
    console.error('User update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete user
export async function DELETE(request: NextRequest) {
  try {
    const adminAuth = await verifyAdminToken(request)
    if (!adminAuth.success) {
      return NextResponse.json({ error: adminAuth.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    console.log('User deleted:', {
      action: 'USER_DELETE',
      userId,
      adminId: adminAuth.user?.userId,
      ipAddress: getClientIp(request),
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })

  } catch (error) {
    console.error('User deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
