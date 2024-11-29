import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { decrypt } from '@/auth/session-server-only'

// 1. Specify protected and public routes
const protectedRoutes = ['/planos']
const publicRoutes = [
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/password-reset',
  '/verify-email',
]

export async function middleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const pathname = req.nextUrl.pathname
  // console.log(pathname)
  const isProtectedRoute =
    protectedRoutes.includes(pathname) || pathname.startsWith('/o')
  // console.log(isProtectedRoute)
  const isPublicRoute = publicRoutes.includes(pathname)
  // console.log(isPublicRoute)

  // 3. Decrypt the session from the cookie
  try {
    const cookie = cookies().get('access_token')?.value
    const session = await decrypt(cookie)
    // console.log(session)
    if (isProtectedRoute && session?.sub) {
      if (pathname.startsWith('/o')) {
        const [, , orgSlug] = pathname.split('/')
        // console.log(orgSlug)
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
        const response = NextResponse.next()
        response.cookies.set({
          name: 'organization',
          value: orgSlug,
          expires: expiresAt,
          path: '/',
        })
        return response
      }
    }
    if (isProtectedRoute && !session?.sub) {
      // console.log('isProtectedRoute')
      return NextResponse.redirect(new URL('/sign-in', req.nextUrl))
    }
    if (isPublicRoute && session?.sub) {
      // console.log('isPublicRoute')
      const orgSlug = cookies().get('organization')?.value
      if (orgSlug) {
        return NextResponse.redirect(
          new URL(`/o/${orgSlug}/dashboard`, req.nextUrl),
        )
      }
      return NextResponse.redirect(new URL('/o', req.nextUrl))
    }
    // console.log('session')
  } catch (error) {
    return NextResponse.redirect(new URL('/sign-in', req.nextUrl))
  }

  return NextResponse.next()
}
