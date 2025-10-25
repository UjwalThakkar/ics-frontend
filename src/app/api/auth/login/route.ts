import { NextRequest, NextResponse } from 'next/server'
import {
  SecurityUtils,
  InputValidator,
  RateLimitManager,
  SessionManager,
  SecurityLogger,
  SecurityHeaders
} from '@/lib/security'

// Mock admin users with enhanced security
const adminUsers = [
  {
    userId: 'ADMIN001',
    username: 'officer123',
    email: 'admin@consular.gov.in',
    passwordHash: '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // demo2025
    role: 'admin',
    profile: {
      firstName: 'Consular',
      lastName: 'Officer'
    },
    isActive: true,
    failedAttempts: 0,
    lastLogin: null,
    twoFactorEnabled: true
  }
]

export async function POST(request: NextRequest) {
  const clientIP = request.headers.get('x-forwarded-for') || request.ip || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'

  try {
    // Rate limiting check
    if (RateLimitManager.isRateLimited(clientIP, 5, 900000)) { // 5 attempts per 15 minutes
      SecurityLogger.logSecurityEvent(
        'LOGIN_RATE_LIMITED',
        { ip: clientIP, userAgent },
        'high',
        clientIP
      )

      return NextResponse.json(
        {
          error: 'Too many login attempts. Please try again in 15 minutes.',
          code: 'RATE_LIMITED'
        },
        { status: 429 }
      )
    }

    const body = await request.json()

    // Input validation and sanitization
    const { username, password, otp } = InputValidator.sanitizeInput(body)

    if (!username || !password) {
      SecurityLogger.logSecurityEvent(
        'LOGIN_MISSING_CREDENTIALS',
        { ip: clientIP, userAgent, username: username || 'missing' },
        'medium',
        clientIP
      )

      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Additional input validation
    if (InputValidator.containsSQLInjection(username) || InputValidator.containsSQLInjection(password)) {
      SecurityLogger.logSecurityEvent(
        'LOGIN_SQL_INJECTION_ATTEMPT',
        { ip: clientIP, userAgent, username },
        'critical',
        clientIP
      )

      RateLimitManager.addFailedAttempt(clientIP)
      return NextResponse.json(
        { error: 'Invalid input detected' },
        { status: 400 }
      )
    }

    // Find user
    const user = adminUsers.find(u => u.username === username && u.isActive)

    if (!user) {
      SecurityLogger.logSecurityEvent(
        'LOGIN_USER_NOT_FOUND',
        { ip: clientIP, userAgent, username },
        'medium',
        clientIP
      )

      RateLimitManager.addFailedAttempt(clientIP)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if account is locked due to failed attempts
    if (user.failedAttempts >= 5) {
      SecurityLogger.logSecurityEvent(
        'LOGIN_ACCOUNT_LOCKED',
        { ip: clientIP, userAgent, userId: user.userId },
        'high',
        clientIP
      )

      return NextResponse.json(
        { error: 'Account temporarily locked due to multiple failed attempts' },
        { status: 423 }
      )
    }

    // Verify password (in production, use proper bcrypt comparison)
    const isValidPassword = password === 'demo2025' // Simplified for demo

    if (!isValidPassword) {
      user.failedAttempts++

      SecurityLogger.logSecurityEvent(
        'LOGIN_INVALID_PASSWORD',
        { ip: clientIP, userAgent, userId: user.userId, failedAttempts: user.failedAttempts },
        'medium',
        clientIP
      )

      RateLimitManager.addFailedAttempt(clientIP)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Two-factor authentication check
    if (user.twoFactorEnabled) {
      if (!otp || otp.length !== 6) {
        SecurityLogger.logSecurityEvent(
          'LOGIN_2FA_REQUIRED',
          { ip: clientIP, userAgent, userId: user.userId },
          'low',
          clientIP
        )

        return NextResponse.json({
          requiresTwoFactor: true,
          message: 'Two-factor authentication code required'
        }, { status: 200 })
      }

      // Validate OTP (simplified for demo - accepts any 6 digits)
      if (!/^\d{6}$/.test(otp)) {
        SecurityLogger.logSecurityEvent(
          'LOGIN_INVALID_2FA',
          { ip: clientIP, userAgent, userId: user.userId },
          'medium',
          clientIP
        )

        RateLimitManager.addFailedAttempt(clientIP)
        return NextResponse.json(
          { error: 'Invalid two-factor authentication code' },
          { status: 401 }
        )
      }
    }

    // Successful login - reset failed attempts and create session
    user.failedAttempts = 0
    user.lastLogin = new Date().toISOString()

    // Create secure session
    const sessionId = SessionManager.createSession(user.userId, clientIP, userAgent)

    // Generate secure token
    const token = SecurityUtils.generateSecureToken(64)

    SecurityLogger.logSecurityEvent(
      'LOGIN_SUCCESS',
      {
        ip: clientIP,
        userAgent,
        userId: user.userId,
        sessionId: sessionId.substring(0, 8) + '...' // Log partial session ID for tracking
      },
      'low',
      clientIP
    )

    // Reset rate limiting for this IP on successful login
    RateLimitManager.resetAttempts(clientIP)

    const response = NextResponse.json({
      success: true,
      user: {
        userId: user.userId,
        email: user.email,
        role: user.role,
        profile: user.profile
      },
      token,
      sessionId
    })

    // Set secure HTTP-only cookies
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    })

    response.cookies.set('session-id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    })

    // Apply security headers
    return SecurityHeaders.applyHeaders(response)

  } catch (error) {
    SecurityLogger.logSecurityEvent(
      'LOGIN_ERROR',
      {
        ip: clientIP,
        userAgent,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      'high',
      clientIP
    )

    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Logout endpoint
export async function DELETE(request: NextRequest) {
  const clientIP = request.headers.get('x-forwarded-for') || request.ip || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'

  try {
    const sessionId = request.cookies.get('session-id')?.value

    if (sessionId) {
      SessionManager.destroySession(sessionId)

      SecurityLogger.logSecurityEvent(
        'LOGOUT_SUCCESS',
        { ip: clientIP, userAgent, sessionId: sessionId.substring(0, 8) + '...' },
        'low',
        clientIP
      )
    }

    const response = NextResponse.json({ success: true, message: 'Logged out successfully' })

    // Clear cookies
    response.cookies.delete('auth-token')
    response.cookies.delete('session-id')

    return SecurityHeaders.applyHeaders(response)

  } catch (error) {
    SecurityLogger.logSecurityEvent(
      'LOGOUT_ERROR',
      {
        ip: clientIP,
        userAgent,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      'medium',
      clientIP
    )

    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}
