import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test Prisma connection and get counts
    const [productCount, userCount] = await Promise.all([
      prisma.product.count(),
      prisma.user.count()
    ]);
    
    return NextResponse.json({
      success: true,
      productCount,
      userCount,
      message: 'Prisma database connection successful'
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Database connection failed'
    }, { status: 500 });
  }
}