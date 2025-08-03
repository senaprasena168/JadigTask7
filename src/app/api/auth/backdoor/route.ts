import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // This is a backdoor - in production, you'd want additional security
    const adminEmail = 'aingmeongshop@gmail.com';
    
    // Check if admin user exists in auth_users table
    const adminUser = await prisma.authUser.findUnique({
      where: { email: adminEmail }
    });

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }

    // Return admin user data for client-side session creation
    return NextResponse.json({
      success: true,
      message: 'Backdoor access granted',
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: 'admin'
      }
    });

  } catch (error) {
    console.error('Backdoor login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}