import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protect pages under these paths and redirect to /auth when no session cookie or token
const PROTECTED_PATHS = ['/dashboard', '/instructor', '/app']

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    if (!PROTECTED_PATHS.some(p => pathname.startsWith(p))) {
        return NextResponse.next()
    }

    // Check for bearer token or Supabase session cookie
    const authHeader = req.headers.get('authorization')
    const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null
    const tokenFromCookie = req.cookies.get('sb-access-token')?.value || req.cookies.get('supabase-auth-token')?.value || null

    if (tokenFromHeader || tokenFromCookie) {
        return NextResponse.next()
    }

    const url = req.nextUrl.clone()
    url.pathname = '/auth'
    url.search = `?redirect=${encodeURIComponent(req.nextUrl.pathname)}`
    return NextResponse.redirect(url)
}

export const config = {
    matcher: ['/dashboard/:path*', '/instructor/:path*', '/app/:path*']
}
