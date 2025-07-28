import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from './auth'

export async function middleware(request: NextRequest) {
  console.log('🔥 Middleware triggered for:', request.nextUrl.pathname)
  
  // Skip middleware for NextAuth API routes to prevent conflicts
  if (request.nextUrl.pathname.startsWith('/api/auth/')) {
    console.log('🔄 Skipping middleware for NextAuth API route')
    return NextResponse.next()
  }
  
  // Check if the request is for an admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    console.log('🔒 Admin route detected, checking authentication...')
    
    try {
      // First check NextAuth.js session
      const session = await auth()
      console.log('🔐 NextAuth session:', !!session, session?.user?.email)
      
      if (session?.user) {
        console.log('✅ NextAuth user authenticated, allowing access')
        return NextResponse.next()
      }
    } catch (error) {
      console.warn('⚠️ NextAuth session check failed:', error)
    }
    
    // Fallback: Check custom auth cookie for email/password login
    const authCookie = request.cookies.get('auth')
    console.log('🍪 Custom auth cookie exists:', !!authCookie)
    
    if (authCookie) {
      try {
        // Parse the auth cookie to verify authentication
        const authData = JSON.parse(authCookie.value)
        console.log('📋 Custom auth data:', { isAuthenticated: authData.isAuthenticated, role: authData.user?.role })
        
        // Check if user is authenticated and has admin role
        if (authData.isAuthenticated && authData.user?.role === 'admin') {
          console.log('✅ Custom auth user authenticated as admin, allowing access')
          return NextResponse.next()
        }
      } catch (error) {
        console.warn('💥 Invalid custom auth cookie:', error)
        // Clear invalid cookie
        const response = NextResponse.redirect(new URL('/login', request.url))
        response.cookies.delete('auth')
        return response
      }
    }
    
    // No valid authentication found, redirect to login
    console.log('❌ No valid authentication found, redirecting to login')
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*'
}