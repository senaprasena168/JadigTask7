import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all products with clean data structure
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        imageUrl: true,
        imageType: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
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
      // Update existing product record (created during image upload)
      newProduct = await prisma.product.update({
        where: { id: parseInt(imageId) },
        data: {
          name,
          price: parseFloat(price),
          description: description || null,
          imageUrl: finalImageUrl || null,
          imageKey: imageKey || null,
          imageType: imageType || null,
          updatedAt: new Date()
        }
      });
    } else {
      // Create new product
      newProduct = await prisma.product.create({
        data: {
          name,
          price: parseFloat(price),
          description: description || null,
          imageUrl: finalImageUrl || null,
          imageKey: imageKey || null,
          imageType: imageType || null
        }
      });
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
