import { NextRequest, NextResponse } from 'next/server'
import { SecurityMiddleware, SecurityHeaders, SecurityLogger } from '@/lib/security'

export async function middleware(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Apply security middleware
    const securityResponse = await SecurityMiddleware.apply(request)
    if (securityResponse) {
      return securityResponse
    }

    // Continue with the request
    const response = NextResponse.next()

    // Apply security headers
    SecurityHeaders.applyHeaders(response)

    // Add performance headers
    const duration = Date.now() - startTime
    response.headers.set('X-Response-Time', `${duration}ms`)

    // Log security-relevant requests
    if (request.nextUrl.pathname.startsWith('/admin') ||
        request.nextUrl.pathname.startsWith('/api/admin')) {
      SecurityLogger.logSecurityEvent(
        'ADMIN_ACCESS',
        {
          path: request.nextUrl.pathname,
          method: request.method,
          userAgent: request.headers.get('user-agent'),
          duration
        },
        'medium',
        request.headers.get('x-forwarded-for') || request.ip
      )
    }

    return response

  } catch (error) {
    // Log security middleware errors
    SecurityLogger.logSecurityEvent(
      'MIDDLEWARE_ERROR',
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        path: request.nextUrl.pathname,
        method: request.method
      },
      'high',
      request.headers.get('x-forwarded-for') || request.ip
    )

    // Continue with the request even if security middleware fails
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
