import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check columns in products table specifically
    const productsColumnsQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'products' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    const productsColumns = await prisma.$queryRawUnsafe(productsColumnsQuery);

    // Try to get a sample product to see actual data structure
    const sampleProduct = await prisma.$queryRaw`
      SELECT * FROM products LIMIT 1
    `;

    return NextResponse.json({
      success: true,
      message: 'Products table structure check',
      productsTableColumns: productsColumns,
      sampleProduct: sampleProduct,
      note: 'This shows the actual products table structure'
    });
  } catch (error) {
    console.error('Products table check error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Products table check failed'
    }, { status: 500 });
  }
}