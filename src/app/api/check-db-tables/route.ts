import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check what tables actually exist in the database
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    const tables = await prisma.$queryRawUnsafe(tablesQuery);

    // Check columns in users table specifically
    const userColumnsQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    const userColumns = await prisma.$queryRawUnsafe(userColumnsQuery);

    return NextResponse.json({
      success: true,
      message: 'Database table structure check',
      tables: tables,
      userTableColumns: userColumns,
      note: 'This shows the actual database structure vs Prisma schema'
    });
  } catch (error) {
    console.error('Database table check error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Database table check failed'
    }, { status: 500 });
  }
}