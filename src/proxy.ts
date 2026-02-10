import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
    const response = NextResponse.next()

    // ───────────────────────────────────────────
    // 1. Security Headers
    // ───────────────────────────────────────────
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=()'
    )

    // ───────────────────────────────────────────
    // 2. Cookie-based auth protection
    // ───────────────────────────────────────────
    const token = request.cookies.get('access_token')?.value
    const isAuthPage = request.nextUrl.pathname.startsWith('/login')

    if (!token && !isAuthPage) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (token && isAuthPage) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api routes (handled by route handlers)
         * - _next (static files, images, etc.)
         * - static files (favicon, manifest, etc.)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|logoHL.png|apple-touch-icon.png|icon-.*\\.png|manifest.json|sw.js|.*\\.svg).*)',
    ],
}
