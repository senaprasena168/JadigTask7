import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Create the proper admin user with specified credentials
    const hashedPassword = await bcrypt.hash('aingmeong', 12);
    
    // Use raw SQL to insert user with correct column names
    const result = await prisma.$executeRaw`
      INSERT INTO users (id, name, email, password, "isAdmin", "isVerified", provider, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), 'aing meong', 'aingmeongshop@gmail.com', ${hashedPassword}, true, true, 'email', NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET
        password = ${hashedPassword},
        "isAdmin" = true,
        "isVerified" = true,
        "updatedAt" = NOW()
    `;
    
    return NextResponse.json({
      success: true,
      message: 'Admin user created/updated successfully',
      credentials: {
        name: 'aing meong',
        email: 'aingmeongshop@gmail.com',
        password: 'aingmeong'
      },
      result
    });
  } catch (error) {
    console.error('Create test user error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}