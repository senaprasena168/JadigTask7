import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, otpCode } = await request.json();

    // Validate input
    if (!email || !otpCode) {
      return NextResponse.json(
        { error: 'Email and OTP code are required' },
        { status: 400 }
      );
    }

    // Find user by email with OTP details
    const result = await prisma.$queryRaw`
      SELECT id, name, email, "isVerified", "otpCode", "otpExpiry"
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `;

    const users = Array.isArray(result) ? result : [result];
    const user = users[0];

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        { error: 'User is already verified' },
        { status: 400 }
      );
    }

    if (!user.otpCode || !user.otpExpiry) {
      return NextResponse.json(
        { error: 'No OTP found. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    const now = new Date();
    const otpExpiry = new Date(user.otpExpiry);
    
    if (now > otpExpiry) {
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Verify OTP code
    if (user.otpCode !== otpCode.toString()) {
      return NextResponse.json(
        { error: 'Invalid OTP code. Please check and try again.' },
        { status: 400 }
      );
    }

    // OTP is valid - verify the user
    await prisma.$queryRaw`
      UPDATE users
      SET "isVerified" = true, "otpCode" = NULL, "otpExpiry" = NULL, "updatedAt" = NOW()
      WHERE id = ${user.id}
    `;

    return NextResponse.json({
      message: 'Email verified successfully! You can now log in.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isVerified: true
      }
    }, { status: 200 });

  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error during OTP verification' },
      { status: 500 }
    );
  }
}