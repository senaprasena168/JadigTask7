// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './auth';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  console.log('🔥 Middleware triggered for:', pathname);

  // Skip middleware for static files and most API routes, but handle OAuth routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    (pathname.includes('.') && !pathname.startsWith('/api/auth/'))
  ) {
    return NextResponse.next();
  }

  // Get session using NextAuth
  let session = null;
  try {
    session = await auth();
    console.log('🔐 NextAuth session:', !!session, session?.user?.email);
  } catch (error) {
    console.warn('⚠️ NextAuth session check failed:', error);
  }

  const isAuthenticated = !!session?.user;

  // Handle OAuth routes - prevent authenticated users from accessing OAuth flows
  if (pathname.startsWith('/api/auth/signin') || pathname.startsWith('/api/auth/callback')) {
    if (isAuthenticated) {
      console.log('🚫 Authenticated user trying to access OAuth flow, redirecting based on role');
      const userRole = session?.user?.role;
      const isAdmin = userRole === 'admin';
      const redirectUrl = isAdmin ? '/admin' : '/products';
      const response = NextResponse.redirect(new URL(redirectUrl, request.url));
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      return response;
    }
    // Allow unauthenticated users to access OAuth flows
    return NextResponse.next();
  }

  // Handle other NextAuth API routes (session, csrf, etc.) - allow these
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Handle login page access
  if (pathname === '/login') {
    if (isAuthenticated) {
      console.log('🔄 Authenticated user accessing login page, redirecting');
      const userRole = session?.user?.role;
      const isAdmin = userRole === 'admin';
      const defaultRedirect = isAdmin ? '/admin' : '/products';
      const redirect = request.nextUrl.searchParams.get('redirect') || defaultRedirect;
      const response = NextResponse.redirect(new URL(redirect, request.url));
      // Add headers to prevent caching and force replace
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      return response;
    }
    // Allow unauthenticated users to access login page
    return NextResponse.next();
  }

  // Handle admin routes
  if (pathname.startsWith('/admin')) {
    console.log('🔒 Admin route detected, checking authentication and admin role...');

    if (!isAuthenticated) {
      // Not authenticated, redirect to login
      console.log('❌ No authentication found, redirecting to login');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      // Add headers to prevent caching and force replace
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      return response;
    }

    // Check if user has admin role
    const userRole = session?.user?.role;
    const isAdmin = userRole === 'admin';
    
    if (!isAdmin) {
      console.log('❌ User authenticated but not admin, redirecting to products');
      // Redirect non-admin users to products page
      const response = NextResponse.redirect(new URL('/products', request.url));
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      return response;
    }

    console.log('✅ User authenticated and is admin, allowing access');
    return NextResponse.next();
  }

  // Handle root path
  if (pathname === '/') {
    // Allow all users (authenticated and unauthenticated) to access home page
    // Remove automatic redirect to admin for authenticated users
    console.log('🏠 User accessing home page, allowing access');
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};