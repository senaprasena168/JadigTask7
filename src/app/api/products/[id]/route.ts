import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteImageFromR2, extractImageKey } from '@/lib/r2-storage';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, price, imageUrl, description } = body;

    // Check if product exists first
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Note: Skipping R2 image deletion since imageKey doesn't exist in schema

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        price: parseFloat(price),
        imageUrl: imageUrl || existingProduct.imageUrl,
        description,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    
    // First, get the product to check if it has an image to delete from R2
    const product = await prisma.$queryRaw<
      Array<{
        id: string;
        imageUrl: string | null;
      }>
    >`
      SELECT id, "imageUrl"
      FROM products
      WHERE id = ${id}
      LIMIT 1
    `;

    if (product.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const productData = product[0];

    // If product has an image, try to delete it from R2
    if (productData.imageUrl) {
      try {
        const imageKey = extractImageKey(productData.imageUrl);
        if (imageKey) {
          await deleteImageFromR2(imageKey);
          console.log('Deleted image from R2:', imageKey);
        }
      } catch (r2Error) {
        console.warn('Failed to delete image from R2:', r2Error);
        // Continue with product deletion even if R2 deletion fails
      }
    }

    // Delete product from database using raw SQL
    const deleteResult = await prisma.$executeRaw`
      DELETE FROM products
      WHERE id = ${id}
    `;

    if (deleteResult === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
