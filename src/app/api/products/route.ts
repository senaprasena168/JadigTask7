import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Use raw SQL to get all products with actual database structure (UUID string IDs)
    const products = await prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        price: number;
        description: string | null;
        imageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
      }>
    >`
      SELECT id, name, price, description, "imageUrl", "createdAt", "updatedAt"
      FROM products
      ORDER BY "createdAt" DESC
    `;

    return NextResponse.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error) {
    console.error('API Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('POST /api/products - Received body:', body);

    const { name, price, imageUrl, description, image, imageId } = body;
    
    // Handle field mapping - frontend sends 'image' but we need 'imageUrl'
    const finalImageUrl = imageUrl || image || imageId;

    if (!name || !price) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name and price are required',
        },
        { status: 400 }
      );
    }

    // Create new product using raw SQL - generate UUID for id field and include all required fields
    const result = await prisma.$executeRaw`
      INSERT INTO products (id, name, price, description, "imageUrl", category, "inStock", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${name}, ${parseFloat(price)}, ${description || null}, ${finalImageUrl || null}, null, true, NOW(), NOW())
    `;

    // Get the created product
    const newProduct = await prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        price: number;
        description: string | null;
        imageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
      }>
    >`
      SELECT id, name, price, description, "imageUrl", "createdAt", "updatedAt"
      FROM products
      WHERE name = ${name} AND price = ${parseFloat(price)}
      ORDER BY "createdAt" DESC
      LIMIT 1
    `;

    const createdProduct = newProduct[0];
    console.log('POST /api/products - Created product:', createdProduct);

    return NextResponse.json({
      success: true,
      data: createdProduct,
      message: 'Product created successfully',
    });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create product',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
