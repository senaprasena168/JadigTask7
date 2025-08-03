// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './auth';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static files and API routes (except auth)
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    (pathname.includes('.') && !pathname.startsWith('/api/auth/'))
  ) {
    return NextResponse.next();
  }

  // Allow all NextAuth API routes to pass through
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Get session using NextAuth
  let session = null;
  try {
    session = await auth();
  } catch (error) {
    console.warn('NextAuth session check failed:', error);
  }

  const isAuthenticated = !!session?.user;


  // Handle admin routes - require authentication and admin role
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      // Redirect to home page where login modal can be triggered
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Check if user has admin role
    const userRole = session?.user?.role;
    if (userRole !== 'admin') {
      // Redirect non-admin users to products page
      return NextResponse.redirect(new URL('/products', request.url));
    }

    return NextResponse.next();
  }

  // Allow all other routes
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
