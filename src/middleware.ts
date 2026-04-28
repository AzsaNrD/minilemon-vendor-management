import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

const PUBLIC_PATHS = ['/login', '/forgot-password', '/reset-password']

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // API routes: enforce auth only (return 401 JSON, never redirect — browsers
  // would follow the redirect and clients calling response.json() would get
  // HTML and crash with "Unexpected token <"). Role/onboarding checks happen
  // inside each route handler.
  if (pathname.startsWith('/api/')) {
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.next()
  }

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    if (session?.user) {
      const dest = session.user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'
      return NextResponse.redirect(new URL(dest, req.url))
    }
    return NextResponse.next()
  }

  if (!session?.user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (session.user.mustChangePassword && pathname !== '/first-login') {
    return NextResponse.redirect(new URL('/first-login', req.url))
  }

  if (!session.user.mustChangePassword && pathname === '/first-login') {
    const dest = session.user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'
    return NextResponse.redirect(new URL(dest, req.url))
  }

  const isAdminRoute = pathname.startsWith('/admin')
  const isVendorRoute =
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/') ||
    pathname.startsWith('/projects') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/nda') ||
    pathname.startsWith('/documents')

  if (isAdminRoute && session.user.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  if (isVendorRoute && session.user.role !== 'VENDOR') {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url))
  }

  if (session.user.role === 'VENDOR') {
    const status = session.user.vendorStatus
    if (status === 'INACTIVE') {
      return NextResponse.redirect(new URL('/login?error=account_disabled', req.url))
    }
    if (status === 'PENDING_PROFILE' && pathname !== '/profile' && pathname !== '/first-login') {
      return NextResponse.redirect(new URL('/profile', req.url))
    }
    if (
      status === 'PENDING_NDA_SIGN' &&
      pathname !== '/nda' &&
      pathname !== '/profile' &&
      pathname !== '/first-login'
    ) {
      return NextResponse.redirect(new URL('/nda', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|api/auth).*)'],
}
