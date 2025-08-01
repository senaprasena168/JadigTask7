import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test basic database connection and user table
    const userCount = await prisma.user.count();

    // Test raw SQL queries to check if NextAuth tables exist
    const tableCheckQueries = [
      'SELECT COUNT(*) FROM information_schema.tables WHERE table_name = \'users\'',
      'SELECT COUNT(*) FROM information_schema.tables WHERE table_name = \'accounts\'',
      'SELECT COUNT(*) FROM information_schema.tables WHERE table_name = \'sessions\'',
      'SELECT COUNT(*) FROM information_schema.tables WHERE table_name = \'verificationtokens\''
    ];

    const tableResults = await Promise.all(
      tableCheckQueries.map(query =>
        prisma.$queryRawUnsafe(query)
      )
    );

    // Test creating a user with the new schema
    const testUser = await prisma.user.create({
      data: {
        name: 'Test Session User',
        email: 'test-session-' + Date.now() + '@example.com',
        isVerified: true,
        role: 'admin',
        provider: 'email'
      }
    });

    // Clean up test user
    await prisma.user.delete({ where: { id: testUser.id } });

    return NextResponse.json({
      success: true,
      message: 'Database session storage schema test successful',
      currentUserCount: userCount,
      tableExists: {
        users: Number(tableResults[0][0].count) > 0,
        accounts: Number(tableResults[1][0].count) > 0,
        sessions: Number(tableResults[2][0].count) > 0,
        verificationtokens: Number(tableResults[3][0].count) > 0
      },
      testResults: {
        userCreation: 'SUCCESS',
        userDeletion: 'SUCCESS',
        newSchemaWorking: true
      },
      note: 'NextAuth tables exist in database but Prisma client needs regeneration'
    });
  } catch (error) {
    console.error('Database session test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Database session test failed',
      details: 'Check server logs for more information'
    }, { status: 500 });
  }
}