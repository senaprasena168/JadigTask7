import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

// Generate secure session token
function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user in auth_users table (same table as NextAuth)
    const user = await prisma.authUser.findUnique({
      where: { 
        email: email,
        provider: 'email' // Only credentials users
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is verified
    if (!user.isVerified) {
      return NextResponse.json(
        { error: 'Please verify your email before logging in' },
        { status: 401 }
      );
    }

    // Validate password
    if (!user.password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create session token
    const sessionToken = generateSessionToken();
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Store session in same table as NextAuth (auth_sessions)
    await prisma.authSession.create({
      data: {
        sessionToken,
        userId: user.id,
        expires
      }
    });

    // Determine user role
    const isSpecificAdmin = user.email === 'aingmeongshop@gmail.com';
    const userRole = user.isAdmin && isSpecificAdmin ? 'admin' : 'user';

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: userRole
      }
    });

    // Set HTTP-only cookie (same name as NextAuth for compatibility)
    response.cookies.set('authjs.session-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Custom login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}