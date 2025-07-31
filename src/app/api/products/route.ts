import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Use raw SQL to get all products with actual database structure
    const products = await prisma.$queryRaw<Array<{
      id: number;
      name: string;
      price: number;
      description: string | null;
      imageUrl: string | null;
      category: string | null;
      inStock: boolean;
      createdAt: Date;
      updatedAt: Date;
    }>>`
      SELECT id, name, price, description, "imageUrl", category, "inStock", "createdAt", "updatedAt"
      FROM products
      ORDER BY "createdAt" DESC
    `;
    
    return NextResponse.json({
      success: true,
      data: products,
      count: products.length
    });
    
  } catch (error) {
    console.error('API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('POST /api/products - Received body:', body);
    
    // Handle both 'image' and 'imageUrl' for backward compatibility
    const { name, price, image, imageUrl, imageKey, imageType, description, imageId } = body;
    const finalImageUrl = imageUrl || image;

    if (!name || !price) {
      return NextResponse.json({
        success: false,
        error: 'Name and price are required'
      }, { status: 400 });
    }

    let newProduct;
    
    if (imageId) {
      // Update existing product record using raw SQL
      const result = await prisma.$queryRaw<Array<{
        id: number;
        name: string;
        price: number;
        description: string | null;
        imageUrl: string | null;
      }>>`
        UPDATE products
        SET name = ${name},
            price = ${parseFloat(price)},
            description = ${description || null},
            "imageUrl" = ${finalImageUrl || null},
            "updatedAt" = NOW()
        WHERE id = ${parseInt(imageId)}
        RETURNING id, name, price, description, "imageUrl"
      `;
      newProduct = result[0];
    } else {
      // Create new product using raw SQL with generated ID
      const result = await prisma.$queryRaw<Array<{
        id: string;
        name: string;
        price: number;
        description: string | null;
        imageUrl: string | null;
      }>>`
        INSERT INTO products (id, name, price, description, "imageUrl", category, "inStock", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${name}, ${parseFloat(price)}, ${description || null}, ${finalImageUrl || null}, 'general', true, NOW(), NOW())
        RETURNING id, name, price, description, "imageUrl"
      `;
      newProduct = result[0];
    }

    console.log('POST /api/products - Created product:', newProduct);

    return NextResponse.json({
      success: true,
      data: newProduct,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create product',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
