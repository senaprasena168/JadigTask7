import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

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

    // Find user by email
    const foundUser = await prisma.user.findUnique({
      where: { email }
    });

    if (!foundUser) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is verified (temporarily disabled for testing)
    // if (!foundUser.isVerified) {
    //   return NextResponse.json(
    //     { error: 'Please verify your account first' },
    //     { status: 401 }
    //   );
    // }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, foundUser.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Return user data (excluding password)
    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error during login' },
      { status: 500 }
    );
  }
}