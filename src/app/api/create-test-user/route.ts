import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Create a test user with the actual database structure
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    // Use raw SQL to insert user with correct column names
    const result = await prisma.$executeRaw`
      INSERT INTO users (id, name, email, password, "isAdmin", "isVerified", provider, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), 'Test Admin', 'admin@test.com', ${hashedPassword}, true, true, 'email', NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET
        password = ${hashedPassword},
        "isAdmin" = true,
        "isVerified" = true,
        "updatedAt" = NOW()
    `;
    
    return NextResponse.json({
      success: true,
      message: 'Test user created/updated successfully',
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