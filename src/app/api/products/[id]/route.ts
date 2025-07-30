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
        imageKey: true,
        imageType: true,
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
    const { name, price, imageUrl, imageKey, imageType, description } = body;

    // Check if product exists first
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // If there's a new image and an old one exists, delete the old one from R2
    if (imageKey && existingProduct.imageKey && existingProduct.imageKey !== imageKey) {
      await deleteImageFromR2(existingProduct.imageKey);
    }

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        price: parseFloat(price),
        imageUrl: imageUrl || existingProduct.imageUrl,
        imageKey: imageKey || existingProduct.imageKey,
        imageType: imageType || existingProduct.imageType,
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
    
    // Get product first to check if it has an image to delete from R2
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, imageKey: true }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Delete image from R2 if it exists
    if (product.imageKey) {
      await deleteImageFromR2(product.imageKey);
    }

    // Delete product from database
    await prisma.product.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
