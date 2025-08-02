import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // This is a backdoor - in production, you'd want additional security
    const adminEmail = 'aingmeongshop@gmail.com';
    
    // Check if admin user exists
    const adminUsers = await prisma.$queryRaw<
      Array<{
        id: string;
        name: string | null;
        email: string;
        isAdmin: boolean;
      }>
    >`
      SELECT id, name, email, "isAdmin" FROM users WHERE email = ${adminEmail} LIMIT 1
    `;

    if (adminUsers.length === 0) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }

    const adminUser = adminUsers[0];

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