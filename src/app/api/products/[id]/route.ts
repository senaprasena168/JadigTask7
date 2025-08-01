import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteImageFromSupabase, extractSupabaseImageKey } from '@/lib/supabase-storage';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Use raw SQL to get product with actual database structure (UUID string ID)
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
      WHERE id = ${id}
      LIMIT 1
    `;

    if (products.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(products[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, price, imageUrl, description } = body;

    // Check if product exists first using raw SQL
    const existingProducts = await prisma.$queryRaw<
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

    if (existingProducts.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const existingProduct = existingProducts[0];

    // Update product using raw SQL
    await prisma.$executeRaw`
      UPDATE products
      SET name = ${name},
          price = ${parseFloat(price)},
          "imageUrl" = ${imageUrl || existingProduct.imageUrl},
          description = ${description},
          "updatedAt" = NOW()
      WHERE id = ${id}
    `;

    // Get updated product
    const updatedProducts = await prisma.$queryRaw<
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
      WHERE id = ${id}
      LIMIT 1
    `;

    return NextResponse.json(updatedProducts[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // First, get the product to check if it has an image to delete from Supabase
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

    // If product has an image, try to delete it from Supabase
    if (productData.imageUrl) {
      try {
        const imageKey = extractSupabaseImageKey(productData.imageUrl);
        if (imageKey) {
          await deleteImageFromSupabase(imageKey);
          console.log('Deleted image from Supabase:', imageKey);
        }
      } catch (supabaseError) {
        console.warn('Failed to delete image from Supabase:', supabaseError);
        // Continue with product deletion even if Supabase deletion fails
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
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
