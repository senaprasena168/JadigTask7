import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const adminEmail = 'aingmeongshop@gmail.com';
    const adminPassword = 'aingmeong';
    const adminName = 'Aing Meong Admin';

    // Check if admin already exists
    const existingAdmin = await prisma.authUser.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: 'Admin user already exists',
        user: {
          id: existingAdmin.id,
          email: existingAdmin.email,
          name: existingAdmin.name,
          isAdmin: existingAdmin.isAdmin,
          provider: existingAdmin.provider
        }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Create admin user
    const adminUser = await prisma.authUser.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        provider: 'email',
        isAdmin: true,
        isVerified: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      credentials: {
        email: adminEmail,
        password: adminPassword
      },
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        isAdmin: adminUser.isAdmin,
        provider: adminUser.provider
      }
    });

  } catch (error) {
    console.error('Setup admin error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}