import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET() {
  try {
    console.log('Testing products API...');
    
    const sql = neon(process.env.DATABASE_URL!);
    const products = await sql`SELECT * FROM products ORDER BY created_at DESC`;
    
    return NextResponse.json({
      success: true,
      message: 'Products fetched successfully',
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}